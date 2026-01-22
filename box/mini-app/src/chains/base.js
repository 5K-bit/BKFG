const { createPublicClient, http, formatUnits } = require("viem");
const { base } = require("viem/chains");

const erc20Abi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "decimals", type: "uint8" }],
  },
];

const getBaseClient = () => {
  const rpcUrl = process.env.BASE_RPC_URL;
  if (!rpcUrl) {
    throw new Error("BASE_RPC_URL is not set");
  }

  return createPublicClient({
    chain: base,
    transport: http(rpcUrl),
  });
};

const getBaseBkfgBalance = async (address) => {
  const tokenAddress = process.env.BASE_BKFG_TOKEN;
  if (!tokenAddress) {
    throw new Error("BASE_BKFG_TOKEN is not set");
  }

  const client = getBaseClient();
  const configuredDecimals = process.env.BASE_BKFG_DECIMALS
    ? Number(process.env.BASE_BKFG_DECIMALS)
    : null;

  const [decimals, balance] = await Promise.all([
    configuredDecimals ?? client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "decimals" }),
    client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    }),
  ]);

  return Number(formatUnits(balance, Number(decimals)));
};

module.exports = {
  getBaseBkfgBalance,
};
