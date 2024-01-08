
## TODAY
----------------
DONE - icon, design cleanup
DONE -- bigger icon
DONE -- buttons instead of radios
DONE -- better button colors
DONE -- icon only below 360ish
DONE -- better bg color, red is a little harsh right. hard to see green success state, hard to see token box


## NEXT
----------------
- can add a confirmation box "sending: x rose, 32 addresses.
- verify testnet contract
-- a way to switch to testnet/mainnet via config on netlify
42px logo? mobile / pc
- mainnet after testing
- sapphire wrap everything.
  Currently using unwrapped providers because they don't seem to be
  doing anything either way and I don't have any view calls that use
  msg.sender. for now its testnet so nbd
- error message when sending rose doesnt specify "rose fee"


## NOTES
---------------
0xB643Ec25c66390d1A4A1130d44CE8C1286C05d0B test
0x8a63eCa54A38865396990387110136729bC2273c rosy

0x68d3FCA25c214215699E82453630C07f1331EA9D,1.1
0xa187beD9FFa27444758407b0E597449F6bAE6B55,0.333
0xe2617555665E6311aB45c4C02cb13f3e4C756166,3.22


//error scenario, rounding?
0xB2cBa35E240553c550c48651fa925FdD0892A2F2,0.1
0xB2cBa35E240553c550c48651fa925FdD0892A2F2,0.1
0xB2cBa35E240553c550c48651fa925FdD0892A2F2,0.55
0xB2cBa35E240553c550c48651fa925FdD0892A2F2,0.1
0xB2cBa35E240553c550c48651fa925FdD0892A2F2,0.1
0xB2cBa35E240553c550c48651fa925FdD0892A2F2,0.01
0xB2cBa35E240553c550c48651fa925FdD0892A2F2,0.01
0xB2cBa35E240553c550c48651fa925FdD0892A2F2,0.3
0xB2cBa35E240553c550c48651fa925FdD0892A2F2,0.1
0xB2cBa35E240553c550c48651fa925FdD0892A2F2,0.5
0xB2cBa35E240553c550c48651fa925FdD0892A2F2,0.1111111111111111
0xB2cBa35E240553c550c48651fa925FdD0892A2F2,0.1
0xB2cBa35E240553c550c48651fa925FdD0892A2F2,0.07

wait is it diff on the display?

ui calc of total:
ttl: 2151111111111111000n
fee: 2000000000000000000n

totalasstring
"2.151111111111111"

100000000000000000,100000000000000000,550000000000000000,100000000000000000,100000000000000000,10000000000000000,10000000000000000,300000000000000000,100000000000000000,500000000000000000,111111111111111100,100000000000000000,70000000000000000

    // "MultiSend": "0x59b90e2D66ACB6e3C35400293fF0c1B3E3d6Ffe4"

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
