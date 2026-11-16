
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

let connectedSource = "";
let ecoScore = 0;
let points = 0;
let credits = 0;
let earnedPaise = 0;
let userEmail = "";

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

// Web3Auth (real) if configured, else mock dev login.
async function web3AuthLogin(): Promise<{ email: string }> {
  const cfgRes = await fetch("./config.json").catch(() => null);
  const cfg = cfgRes && cfgRes.ok ? await cfgRes.json() : {};
  if (cfg.web3authClientId) {
    try {
      if (!(window as any).Web3Auth) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/npm/@web3auth/modal@9/dist/modal.umd.min.js";
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("Web3Auth SDK load failed"));
          document.head.appendChild(s);
        });
      }
      const Web3Auth = (window as any).Web3Auth;
      const web3auth = new Web3Auth.Web3Auth({
        clientId: cfg.web3authClientId,
        web3AuthNetwork: "sapphire_devnet",
      });
      await web3auth.initModal();
      const provider = await web3auth.connect();
      const accounts = await provider.request({ method: "eth_accounts" });
      log("Web3Auth login successful.");
      return { email: accounts?.[0] ?? "web3auth-user" };
    } catch (e: any) {
      log("Web3Auth failed, falling back to dev login: " + (e?.message ?? e));
    }
  } else {
    log("No Web3Auth client id; using dev mock login.");
  }
  return { email: "demo@ecoledger.app" };
}

loginBtn.addEventListener("click", async () => {
  try {
    const { email } = await web3AuthLogin();
    userEmail = email;
    const res = await fetch("/api/addresses");
    const addresses = await res.json();
    accountEl.innerHTML = `<strong>User</strong> ${addresses.user}<br/><strong>Email</strong> ${email}<br/><span class="pill green">Gas sponsored by paymaster</span>`;
    accountBadge.textContent = addresses.user.slice(0, 8) + "…" + addresses.user.slice(-4);
    connectBtn.disabled = false;
    logoutBtn.disabled = false;
    loginBtn.disabled = true;
    (document.getElementById("statsBlock") as HTMLElement).style.display = "grid";
    (document.getElementById("connectCard") as HTMLElement).style.display = "block";
    (document.getElementById("actionCard") as HTMLElement).style.display = "block";
    (document.getElementById("settlementCard") as HTMLElement).style.display = "block";
    log("Signed in. Backend sponsor ready.");
  } catch (e: any) {
    log("Login failed: " + (e?.message ?? e));
  }
});

logoutBtn.addEventListener("click", () => {
  userEmail = "";
  accountEl.textContent = "";
  accountBadge.textContent = "Not signed in";
  connectBtn.disabled = true;
  actionBtn.disabled = true;
  loginBtn.disabled = false;
  logoutBtn.disabled = true;
  connectedSource = "";
  sourceStatus.textContent = "";
  (document.getElementById("statsBlock") as HTMLElement).style.display = "none";
  (document.getElementById("connectCard") as HTMLElement).style.display = "none";
  (document.getElementById("actionCard") as HTMLElement).style.display = "none";
  (document.getElementById("settlementCard") as HTMLElement).style.display = "none";
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
    const res = await fetch("/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: actionSelect.value }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "action failed");

    ecoScore += data.ecoScoreDelta;
    points += data.pointsDelta;
    credits += data.creditsDelta;
    earnedPaise += data.payout.amountPaise;
    updateStats();

    clearInterval(timer);
    proofProgress.style.width = "100%";

    actionStatus.innerHTML = `Verified <span class="pill green">TLSNotary ✓</span> <span class="pill green">zk ✓</span> <span class="pill green">anti-fraud ✓</span> — credit minted.`;
    payoutEl.textContent = `Latest: ${data.payout.amountPaise} paise — ${data.payout.txId}`;
    const li = document.createElement("li");
    li.innerHTML = `<span>${actionSelect.value}</span><span class="pill green">+${data.pointsDelta} pts · ₹${(data.payout.amountPaise / 100).toFixed(2)}</span>`;
    payoutList.prepend(li);

    log(`Action verified & minted (tx ${data.mintTx.slice(0, 12)}…). UPI payout ${data.payout.amountPaise} paise (${data.payout.status}).`);
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
