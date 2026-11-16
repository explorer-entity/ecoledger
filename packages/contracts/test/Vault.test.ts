import { expect } from "chai";
import { ethers } from "hardhat";

describe("MicroCreditVault", function () {
  it("mints credits and prevents nullifier replay", async function () {
    const [owner, minter, user] = await ethers.getSigners();
    const NullFactory = await ethers.getContractFactory("NullifierRegistry");
    const nulls: any = await NullFactory.deploy();
    const VaultFactory = await ethers.getContractFactory("MicroCreditVault");
    const vault: any = await VaultFactory.deploy(await nulls.getAddress());
    await vault.setMinter(minter.address);

    const n = ethers.keccak256(ethers.toUtf8Bytes("action-1"));
    await vault.connect(minter).mintCredit(user.address, 100, n);
    expect(await vault.balance(user.address)).to.equal(100n);

    await expect(
      vault.connect(minter).mintCredit(user.address, 50, n)
    ).to.be.revertedWith("nullifier already used");
  });

  it("retires credits", async function () {
    const [owner, minter, user] = await ethers.getSigners();
    const NullFactory = await ethers.getContractFactory("NullifierRegistry");
    const nulls: any = await NullFactory.deploy();
    const VaultFactory = await ethers.getContractFactory("MicroCreditVault");
    const vault: any = await VaultFactory.deploy(await nulls.getAddress());
    await vault.setMinter(minter.address);

    const n = ethers.keccak256(ethers.toUtf8Bytes("action-2"));
    await vault.connect(minter).mintCredit(user.address, 100, n);
    await vault.connect(minter).retire(user.address, 40);
    expect(await vault.balance(user.address)).to.equal(60n);
  });
});
