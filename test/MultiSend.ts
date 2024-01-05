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

    const initialFee = ethers.parseEther('10');

    const MultiSend = await ethers.getContractFactory("MultiSend");
    const MyToken = await ethers.getContractFactory("MyToken");
    const multiSend = await MultiSend.deploy(deployerAccount.address, initialFee);
    const myToken = await MyToken.deploy();
    
    return { multiSend, myToken, initialFee, deployerAccount, secondAccount, thirdAccount };
  }

  describe("Deployment", function () {
    it("Should set the owner", async function () {
      const { multiSend, deployerAccount } = await loadFixture(deployMultiSendFixture);

      expect(await multiSend.owner()).to.be.equal(deployerAccount.address);
    });

    it("Should set the initial fee", async function () {
      const { multiSend, initialFee } = await loadFixture(deployMultiSendFixture);
  
      expect(await multiSend.fee()).to.be.equal(initialFee);
    });
  });

  describe("Sending tokens", function () {
    it("Should fail if not enough Rose is sent to pay fee", async function () {
      const { multiSend, myToken, secondAccount } = await loadFixture(deployMultiSendFixture);

      const addresses = [secondAccount.address];
      const amounts = [1];

      await expect(multiSend.multiSendToken(myToken.target, addresses, amounts)).to.be.revertedWith("Not enough Rose to pay fee");
    });

    it("Should fail if token transfer approval amount for sender isn't enough", async function () {
      const { multiSend, myToken, secondAccount, initialFee } = await loadFixture(deployMultiSendFixture);

      const addresses = [secondAccount.address];
      const amounts = [1];

      await expect(multiSend.multiSendToken(myToken.target, addresses, amounts, { value: initialFee})).to.be.revertedWith("Insufficient approved spend amount");
    });

    it("Should fail if sender doesn't have enough of the token to send", async function () {
      const { multiSend, myToken, initialFee, secondAccount } = await loadFixture(deployMultiSendFixture);

      const totalToSend = ethers.parseUnits('20000000000', 18); //2b
      const addresses = [secondAccount.address];
      const amounts = [totalToSend];

      await myToken.approve(multiSend.target, totalToSend);
      await expect(multiSend.multiSendToken(myToken.target, addresses, amounts, { value: initialFee })).to.be.revertedWithCustomError(myToken, "ERC20InsufficientBalance");
    });

    it("Should transfer tokens from sender to recipients if enough approved", async function () {
      const { multiSend, myToken, initialFee, deployerAccount, secondAccount } = await loadFixture(deployMultiSendFixture);

      const totalToSend = 1;
      const addresses = [secondAccount.address];
      const amounts = [totalToSend];

      const originalSenderBalance = await myToken.balanceOf(deployerAccount);

      expect(await myToken.balanceOf(secondAccount.address)).to.equal(0);

      await myToken.approve(multiSend.target, totalToSend);

      expect(await myToken.allowance(deployerAccount, multiSend.target)).to.equal(totalToSend);

      await multiSend.multiSendToken(myToken.target, addresses, amounts, { value: initialFee });

      expect(await myToken.balanceOf(secondAccount.address)).to.equal(totalToSend);
      expect(await myToken.balanceOf(deployerAccount.address)).to.equal(originalSenderBalance - BigInt(totalToSend));
    });


    it("Should transfer tokens from sender to multiple recipients", async function () {
      const { multiSend, myToken, initialFee, deployerAccount, secondAccount, thirdAccount } = await loadFixture(deployMultiSendFixture);

      const totalToSend = 20;
      const addresses = [secondAccount.address, thirdAccount.address];
      const amounts = [15, 5];

      const originalSenderBalance = await myToken.balanceOf(deployerAccount);

      expect(await myToken.balanceOf(secondAccount.address)).to.equal(0);
      expect(await myToken.balanceOf(thirdAccount.address)).to.equal(0);

      await myToken.approve(multiSend.target, totalToSend);
      await multiSend.multiSendToken(myToken.target, addresses, amounts, { value: initialFee });

      expect(await myToken.balanceOf(secondAccount.address)).to.equal(15);
      expect(await myToken.balanceOf(thirdAccount.address)).to.equal(5);
      expect(await myToken.balanceOf(deployerAccount.address)).to.equal(originalSenderBalance - BigInt(totalToSend));
    });

    it("Should return extra Rose fee back to sender", async function () {
      const { multiSend, myToken, initialFee, deployerAccount } = await loadFixture(deployMultiSendFixture);

      const totalToSend = 20;
      const { address: randomAddress } = ethers.Wallet.createRandom();
      const { address: randomAddressTwo } = ethers.Wallet.createRandom();
      const addresses = [randomAddress, randomAddressTwo];
      const amounts = [15, 5];

      const originalSenderBalance = await ethers.provider.getBalance(deployerAccount.address);

      const approveTx = await myToken.approve(multiSend.target, totalToSend);
      const approveReceipt = await approveTx.wait();
      let gas = approveReceipt!.gasUsed * approveReceipt!.gasPrice;

      const response = await multiSend.multiSendToken(myToken.target, addresses, amounts, { value: initialFee + 30n });
      const receipt = await response.wait();
      gas = gas + receipt!.gasUsed * receipt!.gasPrice;

      expect(await ethers.provider.getBalance(deployerAccount.address)).to.equal(originalSenderBalance - gas - initialFee);
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
      const { multiSend, initialFee, deployerAccount } = await loadFixture(deployMultiSendFixture);

      const totalToSend = 20;
      const { address: randomAddress } = ethers.Wallet.createRandom();
      const { address: randomAddressTwo } = ethers.Wallet.createRandom();
      const addresses = [randomAddress, randomAddressTwo];
      const amounts = [15, 5];

      const originalSenderBalance = await ethers.provider.getBalance(deployerAccount.address);

      expect(await ethers.provider.getBalance(randomAddress)).to.equal(0);
      expect(await ethers.provider.getBalance(randomAddressTwo)).to.equal(0);

      const response = await multiSend.multiSendRose(addresses, amounts, { value: initialFee + ethers.parseEther(totalToSend.toString()) });
      const receipt = await response.wait();
      const gas = receipt!.gasUsed * receipt!.gasPrice;

      expect(await ethers.provider.getBalance(randomAddress)).to.equal(15);
      expect(await ethers.provider.getBalance(randomAddressTwo)).to.equal(5);
      expect(await ethers.provider.getBalance(deployerAccount.address)).to.equal(originalSenderBalance - gas - initialFee - BigInt(totalToSend));
    });

    it("Should return extra Rose back to sender", async function () {
      const { multiSend, initialFee, deployerAccount } = await loadFixture(deployMultiSendFixture);

      const totalToSend = 20;
      const actualSent = 30;
      const { address: randomAddress } = ethers.Wallet.createRandom();
      const { address: randomAddressTwo } = ethers.Wallet.createRandom();
      const addresses = [randomAddress, randomAddressTwo];
      const amounts = [15, 5];

      const originalSenderBalance = await ethers.provider.getBalance(deployerAccount.address);

      expect(await ethers.provider.getBalance(randomAddress)).to.equal(0);
      expect(await ethers.provider.getBalance(randomAddressTwo)).to.equal(0);

      const response = await multiSend.multiSendRose(addresses, amounts, { value: initialFee + ethers.parseEther(actualSent.toString()) });
      const receipt = await response.wait();
      const gas = receipt!.gasUsed * receipt!.gasPrice;

      expect(await ethers.provider.getBalance(randomAddress)).to.equal(15);
      expect(await ethers.provider.getBalance(randomAddressTwo)).to.equal(5);
      expect(await ethers.provider.getBalance(deployerAccount.address)).to.equal(originalSenderBalance - gas - initialFee - BigInt(totalToSend));
    });
  });

  describe("Fees", function () {
    it("Should allow owner to change the fee", async function () {
      const { multiSend, initialFee } = await loadFixture(deployMultiSendFixture);

      const newFee = initialFee + 20n;

      expect(await multiSend.fee()).to.be.equal(initialFee);
      await multiSend.setFee(newFee);
      expect(await multiSend.fee()).to.be.equal(newFee);
    });

    it("Should increase contract balance after fees paid", async function () {
      const { multiSend, initialFee } = await loadFixture(deployMultiSendFixture);

      expect(await ethers.provider.getBalance(multiSend.target)).to.equal(0);

      const totalToSend = 20;
      const { address: randomAddress } = ethers.Wallet.createRandom();
      const { address: randomAddressTwo } = ethers.Wallet.createRandom();
      const addresses = [randomAddress, randomAddressTwo];
      const amounts = [15, 5];

      expect(await multiSend.fee()).to.be.equal(initialFee);

      const response = await multiSend.multiSendRose(addresses, amounts, { value: initialFee + ethers.parseEther(totalToSend.toString()) });
      await response.wait();

      expect(await ethers.provider.getBalance(multiSend.target)).to.equal(initialFee);
    });

    it("Should fail if withdrawing from no balance", async function () {
      const { multiSend } = await loadFixture(deployMultiSendFixture);

      expect(await ethers.provider.getBalance(multiSend.target)).to.equal(0);

      await expect(multiSend.withdraw()).to.be.revertedWith("No funds to withdraw");
    });

    it("Should fail if non-owner tries to withdraw", async function () {
      const { multiSend, secondAccount } = await loadFixture(deployMultiSendFixture);

      expect(await ethers.provider.getBalance(multiSend.target)).to.equal(0);

      await expect(multiSend.connect(secondAccount).withdraw()).to.be.revertedWithCustomError(multiSend, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to withdraw the balance", async function () {
      const { multiSend, deployerAccount, secondAccount, initialFee } = await loadFixture(deployMultiSendFixture);

      const originalOwnerBalance = await ethers.provider.getBalance(deployerAccount.address);

      const totalToSend = 20;
      const { address: randomAddress } = ethers.Wallet.createRandom();
      const { address: randomAddressTwo } = ethers.Wallet.createRandom();
      const addresses = [randomAddress, randomAddressTwo];
      const amounts = [15, 5];

      expect(await ethers.provider.getBalance(multiSend.target)).to.equal(0);

      expect(await multiSend.fee()).to.be.equal(initialFee);

      await multiSend.connect(secondAccount).multiSendRose(addresses, amounts, { value: initialFee + ethers.parseEther(totalToSend.toString()) });

      expect(await ethers.provider.getBalance(multiSend.target)).to.equal(initialFee);

      const response = await multiSend.withdraw();
      const receipt = await response.wait();
      const gas = receipt!.gasUsed * receipt!.gasPrice;

      expect(await ethers.provider.getBalance(multiSend.target)).to.equal(0);
      expect(await ethers.provider.getBalance(deployerAccount.address)).to.equal((originalOwnerBalance - gas) + initialFee);
    });
  });

});
