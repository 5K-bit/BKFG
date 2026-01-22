const path = require("path");
const { readJson, writeJson } = require("./storage");

const velocityPath = path.join(__dirname, "..", "data", "velocity.json");

const defaultMetrics = () => ({
  velocityIndex: 0,
  totalTips: 0,
  totals: {
    BKFG: { count: 0, volume: 0 },
    EEVEE: { count: 0, volume: 0 },
  },
  updatedAt: null,
  lastTip: null,
});

const loadMetrics = () => {
  const metrics = readJson(velocityPath, defaultMetrics());
  if (!metrics.totals) {
    metrics.totals = defaultMetrics().totals;
  }
  if (!metrics.totals.BKFG) {
    metrics.totals.BKFG = { count: 0, volume: 0 };
  }
  if (!metrics.totals.EEVEE) {
    metrics.totals.EEVEE = { count: 0, volume: 0 };
  }
  return metrics;
};

const computeVelocityIndex = (metrics) => {
  const totalVolume =
    metrics.totals.BKFG.volume + metrics.totals.EEVEE.volume;
  const countScore = metrics.totalTips * 0.8;
  const volumeScore = Math.log10(totalVolume + 1) * 10;
  return Math.round(Math.min(100, countScore + volumeScore));
};

const recordTip = ({ token, amount, fromFid, toFid, txHash }) => {
  const metrics = loadMetrics();
  const numericAmount = Number(amount);

  if (!metrics.totals[token]) {
    metrics.totals[token] = { count: 0, volume: 0 };
  }

  metrics.totalTips += 1;
  metrics.totals[token].count += 1;
  metrics.totals[token].volume += numericAmount;
  metrics.velocityIndex = computeVelocityIndex(metrics);
  metrics.updatedAt = new Date().toISOString();
  metrics.lastTip = {
    token,
    amount: numericAmount,
    fromFid,
    toFid,
    txHash,
  };

  writeJson(velocityPath, metrics);
  return metrics;
};

const getVelocityMetrics = () => loadMetrics();

module.exports = {
  recordTip,
  getVelocityMetrics,
};
