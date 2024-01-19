
## TODAY
----------------
- allow sending tokens to more than 180 addresses
DONE -- fix uint8 overflow
DONE -- set gas limit
-- seems I can send 1280 on testnet
-- 500 on mainnet.
-- gaslimit over 15m gets coalesce error
-- reverify on test and main

## NEXT
----------------
- sending over 180 addresses runs out of gas. 
-- first fixing uint8 overflow
-- then setting gas to 15_000_000 seem to be max at least on testnet but allows sending 1023 addresses tokens. prob more rose. 

Error: could not coalesce error (error={ "code": -32603, "message": "Internal JSON-RPC error." }, payload={ "id": 147, "jsonrpc": "2.0", "method": "eth_sendTransaction", "params": [ { "data": "0x8e89971...(truncated)", "from": "0xbb50dc2148e46dd852cc611935d2996a45c5684c", "gas": "0x1036640", "to": "0x2ca099ae8f22984104ff6e910f2809b7730eb9e8", "value": "0x1bc16d674ec80000" } ] }, code=UNKNOWN_ERROR, version=6.9.0)

-- is it the global per block limit or just gas estimation?
-- can I use gas estimation via the sapphire wrapper and see what is suggests?
-- is it how the array is getting created?

- token/rose balance view (could be annoying with massive amounts, need that 9B util in rose derby? that only worked with ether tho.. look for library
  can be reminiscent of metamask's token amount display. is there an alg


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