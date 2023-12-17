import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MultiSend", function () {

  async function deployMultiSendFixture() {
    // Contracts are deployed using the first signer/account by default
    const [deployerAccount, secondAccount, thirdAccount] = await ethers.getSigners();

    const MultiSend = await ethers.getContractFactory("MultiSend");
    const MyToken = await ethers.getContractFactory("MyToken");
    const multiSend = await MultiSend.deploy(deployerAccount.address);
    const myToken = await MyToken.deploy();

    return { multiSend, myToken, deployerAccount, secondAccount, thirdAccount };
  }

  describe("Deployment", function() {
    it("Should set the owner", async function() {
      const { multiSend, deployerAccount } = await loadFixture(deployMultiSendFixture);

      expect(await multiSend.owner()).to.be.equal(deployerAccount.address);
    });
  });

  describe("Sending tokens", function () {
    it("Should fail if token transfer approval amount for sender isn't enough", async function () {
      const { multiSend, myToken, secondAccount } = await loadFixture(deployMultiSendFixture);
      
      const addresses = [secondAccount.address];
      const amounts = [1];

      await expect(multiSend.multiSendToken(myToken.target, addresses, amounts)).to.be.revertedWith("Insufficient approved spend amount");
    });

    it("Should fail if sender doesn't have enough of the token to send", async function () {
      const { multiSend, myToken, deployerAccount, secondAccount } = await loadFixture(deployMultiSendFixture);
      
      const totalToSend = ethers.parseUnits('20000000000', 18); //2b
      const addresses = [secondAccount.address];
      const amounts = [totalToSend];

      await myToken.approve(multiSend.target, totalToSend);
      await expect(multiSend.multiSendToken(myToken.target, addresses, amounts)).to.be.revertedWithCustomError(myToken, "ERC20InsufficientBalance");
    });

    it("Should transfer tokens from sender to recipients if enough approved", async function () {
      const { multiSend, myToken, deployerAccount, secondAccount } = await loadFixture(deployMultiSendFixture);
      
      const totalToSend = 1;
      const addresses = [secondAccount.address];
      const amounts = [totalToSend];

      const originalSenderBalance = await myToken.balanceOf(deployerAccount);

      expect(await myToken.balanceOf(secondAccount.address)).to.equal(0);

      await myToken.approve(multiSend.target, totalToSend);
     
      expect(await myToken.allowance(deployerAccount, multiSend.target)).to.equal(totalToSend);

      await multiSend.multiSendToken(myToken.target, addresses, amounts);

      expect(await myToken.balanceOf(secondAccount.address)).to.equal(totalToSend);
      expect(await myToken.balanceOf(deployerAccount.address)).to.equal(originalSenderBalance - BigInt(totalToSend));
    });

    
    it("Should transfer tokens from sender to multiple recipients", async function () {
      const { multiSend, myToken, deployerAccount, secondAccount, thirdAccount } = await loadFixture(deployMultiSendFixture);
      
      const totalToSend = 20;
      const addresses = [secondAccount.address, thirdAccount.address];
      const amounts = [15, 5];

      const originalSenderBalance = await myToken.balanceOf(deployerAccount);

      expect(await myToken.balanceOf(secondAccount.address)).to.equal(0);
      expect(await myToken.balanceOf(thirdAccount.address)).to.equal(0);

      await myToken.approve(multiSend.target, totalToSend);
      await multiSend.multiSendToken(myToken.target, addresses, amounts);

      expect(await myToken.balanceOf(secondAccount.address)).to.equal(15);
      expect(await myToken.balanceOf(thirdAccount.address)).to.equal(5);
      expect(await myToken.balanceOf(deployerAccount.address)).to.equal(originalSenderBalance - BigInt(totalToSend));
    });
  });

  describe("Sending Rose", function () {
    it("Should fail if message value isn't enough", async function () {
      const { multiSend, secondAccount } = await loadFixture(deployMultiSendFixture);
      
      const addresses = [secondAccount.address];
      const amounts = [1];

      await expect(multiSend.multiSendRose(addresses, amounts)).to.be.revertedWith("Not enough Rose");
    });
    
    it("Should transfer Rose from sender to multiple recipients", async function () {
      const { multiSend, deployerAccount } = await loadFixture(deployMultiSendFixture);
      
      const totalToSend = 20;
      const { address: randomAddress } = ethers.Wallet.createRandom();
      const { address: randomAddressTwo } = ethers.Wallet.createRandom();
      const addresses = [ randomAddress, randomAddressTwo ];
      const amounts = [15, 5];

      const originalSenderBalance = await ethers.provider.getBalance(deployerAccount.address);

      expect(await ethers.provider.getBalance(randomAddress)).to.equal(0);
      expect(await ethers.provider.getBalance(randomAddressTwo)).to.equal(0);

      const response = await multiSend.multiSendRose(addresses, amounts, { value: ethers.parseEther(totalToSend.toString()) });
      const receipt = await response.wait();
      const gas = receipt!.gasUsed * receipt!.gasPrice;

      expect(await ethers.provider.getBalance(randomAddress)).to.equal(15);
      expect(await ethers.provider.getBalance(randomAddressTwo)).to.equal(5);
      expect(await ethers.provider.getBalance(deployerAccount.address)).to.equal(originalSenderBalance - gas - BigInt(totalToSend));
    });

    it("Should return extra Rose back to sender", async function () {
      const { multiSend, deployerAccount } = await loadFixture(deployMultiSendFixture);
      
      const totalToSend = 20;
      const actualSent = 30;
      const { address: randomAddress } = ethers.Wallet.createRandom();
      const { address: randomAddressTwo } = ethers.Wallet.createRandom();
      const addresses = [ randomAddress, randomAddressTwo ];
      const amounts = [15, 5];

      const originalSenderBalance = await ethers.provider.getBalance(deployerAccount.address);
      
      expect(await ethers.provider.getBalance(randomAddress)).to.equal(0);
      expect(await ethers.provider.getBalance(randomAddressTwo)).to.equal(0);

      const response = await multiSend.multiSendRose(addresses, amounts, { value: ethers.parseEther(actualSent.toString()) });
      const receipt = await response.wait();
      const gas = receipt!.gasUsed * receipt!.gasPrice;

      expect(await ethers.provider.getBalance(randomAddress)).to.equal(15);
      expect(await ethers.provider.getBalance(randomAddressTwo)).to.equal(5);
      expect(await ethers.provider.getBalance(deployerAccount.address)).to.equal(originalSenderBalance - gas - BigInt(totalToSend));
    });
  });

});
