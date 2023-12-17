
## TODAY
----------------
DONE - connect wallet
- implement approve spend
DONE -- push a test erc20 with tokens
-- push a contract that can do the multisend
-- send tokens to holder
-- 


## NEXT
----------------
- implement the send with gas estimation.
- clean up styles
- move on!

## NOTES
---------------

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