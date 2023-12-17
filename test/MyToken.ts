import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MyToken", function () {

  async function deployMyTokenFixture() {
    // Contracts are deployed using the first signer/account by default
    const [deployerAccount, secondAccount] = await ethers.getSigners();

    const MyToken = await ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy();

    return { myToken, deployerAccount, secondAccount };
  }

  describe("Deployment", function () {
    it("Should set a name and symbol", async function () {
      const { myToken } = await loadFixture(deployMyTokenFixture);

      expect(await myToken.name()).to.equal("MyToken");
      expect(await myToken.symbol()).to.equal("MTK");
    });

    it("Should set an initial balance of 10B to deployer's address", async function () {
      const { myToken, deployerAccount } = await loadFixture(deployMyTokenFixture);

      const deployerBalance = await myToken.balanceOf(deployerAccount.address);
      const totalSupply = await myToken.totalSupply();

      expect(deployerBalance).to.equal(totalSupply);
      expect(totalSupply).to.equal(ethers.parseUnits('10000000000', 18)) //10B
    });

  });

});
