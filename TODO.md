
## TODAY
----------------
DONE - finish up basic parser validation
DONE - on parse success, use outputs to check approvals. if amount already approved, allow send button to be clicked.
DONE -if not enough approved, have approve button clickable.

DONE - implement the send with gas estimation.


## NEXT
----------------
-- send does approve (gas estimate first?)
-- query approval, if enough approved for total amount, allow button to change to send button
- make sure not to allow injection attack
-- on send, estimate gas, send, refresh balance. check
- clean up styles
- move on!
- add a small settable fee

- eventually could do the massdrop thing with claiming since that would allow
recall in case of accident or unclaimed. but for now just get this working enough for rosy airdrop

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
