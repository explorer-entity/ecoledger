import { expect } from "chai";
import { ethers } from "hardhat";

describe("EcoScore", function () {
  it("mints soulbound token and blocks transfer", async function () {
    const [owner, minter, user] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("EcoScore");
    const c: any = await Factory.deploy();
    await c.setMinter(minter.address);
    await c.connect(minter).mint(user.address);
    expect(await c.hasToken(user.address)).to.equal(true);
    await expect(
      c.connect(user).transferFrom(user.address, owner.address, 1)
    ).to.be.reverted;
  });

  it("nullifier prevents double use", async function () {
    const Factory = await ethers.getContractFactory("NullifierRegistry");
    const c = await Factory.deploy();
    const n = ethers.keccak256(ethers.toUtf8Bytes("n1"));
    await c.use(n);
    await expect(c.use(n)).to.be.revertedWith("nullifier already used");
  });
});
