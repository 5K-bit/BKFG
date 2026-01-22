const getBaseToken = () => ({
  address: process.env.BASE_BKFG_TOKEN,
  decimals: Number(process.env.BASE_BKFG_DECIMALS || 18),
});

const getSolanaTokens = () => ({
  bkfgMint: process.env.SOLANA_BKFG_MINT,
  eeveeMint: process.env.SOLANA_EEVEE_MINT,
});

module.exports = {
  getBaseToken,
  getSolanaTokens,
};
