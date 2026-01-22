const baseInput = document.getElementById("baseAddress");
const solInput = document.getElementById("solAddress");
const powerResult = document.getElementById("powerResult");
const bridgeResult = document.getElementById("bridgeResult");
const velocityResult = document.getElementById("velocityResult");

const connectBase = async () => {
  if (!window.ethereum) {
    powerResult.textContent = "No EVM wallet detected.";
    return;
  }

  try {
    const [address] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    baseInput.value = address || "";
  } catch (error) {
    powerResult.textContent = `Base wallet error: ${error.message}`;
  }
};

const connectSolana = async () => {
  if (!window.solana || !window.solana.isPhantom) {
    powerResult.textContent = "No Solana wallet detected.";
    return;
  }

  try {
    const response = await window.solana.connect();
    solInput.value = response.publicKey.toString();
  } catch (error) {
    powerResult.textContent = `Solana wallet error: ${error.message}`;
  }
};

const calculatePower = async () => {
  powerResult.textContent = "Calculating...";

  const response = await fetch("/api/power", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      baseAddress: baseInput.value.trim(),
      solAddress: solInput.value.trim(),
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    powerResult.textContent = payload.error || "Unable to calculate power.";
    return;
  }

  const lines = [
    `Blackfong Power: ${payload.power}`,
    `Base BKFG: ${payload.holdings.baseBkfg}`,
    `Solana BKFG: ${payload.holdings.solBkfg}`,
    `Solana EEVEE: ${payload.holdings.solEevee}`,
    `Velocity boost: ${payload.velocityBoost}`,
  ];

  if (payload.warnings?.length) {
    lines.push("", "Warnings:");
    payload.warnings.forEach((warning) => lines.push(`- ${warning}`));
  }

  powerResult.textContent = lines.join("\n");
};

const createBridgePlan = async () => {
  bridgeResult.textContent = "Preparing bridge plan...";

  const provider = document.getElementById("bridgeProvider").value;
  const amount = document.getElementById("bridgeAmount").value;
  const fromChain = document.getElementById("fromChain").value;
  const toChain = document.getElementById("toChain").value;

  const response = await fetch("/api/bridge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider,
      amount,
      fromChain,
      toChain,
      baseAddress: baseInput.value.trim(),
      solAddress: solInput.value.trim(),
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    bridgeResult.textContent = payload.error || "Bridge plan unavailable.";
    return;
  }

  bridgeResult.textContent = JSON.stringify(payload, null, 2);
};

const loadVelocity = async () => {
  const response = await fetch("/api/velocity");
  const payload = await response.json();
  velocityResult.textContent = JSON.stringify(payload, null, 2);
};

document.getElementById("connectBase").addEventListener("click", connectBase);
document.getElementById("connectSol").addEventListener("click", connectSolana);
document.getElementById("calculatePower").addEventListener("click", calculatePower);
document.getElementById("bridgePlan").addEventListener("click", createBridgePlan);

loadVelocity();
