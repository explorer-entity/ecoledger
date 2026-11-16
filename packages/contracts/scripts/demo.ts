import { ethers } from "hardhat";

async function main() {
  const [deployer, user] = await ethers.getSigners();
  console.log("Deployer (oracle):", deployer.address);
  console.log("User:", user.address);

  const NullFactory = await ethers.getContractFactory("NullifierRegistry");
  const nulls: any = await NullFactory.deploy();
  await nulls.waitForDeployment();

  const VaultFactory = await ethers.getContractFactory("MicroCreditVault");
  const vault: any = await VaultFactory.deploy(await nulls.getAddress());
  await vault.waitForDeployment();
  await vault.setMinter(deployer.address);

  const EcoFactory = await ethers.getContractFactory("EcoScore");
  const eco: any = await EcoFactory.deploy();
  await eco.waitForDeployment();
  await eco.setMinter(deployer.address);
  await eco.mint(user.address);

  const EscrowFactory = await ethers.getContractFactory("MockEscrow");
  const escrow: any = await EscrowFactory.deploy(deployer.address, deployer.address);
  await escrow.waitForDeployment();

  // Fund escrow
  await deployer.sendTransaction({ to: await escrow.getAddress(), value: ethers.parseEther("1") });

  // Mint credit
  const nullifier = ethers.keccak256(ethers.toUtf8Bytes("action-demo-1"));
  await vault.mintCredit(user.address, 100n, nullifier);
  console.log("Minted 100 credits. Balance:", (await vault.balance(user.address)).toString());

  // Duplicate mint should fail
  try {
    await vault.mintCredit(user.address, 50n, nullifier);
    console.log("ERROR: duplicate mint succeeded");
  } catch {
    console.log("Duplicate mint rejected (nullifier works)");
  }

  // Retire 40 credits
  await vault.retire(user.address, 40n);
  console.log("After retire, balance:", (await vault.balance(user.address)).toString());

  // Escrow release -> 70% user share
  const before = await ethers.provider.getBalance(user.address);
  await escrow.release(user.address, ethers.parseEther("0.1"));
  const after = await ethers.provider.getBalance(user.address);
  console.log("User received (wei):", (after - before).toString());
  console.log("EcoScore minted for user:", await eco.hasToken(user.address));

  console.log("MVP DEMO: SUCCESS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
