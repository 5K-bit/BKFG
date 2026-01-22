const path = require("path");
const { readJson, writeJson } = require("./storage");

const registryPath = path.join(__dirname, "..", "data", "registry.json");

const loadRegistry = () => readJson(registryPath, {});

const getWallets = (fid) => {
  const registry = loadRegistry();
  return registry[fid];
};

const setWallets = (fid, wallets) => {
  if (!fid) {
    throw new Error("fid is required");
  }

  const registry = loadRegistry();
  const entry = registry[fid] || {};
  registry[fid] = {
    ...entry,
    ...wallets,
    updatedAt: new Date().toISOString(),
  };
  writeJson(registryPath, registry);
  return registry[fid];
};

module.exports = {
  getWallets,
  setWallets,
};
