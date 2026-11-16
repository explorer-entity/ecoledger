import { ethers } from "ethers";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RPC = process.env.RPC_URL || "http://127.0.0.1:8545";
const provider = new ethers.JsonRpcProvider(RPC);
// Hardhat default account #0
const deployer = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

function artifact(name) {
  const p = resolve(__dirname, "..", "artifacts", "contracts", `${name}.sol`, `${name}.json`);
  return JSON.parse(readFileSync(p, "utf8"));
}

async function deploy(name, args = []) {
  const art = artifact(name);
  const factory = new ethers.ContractFactory(art.abi, art.bytecode, deployer);
  const contract = await factory.deploy(...args);
  await contract.waitForDeployment();
  console.log(`${name}: ${await contract.getAddress()}`);
  return contract;
}

async function main() {
  const nulls = await deploy("NullifierRegistry");
  const vault = await deploy("MicroCreditVault", [await nulls.getAddress()]);
  await (await vault.setMinter(deployer.address)).wait();
  const eco = await deploy("EcoScore");
  await (await eco.setMinter(deployer.address)).wait();
  const escrow = await deploy("MockEscrow", [deployer.address, deployer.address]);

  // Fund escrow
  await (await deployer.sendTransaction({ to: await escrow.getAddress(), value: ethers.parseEther("1") })).wait();

  const addresses = {
    rpc: RPC,
    deployer: deployer.address,
    user: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    userKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    nullifierRegistry: await nulls.getAddress(),
    microCreditVault: await vault.getAddress(),
    ecoScore: await eco.getAddress(),
    mockEscrow: await escrow.getAddress(),
  };

  const outDir = resolve(__dirname, "..", "..", "web");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, "addresses.json"), JSON.stringify(addresses, null, 2));
  console.log("Wrote apps/web/addresses.json");
}

main().catch((e) => { console.error(e); process.exit(1); });
