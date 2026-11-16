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

let smartAccount = "";
let connectedSource = "";
let ecoScore = 0;
let points = 0;
let credits = 0;
let earnedPaise = 0;

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

function mockWeb3AuthLogin() {
  const signer = "0x" + crypto.randomUUID().replace(/-/g, "").slice(0, 40);
  const smartAccount = "0x" + Array.from(signer)
    .reduce((a, c) => a + c.charCodeAt(0).toString(16), "")
    .slice(0, 40)
    .padEnd(40, "0");
  return { signer, smartAccount };
}

loginBtn.addEventListener("click", () => {
  const { signer, smartAccount: sa } = mockWeb3AuthLogin();
  smartAccount = sa;
  accountEl.innerHTML = `<strong>Signer</strong> ${signer}<br/><strong>Smart account</strong> ${sa}<br/><span class="pill green">Gas sponsored</span>`;
  accountBadge.textContent = sa.slice(0, 8) + "…" + sa.slice(-4);
  connectBtn.disabled = false;
  logoutBtn.disabled = false;
  loginBtn.disabled = true;
  log("Signed in via Web3Auth (mock). Smart account created gaslessly.");
});

logoutBtn.addEventListener("click", () => {
  smartAccount = "";
  connectedSource = "";
  accountEl.textContent = "";
  accountBadge.textContent = "Not signed in";
  connectBtn.disabled = true;
  actionBtn.disabled = true;
  loginBtn.disabled = false;
  logoutBtn.disabled = true;
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

actionBtn.addEventListener("click", () => {
  if (!connectedSource) {
    actionStatus.textContent = "Connect a data source first.";
    return;
  }
  actionBtn.disabled = true;
  actionStatus.textContent = "Generating TLSNotary + zk proof…";
  proofProgress.style.width = "0%";
  log(`Logging green action: ${actionSelect.value}`);

  // Simulate proof generation progress
  let p = 0;
  const timer = setInterval(() => {
    p += 20;
    proofProgress.style.width = Math.min(p, 90) + "%";
    if (p >= 90) clearInterval(timer);
  }, 120);

  setTimeout(() => {
    clearInterval(timer);
    proofProgress.style.width = "100%";

    // Anti-fraud passed (mock)
    const earned = 100; // points
    points += earned;
    ecoScore += 5;
    credits += 10;
    updateStats();

    const totalPaise = 100000;
    const userShare = Math.floor(totalPaise * 0.7);
    const txId = `UPI-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    earnedPaise += userShare;
    updateStats();

    actionStatus.innerHTML = `Verified <span class="pill green">TLSNotary ✓</span> <span class="pill green">zk ✓</span> <span class="pill green">anti-fraud ✓</span> — credit minted.`;
    payoutEl.textContent = `Latest: ${userShare} paise — ${txId}`;
    const li = document.createElement("li");
    li.innerHTML = `<span>${actionSelect.value}</span><span class="pill green">+${earned} pts · ₹${(userShare / 100).toFixed(2)}</span>`;
    payoutList.prepend(li);

    log(`Action verified & minted. UPI payout ${userShare} paise (${txId}).`);
    actionBtn.disabled = false;
  }, 700);
});

updateStats();
log("EcoLedger MVP demo ready. Sign in to begin.");
