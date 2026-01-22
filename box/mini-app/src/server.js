const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const {
  fetchHoldings,
  calculateBlackfongPower,
  fetchVelocityMetrics,
} = require("./power");
const { buildBridgePlan } = require("./bridge");
const { frameHtml, frameImageSvg } = require("./frame");

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;
const publicDir = path.join(__dirname, "..", "public");

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(publicDir));

const resolveBaseUrl = (req) =>
  process.env.FRAME_BASE_URL || `${req.protocol}://${req.get("host")}`;

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/frame", (req, res) => {
  res.set("Content-Type", "text/html");
  res.send(frameHtml({ baseUrl: resolveBaseUrl(req) }));
});

app.post("/frame", (req, res) => {
  res.set("Content-Type", "text/html");
  res.send(frameHtml({ baseUrl: resolveBaseUrl(req), message: "Open app" }));
});

app.get("/frame-image", (req, res) => {
  const power = req.query.power || "Link wallets";
  res.set("Content-Type", "image/svg+xml");
  res.send(frameImageSvg(String(power)));
});

app.post("/api/power", async (req, res) => {
  try {
    const { baseAddress, solAddress } = req.body || {};
    const holdings = await fetchHoldings({ baseAddress, solAddress });
    const velocityMetrics = await fetchVelocityMetrics();
    const velocityBoost = Number(velocityMetrics.velocityIndex || 0);

    const power = calculateBlackfongPower({
      holdings,
      velocityBoost,
    });

    res.json({
      power,
      holdings,
      warnings: holdings.warnings,
      velocityBoost,
      velocityMetrics,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/bridge", (req, res) => {
  try {
    const plan = buildBridgePlan(req.body || {});
    res.json(plan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/velocity", async (req, res) => {
  try {
    const metrics = await fetchVelocityMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Mini app running on http://localhost:${port}`);
});
