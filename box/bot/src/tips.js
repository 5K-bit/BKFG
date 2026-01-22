const {
  createPublicClient,
  createWalletClient,
  http,
  parseUnits,
} = require("viem");
const { base } = require("viem/chains");
const { privateKeyToAccount } = require("viem/accounts");
const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} = require("@solana/web3.js");
const {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  getMint,
} = require("@solana/spl-token");
const { getBaseToken, getSolanaTokens } = require("./tokens");

const erc20Abi = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "success", type: "bool" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "decimals", type: "uint8" }],
  },
];

const normalizePrivateKey = (key) => {
  if (!key) {
    throw new Error("BOT_EVM_PRIVATE_KEY is not set");
  }
  return key.startsWith("0x") ? key : `0x${key}`;
};

const parseTipIntent = (text, mentionedFids = []) => {
  if (!text) {
    return null;
  }
  const match = text.match(/!tip\s+([\d.]+)\s*(BKFG|EEVEE)\s*(?:fid:(\d+))?/i);
  if (!match) {
    return null;
  }

  const amount = Number(match[1]);
  const token = match[2].toUpperCase();
  const explicitFid = match[3] ? Number(match[3]) : null;
  const targetFid = explicitFid || mentionedFids[0];

  if (!amount || amount <= 0) {
    return null;
  }

  return {
    amount,
    token,
    targetFid,
  };
};

const sendBkfgTip = async ({ toAddress, amount }) => {
  const { address: tokenAddress } = getBaseToken();
  const rpcUrl = process.env.BASE_RPC_URL;
  if (!rpcUrl) {
    throw new Error("BASE_RPC_URL is not set");
  }
  if (!tokenAddress) {
    throw new Error("BASE_BKFG_TOKEN is not set");
  }

  const account = privateKeyToAccount(normalizePrivateKey(process.env.BOT_EVM_PRIVATE_KEY));
  const publicClient = createPublicClient({
    chain: base,
    transport: http(rpcUrl),
  });
  const walletClient = createWalletClient({
    chain: base,
    transport: http(rpcUrl),
    account,
  });

  const decimals =
    process.env.BASE_BKFG_DECIMALS !== undefined
      ? Number(process.env.BASE_BKFG_DECIMALS)
      : await publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "decimals",
        });

  const value = parseUnits(amount.toString(), Number(decimals));
  const { request } = await publicClient.simulateContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "transfer",
    args: [toAddress, value],
    account,
  });
  return walletClient.writeContract(request);
};

const loadSolanaKeypair = () => {
  const secret = process.env.BOT_SOLANA_SECRET_KEY;
  if (!secret) {
    throw new Error("BOT_SOLANA_SECRET_KEY is not set");
  }
  const trimmed = secret.trim();
  if (trimmed.startsWith("[")) {
    const bytes = Uint8Array.from(JSON.parse(trimmed));
    return Keypair.fromSecretKey(bytes);
  }
  const bytes = Uint8Array.from(Buffer.from(trimmed, "base64"));
  return Keypair.fromSecretKey(bytes);
};

const toBaseUnits = (amount, decimals) => {
  const [whole, fraction = ""] = amount.toString().split(".");
  const padded = `${fraction}${"0".repeat(decimals)}`.slice(0, decimals);
  return BigInt(`${whole}${padded}` || "0");
};

const sendSolanaTip = async ({ toAddress, amount, mint }) => {
  if (!mint) {
    throw new Error("Solana mint address missing");
  }
  const rpcUrl =
    process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
  const connection = new Connection(rpcUrl, "confirmed");
  const keypair = loadSolanaKeypair();
  const mintKey = new PublicKey(mint);
  const recipient = new PublicKey(toAddress);

  const sourceAta = await getAssociatedTokenAddress(mintKey, keypair.publicKey);
  const destinationAta = await getAssociatedTokenAddress(mintKey, recipient);
  const instructions = [];

  if (!(await connection.getAccountInfo(destinationAta))) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        keypair.publicKey,
        destinationAta,
        recipient,
        mintKey
      )
    );
  }

  const mintInfo = await getMint(connection, mintKey);
  const baseUnits = toBaseUnits(amount, mintInfo.decimals);

  instructions.push(
    createTransferInstruction(
      sourceAta,
      destinationAta,
      keypair.publicKey,
      baseUnits
    )
  );

  const tx = new Transaction().add(...instructions);
  const signature = await connection.sendTransaction(tx, [keypair]);
  return signature;
};

const sendEeveeTip = async ({ toAddress, amount }) => {
  const { eeveeMint } = getSolanaTokens();
  if (!eeveeMint) {
    throw new Error("SOLANA_EEVEE_MINT is not set");
  }
  return sendSolanaTip({ toAddress, amount, mint: eeveeMint });
};

module.exports = {
  parseTipIntent,
  sendBkfgTip,
  sendEeveeTip,
};
