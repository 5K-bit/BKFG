const express = require("express");
const crypto = require("crypto");
const dotenv = require("dotenv");
const { parseTipIntent, sendBkfgTip, sendEeveeTip } = require("./tips");
const { getWallets, setWallets } = require("./registry");
const { recordTip, getVelocityMetrics } = require("./velocity");

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 4000;
const webhookPath = process.env.NEYNAR_WEBHOOK_PATH || "/webhook/farcaster";

app.use(
  express.json({
    limit: "1mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

const verifySignature = (req) => {
  const secret = process.env.NEYNAR_WEBHOOK_SECRET;
  if (!secret) {
    return true;
  }

  const header =
    req.get("x-neynar-signature") || req.get("X-Neynar-Signature") || "";
  if (!header) {
    return false;
  }
  const signature = header.replace("sha256=", "");
  const payload = req.rawBody || Buffer.from("");
  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac));
  } catch (error) {
    return false;
  }
};

app.post(webhookPath, async (req, res) => {
  if (!verifySignature(req)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const event = req.body || {};
  const cast = event.data?.cast || event.cast || event;
  const text = cast.text || cast.body?.text || "";
  const mentioned = cast.mentioned_profiles || cast.mentions || [];
  const mentionedFids = mentioned.map((profile) => profile.fid).filter(Boolean);
  const intent = parseTipIntent(text, mentionedFids);

  if (!intent) {
    return res.json({ ok: true, ignored: true });
  }
  if (!intent.targetFid) {
    return res.status(400).json({ error: "Missing recipient fid." });
  }

  const recipient = getWallets(intent.targetFid);
  if (!recipient) {
    return res.status(404).json({ error: "Recipient not linked." });
  }

  let txHash;
  if (intent.token === "BKFG") {
    if (!recipient.baseAddress) {
      return res.status(400).json({ error: "Recipient Base wallet missing." });
    }
    txHash = await sendBkfgTip({
      toAddress: recipient.baseAddress,
      amount: intent.amount,
    });
  } else {
    if (!recipient.solAddress) {
      return res.status(400).json({ error: "Recipient Solana wallet missing." });
    }
    txHash = await sendEeveeTip({
      toAddress: recipient.solAddress,
      amount: intent.amount,
    });
  }

  const metrics = recordTip({
    token: intent.token,
    amount: intent.amount,
    fromFid: cast.author?.fid,
    toFid: intent.targetFid,
    txHash,
  });

  return res.json({ ok: true, txHash, metrics });
});

app.post("/link", (req, res) => {
  try {
    const { fid, baseAddress, solAddress } = req.body || {};
    const entry = setWallets(fid, { baseAddress, solAddress });
    res.json({ ok: true, entry });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/metrics", (req, res) => {
  res.json(getVelocityMetrics());
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Tip bot listening on http://localhost:${port}`);
});
