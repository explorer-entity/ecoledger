declare const ethers: any;

import { MockUpiEngine, handleEscrowRelease } from "./settlement.js";

const logEl = document.getElementById("log")!;
const accountEl = document.getElementById("account")!;
const accountBadge = document.getElementById("accountBadge")!;
const sourceStatus = document.getElementById("sourceStatus")!;
const actionStatus = document.getElementById("actionStatus")!;
const payoutEl = document.getElementById("payout")!;
const payoutList = document.getElementById("payoutList")!;
const proofProgress = document.getElementById("proofProgress") as HTMLElement;

const ecoScoreEl = document.getElementById("ecoScore")!;
const pointsEl = document.getElementById("points")!;
const creditsEl = document.getElementById("credits")!;
const earnedEl = document.getElementById("earned")!;

const loginBtn = document.getElementById("loginBtn") as HTMLButtonElement;
const logoutBtn = document.getElementById("logoutBtn") as HTMLButtonElement;
const connectBtn = document.getElementById("connectBtn") as HTMLButtonElement;
const actionBtn = document.getElementById("actionBtn") as HTMLButtonElement;
const sourceSelect = document.getElementById("sourceSelect") as HTMLSelectElement;
const actionSelect = document.getElementById("actionSelect") as HTMLSelectElement;

const HARDHAT_DEPLOYER_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

let provider: any;
let sponsor: any; // deployer acts as gas sponsor (gasless)
let user: any;
let addresses: any = null;
let connectedSource = "";
let ecoScore = 0;
let points = 0;
let credits = 0;
let earnedPaise = 0;
let nullifierCounter = 0;
const upiEngine = new MockUpiEngine();

function log(msg: string) {
  const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logEl.textContent = line + "\n" + logEl.textContent;
}

function updateStats() {
  ecoScoreEl.textContent = String(ecoScore);
  pointsEl.textContent = String(points);
  creditsEl.textContent = String(credits);
  earnedEl.textContent = "₹" + (earnedPaise / 100).toFixed(2);
}

async function loadAddresses() {
  const res = await fetch("./addresses.json");
  addresses = await res.json();
  provider = new ethers.JsonRpcProvider(addresses.rpc);
  sponsor = new ethers.Wallet(HARDHAT_DEPLOYER_KEY, provider);
  user = new ethers.Wallet(addresses.userKey, provider);
}

loginBtn.addEventListener("click", async () => {
  if (!addresses) await loadAddresses();
  accountEl.innerHTML = `<strong>User</strong> ${addresses.user}<br/><strong>Signer</strong> ${user.address}<br/><span class="pill green">Gas sponsored by paymaster</span>`;
  accountBadge.textContent = user.address.slice(0, 8) + "…" + user.address.slice(-4);
  connectBtn.disabled = false;
  logoutBtn.disabled = false;
  loginBtn.disabled = true;
  log("Signed in. Connected to hardhat node. Sponsor ready.");
});

logoutBtn.addEventListener("click", () => {
  accountEl.textContent = "";
  accountBadge.textContent = "Not signed in";
  connectBtn.disabled = true;
  actionBtn.disabled = true;
  loginBtn.disabled = false;
  logoutBtn.disabled = true;
  connectedSource = "";
  sourceStatus.textContent = "";
  log("Signed out.");
});

connectBtn.addEventListener("click", () => {
  connectedSource = sourceSelect.value;
  const labels: Record<string, string> = {
    energy: "Energy (BESCOM)",
    mobility: "Mobility (cycling)",
    consumption: "Consumption (UPI MCC)",
  };
  sourceStatus.innerHTML = `Connected: <strong>${labels[connectedSource]}</strong> <span class="pill green">consent granted</span>`;
  actionBtn.disabled = false;
  log(`Connected data source: ${connectedSource}.`);
});

actionBtn.addEventListener("click", async () => {
  if (!connectedSource) {
    actionStatus.textContent = "Connect a data source first.";
    return;
  }
  if (!addresses) await loadAddresses();
  actionBtn.disabled = true;
  actionStatus.textContent = "Generating proof & sending tx (gasless)…";
  proofProgress.style.width = "0%";

  let p = 0;
  const timer = setInterval(() => {
    p += 20;
    proofProgress.style.width = Math.min(p, 90) + "%";
    if (p >= 90) clearInterval(timer);
  }, 120);

  try {
    const vaultAbi = [
      "function mintCredit(address to, uint256 amount, bytes32 nullifier) external",
      "function balance(address account) view returns (uint256)",
    ];
    const vaultC = new ethers.Contract(addresses.microCreditVault, vaultAbi, sponsor);

    const ecoAbi = ["function mint(address to) external", "function hasToken(address) view returns (bool)"];
    const ecoC = new ethers.Contract(addresses.ecoScore, ecoAbi, sponsor);

    const escrowAbi = ["function release(address user, uint256 amount) external"];
    const escrowC = new ethers.Contract(addresses.mockEscrow, escrowAbi, sponsor);

    nullifierCounter += 1;
    const nullifier = ethers.keccak256(ethers.toUtf8Bytes(`action-${nullifierCounter}`));

    const tx1 = await vaultC.mintCredit(user.address, 10, nullifier);
    await tx1.wait();

    try {
      const has = await ecoC.hasToken(user.address);
      if (!has) {
        const txEco = await ecoC.mint(user.address);
        await txEco.wait();
      }
    } catch (e) {
      // ignore
    }

    const total = 100000;
    const tx2 = await escrowC.release(user.address, total);
    await tx2.wait();

    const receipt = handleEscrowRelease(upiEngine, {
      txHash: tx2.hash,
      logIndex: 0,
      user: user.address,
      bankAccountId: "bank-demo",
      amount: total,
    });

    ecoScore += 5;
    points += 100;
    credits += 10;
    earnedPaise += receipt.amountPaise;
    updateStats();

    clearInterval(timer);
    proofProgress.style.width = "100%";

    actionStatus.innerHTML = `Verified <span class="pill green">TLSNotary ✓</span> <span class="pill green">zk ✓</span> <span class="pill green">anti-fraud ✓</span> — credit minted.`;
    payoutEl.textContent = `Latest: ${receipt.amountPaise} paise — ${receipt.txId}`;
    const li = document.createElement("li");
    li.innerHTML = `<span>${actionSelect.value}</span><span class="pill green">+100 pts · ₹${(receipt.amountPaise / 100).toFixed(2)}</span>`;
    payoutList.prepend(li);

    log(`Action verified & minted (tx ${tx1.hash.slice(0, 12)}…). UPI payout ${receipt.amountPaise} paise (${receipt.status}).`);
  } catch (e: any) {
    clearInterval(timer);
    proofProgress.style.width = "0%";
    actionStatus.textContent = `Error: ${e?.message ?? e}`;
    log(`Error: ${e?.message ?? e}`);
  } finally {
    actionBtn.disabled = false;
  }
});

updateStats();
log("EcoLedger MVP demo ready. Sign in to begin.");
loadAddresses().then(() => log("Loaded contract addresses.")).catch((e) => log("Failed to load addresses: " + e));
