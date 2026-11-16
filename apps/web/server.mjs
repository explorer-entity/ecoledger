import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ethers } from "ethers";
import { handleEscrowRelease, MockUpiEngine } from "../../packages/settlement/dist/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const PORT = (process.env.PORT && Number(process.env.PORT) > 0) ? Number(process.env.PORT) : 5173;
const RPC = process.env.RPC_URL || "http://127.0.0.1:8545";
const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const upiEngine = new MockUpiEngine();

async function getNonce() {
  const res = await fetch(RPC, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", method: "eth_getTransactionCount", params: [sponsor.address, "latest"], id: 1 }) });
  const data = await res.json();
  return parseInt(data.result, 16);
}
let addresses = null;
let sponsor = null;
let provider = null;

function loadAddresses() {
  addresses = JSON.parse(fs.readFileSync(path.join(ROOT, "addresses.json"), "utf8"));
  provider = new ethers.JsonRpcProvider(addresses.rpc || RPC);
  sponsor = new ethers.Wallet(DEPLOYER_KEY, provider);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function send(res, status, body, type = "text/plain") {
  res.writeHead(status, { "Content-Type": type, "Access-Control-Allow-Origin": "*" });
  res.end(body);
}

function serveStatic(req, res) {
  let url = req.url.split("?")[0];
  if (url === "/") url = "/index.html";
  const filePath = path.join(ROOT, url);
  if (!filePath.startsWith(ROOT)) { send(res, 403, "Forbidden"); return; }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) { send(res, 404, "Not found"); return; }
  const ext = path.extname(filePath);
  const data = fs.readFileSync(filePath);
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream", "Access-Control-Allow-Origin": "*" });
  res.end(data);
}

async function handleApi(req, res) {
  if (req.method === "OPTIONS") { res.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST", "Access-Control-Allow-Headers": "Content-Type" }); res.end(); return; }
  if (req.url === "/api/addresses") { send(res, 200, JSON.stringify(addresses), "application/json"); return; }
  if (req.url === "/api/action" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      try {
        const sponsor = new ethers.Wallet(DEPLOYER_KEY, provider);
        const { action } = JSON.parse(body || "{}");
        const vaultAbi = ["function mintCredit(address to, uint256 amount, bytes32 nullifier) external", "function balance(address account) view returns (uint256)"];
        const ecoAbi = ["function mint(address to) external", "function hasToken(address) view returns (bool)"];
        const escrowAbi = ["function release(address user, uint256 amount) external"];
        const vault = new ethers.Contract(addresses.microCreditVault, vaultAbi, sponsor);
        const eco = new ethers.Contract(addresses.ecoScore, ecoAbi, sponsor);
        const escrow = new ethers.Contract(addresses.mockEscrow, escrowAbi, sponsor);

        const userAddr = addresses.user;
        const nullifier = ethers.keccak256(ethers.toUtf8Bytes(`action-${Date.now()}`));
        const n1 = await getNonce();
        const tx1 = await vault.mintCredit(userAddr, 10, nullifier, { nonce: n1 });
        await tx1.wait();

        try {
          const has = await eco.hasToken(userAddr);
          if (!has) {
            const nEco = await getNonce();
            const txEco = await eco.mint(userAddr, { nonce: nEco });
            await txEco.wait();
          }
        } catch (e) { /* ignore */ }

        const total = 100000;
        const n2 = await getNonce();
        const tx2 = await escrow.release(userAddr, total, { nonce: n2 });
        await tx2.wait();

        let receipt;
        if (process.env.UPI_PROVIDER_URL) {
          const r = await fetch(process.env.UPI_PROVIDER_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ txHash: tx2.hash, user: userAddr, bankAccountId: "bank-demo", amount: total }) });
          receipt = await r.json();
        } else {
          receipt = handleEscrowRelease(upiEngine, { txHash: tx2.hash, logIndex: 0, user: userAddr, bankAccountId: "bank-demo", amount: total });
        }

        send(res, 200, JSON.stringify({
          ok: true,
          action,
          mintTx: tx1.hash,
          releaseTx: tx2.hash,
          payout: receipt,
          ecoScoreDelta: 5,
          pointsDelta: 100,
          creditsDelta: 10,
        }), "application/json");
      } catch (e) {
        send(res, 500, JSON.stringify({ ok: false, error: e?.message ?? String(e) }), "application/json");
      }
    });
    return;
  }
  send(res, 404, "Not found", "application/json");
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/api/")) { handleApi(req, res); return; }
  serveStatic(req, res);
});

loadAddresses();
server.listen(PORT, () => {
  console.log(`EcoLedger dev server: http://localhost:${PORT}`);
  console.log(`RPC: ${RPC}`);
  console.log(`Sponsor: ${sponsor.address}`);
});
