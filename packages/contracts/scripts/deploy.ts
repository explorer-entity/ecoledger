import { ethers } from "hardhat";
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const NullFactory = await ethers.getContractFactory("NullifierRegistry");
  const nulls = await NullFactory.deploy();
  await nulls.waitForDeployment();

  const VaultFactory = await ethers.getContractFactory("MicroCreditVault");
  const vault = await VaultFactory.deploy(await nulls.getAddress());
  await vault.waitForDeployment();
  await vault.setMinter(deployer.address);

  const EcoFactory = await ethers.getContractFactory("EcoScore");
  const eco = await EcoFactory.deploy();
  await eco.waitForDeployment();
  await eco.setMinter(deployer.address);

  const EscrowFactory = await ethers.getContractFactory("MockEscrow");
  const escrow = await EscrowFactory.deploy(deployer.address, deployer.address);
  await escrow.waitForDeployment();
  await deployer.sendTransaction({ to: await escrow.getAddress(), value: ethers.parseEther("1") });

  const addresses = {
    rpc: "http://127.0.0.1:8545",
    deployer: deployer.address,
    user: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    userKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    nullifierRegistry: await nulls.getAddress(),
    microCreditVault: await vault.getAddress(),
    ecoScore: await eco.getAddress(),
    mockEscrow: await escrow.getAddress(),
  };

  const outDir = resolve(__dirname, "..", "..", "..", "apps", "web");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, "addresses.json"), JSON.stringify(addresses, null, 2));
  console.log("Wrote apps/web/addresses.json");
  console.log(JSON.stringify(addresses, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
