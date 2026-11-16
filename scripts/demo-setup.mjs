import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const children = [];
function run(cmd, args, opts = {}) {
  const c = spawn(cmd, args, { cwd: ROOT, stdio: "inherit", shell: true, ...opts });
  children.push(c);
  return c;
}

async function waitForRpc(url, retries = 30) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }) });
      if (res.ok) return true;
    } catch {}
    await sleep(1000);
  }
  throw new Error("Hardhat node not ready");
}

async function main() {
  console.log("=== EcoLedger demo setup ===");
  console.log("Starting hardhat node...");
  run("npx", ["hardhat", "node"], { cwd: path.join(ROOT, "packages", "contracts") });

  await sleep(3000);
  await waitForRpc("http://127.0.0.1:8545");
  console.log("Hardhat node ready.");

  console.log("Deploying contracts...");
  const deploy = spawn("npx", ["hardhat", "run", "scripts/deploy.ts"], { cwd: path.join(ROOT, "packages", "contracts"), stdio: "inherit", shell: true });
  await new Promise((res, rej) => { deploy.on("exit", (code) => (code === 0 ? res() : rej(new Error("deploy failed")))); });

  console.log("Building packages...");
  const buildSettle = spawn("npm", ["run", "build", "--workspace=packages/settlement"], { cwd: ROOT, stdio: "inherit", shell: true });
  await new Promise((res, rej) => { buildSettle.on("exit", (code) => (code === 0 ? res() : rej(new Error("build settlement failed")))); });
  const buildWeb = spawn("npm", ["run", "build", "--workspace=apps/web"], { cwd: ROOT, stdio: "inherit", shell: true });
  await new Promise((res, rej) => { buildWeb.on("exit", (code) => (code === 0 ? res() : rej(new Error("build web failed")))); });

  console.log("Starting web server...");
  run("node", ["server.mjs"], { cwd: path.join(ROOT, "apps", "web") });

  await sleep(2000);
  console.log("");
  console.log("Demo ready: http://localhost:5173");
  console.log("Press Ctrl+C to stop.");
}

process.on("SIGINT", () => { children.forEach((c) => c.kill()); process.exit(0); });
process.on("SIGTERM", () => { children.forEach((c) => c.kill()); process.exit(0); });

main().catch((e) => { console.error(e); children.forEach((c) => c.kill()); process.exit(1); });
