 // SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MultiSend is Ownable {

    constructor(address initialOwner) Ownable(initialOwner) { }

    function multiSendToken(IERC20 tokenAddr, address[] calldata addresses, uint256[] calldata amounts) external {
        uint total = 0;
        for(uint8 i = 0; i < amounts.length; i++){
            total = total + amounts[i];
        }

        require(total <= tokenAddr.allowance(msg.sender, address(this)), "Insufficient approved spend amount");

        for (uint8 j = 0; j < addresses.length; j++) {
            tokenAddr.transferFrom(msg.sender, addresses[j], amounts[j]);
        }
    }

    function multiSendRose(address payable[] calldata addresses, uint256[] calldata amounts) external payable {
        uint total = 0;
        for(uint8 i = 0; i < amounts.length; i++){
            total = total + amounts[i];
        }

        require(msg.value >= total, "Not enough Rose");

        for (uint8 j = 0; j < addresses.length; j++) {
            (bool success, ) = addresses[j].call{ value: amounts[j] }("");
            require(success, "Transfer failed.");
        }

        //return change
        if (msg.value > total){
            (bool success, ) = msg.sender.call{ value: msg.value - total }("");
            require(success, "Transfer failed.");
        }
    }

    function destroy(address payable to) public onlyOwner {
        selfdestruct(to);
    }

}