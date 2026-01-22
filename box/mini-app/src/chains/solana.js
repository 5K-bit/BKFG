const { Connection, PublicKey } = require("@solana/web3.js");

const getSolanaConnection = () => {
  const rpcUrl =
    process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
  return new Connection(rpcUrl, "confirmed");
};

const getSplTokenBalance = async (ownerAddress, mintAddress) => {
  if (!mintAddress) {
    throw new Error("Solana mint address not set");
  }

  const connection = getSolanaConnection();
  const owner = new PublicKey(ownerAddress);
  const mint = new PublicKey(mintAddress);

  const response = await connection.getParsedTokenAccountsByOwner(owner, {
    mint,
  });

  return response.value.reduce((total, accountInfo) => {
    const amount =
      accountInfo.account.data.parsed.info.tokenAmount.uiAmount || 0;
    return total + Number(amount);
  }, 0);
};

const getSolanaBkfgBalance = async (ownerAddress) => {
  return getSplTokenBalance(ownerAddress, process.env.SOLANA_BKFG_MINT);
};

const getSolanaEeveeBalance = async (ownerAddress) => {
  return getSplTokenBalance(ownerAddress, process.env.SOLANA_EEVEE_MINT);
};

module.exports = {
  getSolanaBkfgBalance,
  getSolanaEeveeBalance,
};
