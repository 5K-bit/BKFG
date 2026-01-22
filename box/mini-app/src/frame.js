const frameHtml = ({ baseUrl, message = "Open mini app" }) => {
  const safeBaseUrl = baseUrl.replace(/\/$/, "");
  const imageUrl = `${safeBaseUrl}/frame-image?power=${encodeURIComponent(
    "Blackfong Power"
  )}`;
  const postUrl = `${safeBaseUrl}/frame`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${imageUrl}" />
    <meta property="fc:frame:post_url" content="${postUrl}" />
    <meta property="fc:frame:button:1" content="${message}" />
    <meta property="fc:frame:button:1:action" content="link" />
    <meta property="fc:frame:button:1:target" content="${safeBaseUrl}/" />
    <title>Blackfong Mini App</title>
  </head>
  <body>
    <h1>Blackfong Mini App</h1>
    <p>Open this frame inside Farcaster to link wallets.</p>
  </body>
</html>`;
};

const frameImageSvg = (powerLabel) => {
  const sanitized = powerLabel.replace(/[^a-zA-Z0-9 +\-_.]/g, "");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#0b0f14" />
  <rect x="40" y="40" width="1120" height="550" rx="40" fill="#121823" />
  <text x="100" y="180" font-size="60" fill="#f4f6fb" font-family="Arial">
    Blackfong Power
  </text>
  <text x="100" y="300" font-size="44" fill="#93c5fd" font-family="Arial">
    ${sanitized}
  </text>
  <text x="100" y="400" font-size="32" fill="#9ca6b6" font-family="Arial">
    Link Base + Solana wallets to calculate.
  </text>
</svg>`;
};

module.exports = {
  frameHtml,
  frameImageSvg,
};
