const { getBaseBkfgBalance } = require("./chains/base");
const {
  getSolanaBkfgBalance,
  getSolanaEeveeBalance,
} = require("./chains/solana");

const fetchHoldings = async ({ baseAddress, solAddress }) => {
  const warnings = [];
  let baseBkfg = 0;
  let solBkfg = 0;
  let solEevee = 0;

  if (!baseAddress) {
    warnings.push("Base address missing.");
  } else {
    try {
      baseBkfg = await getBaseBkfgBalance(baseAddress);
    } catch (error) {
      warnings.push(`Base BKFG lookup failed: ${error.message}`);
    }
  }

  if (!solAddress) {
    warnings.push("Solana address missing.");
  } else {
    try {
      solBkfg = await getSolanaBkfgBalance(solAddress);
    } catch (error) {
      warnings.push(`Solana BKFG lookup failed: ${error.message}`);
    }

    try {
      solEevee = await getSolanaEeveeBalance(solAddress);
    } catch (error) {
      warnings.push(`Solana EEVEE lookup failed: ${error.message}`);
    }
  }

  return {
    baseBkfg,
    solBkfg,
    solEevee,
    warnings,
  };
};

const calculateBlackfongPower = ({ holdings, velocityBoost = 0 }) => {
  const baseScore = (holdings.baseBkfg + holdings.solBkfg) * 10;
  const eeveeScore = holdings.solEevee * 4;
  const total = baseScore + eeveeScore + velocityBoost;

  return Math.round(total);
};

const fetchVelocityMetrics = async () => {
  const metricsUrl = process.env.BOT_METRICS_URL;
  if (!metricsUrl) {
    return {
      velocityIndex: 0,
      totalTips: 0,
      totals: {},
      updatedAt: null,
    };
  }

  try {
    const response = await fetch(metricsUrl);
    if (!response.ok) {
      throw new Error(`Velocity API returned ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    return {
      velocityIndex: 0,
      totalTips: 0,
      totals: {},
      updatedAt: null,
      error: error.message,
    };
  }
};

module.exports = {
  fetchHoldings,
  calculateBlackfongPower,
  fetchVelocityMetrics,
};
