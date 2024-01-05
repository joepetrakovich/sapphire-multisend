
## TODAY
----------------
- token valid -> addresses valid -> 
- balance > totalToSend
- allowance > totalToSend (if not, approve button and wait)
- send

- need a valid -> completed state, overrides input clear?
0xB643Ec25c66390d1A4A1130d44CE8C1286C05d0B

0x68d3FCA25c214215699E82453630C07f1331EA9D,2
0xa187beD9FFa27444758407b0E597449F6bAE6B55,300

## NEXT
----------------
- token valid -> addresses valid -> 
- balance > totalToSend
- allowance > totalToSend (if not, approve button and wait)
- send

clean up styles to show token selected. an end state clear
then a final cleanup with name, branding, testnet dapp. announcement.
mainnet after testing

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
