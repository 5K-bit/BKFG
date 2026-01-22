const buildBridgePlan = ({
  provider = "ccip",
  fromChain,
  toChain,
  amount,
  baseAddress,
  solAddress,
}) => {
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    throw new Error("Amount must be greater than zero.");
  }
  if (!fromChain || !toChain || fromChain === toChain) {
    throw new Error("Select two different chains.");
  }

  const recipient = toChain === "base" ? baseAddress : solAddress;
  if (!recipient) {
    throw new Error("Recipient address missing for destination chain.");
  }

  if (provider === "ccip") {
    return buildCcipPlan({ fromChain, toChain, amount: numericAmount, recipient });
  }
  if (provider === "symbiosis") {
    return buildSymbiosisPlan({
      fromChain,
      toChain,
      amount: numericAmount,
      recipient,
    });
  }

  throw new Error("Unsupported bridge provider.");
};

const buildCcipPlan = ({ fromChain, toChain, amount, recipient }) => {
  const router = process.env.CCIP_ROUTER_ADDRESS || "TODO_CCIP_ROUTER";
  const burnMint = process.env.CCIP_BURN_MINT_ADDRESS || "TODO_BURN_MINT";

  return {
    provider: "ccip",
    fromChain,
    toChain,
    amount,
    recipient,
    steps: [
      {
        step: 1,
        action: `Burn BKFG on ${fromChain}`,
        contract: burnMint,
        method: "burn",
        args: [amount, recipient],
      },
      {
        step: 2,
        action: "Send CCIP message",
        contract: router,
        method: "ccipSend",
        args: [toChain, recipient, amount],
      },
      {
        step: 3,
        action: `Mint BKFG on ${toChain}`,
        contract: burnMint,
        method: "mint",
        args: [recipient, amount],
      },
    ],
    notes:
      "Replace TODO_* addresses with your CCIP router + burn/mint contracts.",
  };
};

const buildSymbiosisPlan = ({ fromChain, toChain, amount, recipient }) => {
  const apiUrl = process.env.SYMBIOSIS_API_URL || "https://api.symbiosis.finance";
  return {
    provider: "symbiosis",
    fromChain,
    toChain,
    amount,
    recipient,
    steps: [
      {
        step: 1,
        action: "Request bridge quote",
        api: `${apiUrl}/swap`,
        payload: {
          fromChain,
          toChain,
          token: "BKFG",
          amount,
          recipient,
        },
      },
      {
        step: 2,
        action: "Execute swap + mint",
        method: "POST /swap",
        payload: {
          fromChain,
          toChain,
          token: "BKFG",
          amount,
          recipient,
        },
      },
    ],
    notes:
      "Symbiosis flow is a stub. Replace with actual API calls/tx signing.",
  };
};

module.exports = {
  buildBridgePlan,
};
