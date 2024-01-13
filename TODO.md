
## TODAY
----------------
DONE - user rejected error better handling.
DONE - remove copyright, its a dapp.
DONE - attempt refactor it so that a signer change can trigger a reset recalc from top down, so values stay but balances and allowances recalc.
DONE - also could have textarea red if not enough balance errors

- token/rose balance view (could be annoying with massive amounts, need that 9B util in rose derby? that only worked with ether tho.. look for library
  can be reminiscent of metamask's token amount display. is there an alg


## NEXT
----------------

## NOTES
---------------
Currently using unwrapped providers because they don't seem to be
doing anything either way and I don't have any view calls that use
msg.sender.

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