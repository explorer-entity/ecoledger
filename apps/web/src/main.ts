// EcoLedger gasless onboarding demo (mock Web3Auth + paymaster + UPI)

const logEl = document.getElementById("log")!;
const accountEl = document.getElementById("account")!;
const actionBtn = document.getElementById("actionBtn") as HTMLButtonElement;
const actionStatus = document.getElementById("actionStatus")!;
const payoutEl = document.getElementById("payout")!;

function log(msg: string) {
  logEl.textContent += msg + "\n";
}

// Mock Web3Auth: derive a deterministic-ish smart account address from a "login".
function mockWeb3AuthLogin(): { signer: string; smartAccount: string } {
  const signer = "0x" + crypto.randomUUID().replace(/-/g, "").slice(0, 40);
  // Counterfactual smart account (mock): hash of signer + factory
  const smartAccount = "0x" + Array.from(signer).reduce((a, c) => a + c.charCodeAt(0).toString(16), "").slice(0, 40).padEnd(40, "0");
  return { signer, smartAccount };
}

let smartAccount = "";

document.getElementById("loginBtn")!.addEventListener("click", () => {
  const { signer, smartAccount: sa } = mockWeb3AuthLogin();
  smartAccount = sa;
  accountEl.textContent = `Signer: ${signer}\nSmart account (counterfactual): ${sa}\nGas sponsored by paymaster: yes`;
  actionBtn.disabled = false;
  log("Signed in (mock Web3Auth). Smart account created gaslessly.");
});

actionBtn.addEventListener("click", () => {
  actionBtn.disabled = true;
  actionStatus.textContent = "Submitting userOp (sponsored)...";
  log("Performing green action (no gas prompt).");

  // Simulate on-chain mint + escrow release
  setTimeout(() => {
    const totalPaise = 100000;
    const userShare = Math.floor(totalPaise * 0.7);
    const txId = `UPI-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    actionStatus.textContent = "Credit minted. EcoScore updated.";
    payoutEl.textContent = `Payout ${userShare} paise to bank (mock UPI) — tx ${txId} — SUCCESS`;
    log(`Escrow released. UPI payout ${userShare} paise (70%) — ${txId}.`);
    actionBtn.disabled = false;
  }, 600);
});
