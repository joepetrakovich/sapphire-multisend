
## TODAY
----------------
DONE - refactor selectedAddress
- testnet deploy and announce

## NEXT
----------------

- then a final cleanup with name, branding, 
- mainnet after testing
- make sure not to allow injection attack
- find out if I need to use sapphire.wrap or not, and how to get nice function names in metamask.


## NOTES
---------------
0xB643Ec25c66390d1A4A1130d44CE8C1286C05d0B

0x68d3FCA25c214215699E82453630C07f1331EA9D,1.1
0xa187beD9FFa27444758407b0E597449F6bAE6B55,0.333
0xe2617555665E6311aB45c4C02cb13f3e4C756166,3.22

    it("Should transfer tokens that aren't in whole amounts", async function () {
      const { multiSend, myToken, deployerAccount, secondAccount, thirdAccount } = await loadFixture(deployMultiSendFixture);
      
      const decimals = await myToken.decimals();

      const amountOne = ethers.parseUnits('0.8', decimals);
      const amountTwo = ethers.parseUnits('0.5', decimals);

      const totalToSend = ethers.parseUnits('1.3', decimals);
      const addresses = [secondAccount.address, thirdAccount];
      const amounts = [amountOne, amountTwo];

      const originalSenderBalance = await myToken.balanceOf(deployerAccount);

      expect(await myToken.balanceOf(secondAccount.address)).to.equal(0);

      await myToken.approve(multiSend.target, totalToSend);
     
      expect(await myToken.allowance(deployerAccount, multiSend.target)).to.equal(totalToSend);

      await multiSend.multiSendToken(myToken.target, addresses, amounts);

      expect(await myToken.balanceOf(secondAccount.address)).to.equal(amountOne);
      expect(await myToken.balanceOf(thirdAccount.address)).to.equal(amountTwo);
      expect(await myToken.balanceOf(deployerAccount.address)).to.equal(originalSenderBalance - BigInt(totalToSend));
    });
