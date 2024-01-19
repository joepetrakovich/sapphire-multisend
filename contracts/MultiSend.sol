 // SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MultiSend is Ownable {

    uint public fee;

    constructor(address initialOwner, uint initialFee) Ownable(initialOwner) {
        fee = initialFee;
     }

    function multiSendToken(IERC20 tokenAddr, address[] calldata addresses, uint256[] calldata amounts) external payable {
        uint total = 0;
        for(uint i = 0; i < amounts.length; i++){
            total = total + amounts[i];
        }

        require(msg.value >= fee, "Not enough Rose to pay fee");
        require(total <= tokenAddr.allowance(msg.sender, address(this)), "Insufficient approved spend amount");

        for (uint j = 0; j < addresses.length; j++) {
            tokenAddr.transferFrom(msg.sender, addresses[j], amounts[j]);
        }

        //return change
        if (msg.value > fee){
            (bool success, ) = msg.sender.call{ value: msg.value - fee }("");
            require(success, "Transfer failed.");
        }
    }

    function multiSendRose(address payable[] calldata addresses, uint256[] calldata amounts) external payable {
        uint total = 0;
        for(uint i = 0; i < amounts.length; i++){
            total = total + amounts[i];
        }

        uint requiredAmount = total + fee;
        require(msg.value >= requiredAmount, "Not enough Rose");

        for (uint j = 0; j < addresses.length; j++) {
            (bool success, ) = addresses[j].call{ value: amounts[j] }("");
            require(success, "Transfer failed.");
        }

        //return change
        if (msg.value > requiredAmount){
            (bool success, ) = msg.sender.call{ value: msg.value - requiredAmount }("");
            require(success, "Transfer failed.");
        }
    }

    function setFee(uint _fee) public onlyOwner {
        fee = _fee;
    }

    function withdraw() external onlyOwner {
        require(address(this).balance > 0, "No funds to withdraw");

        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Transfer failed.");
    }
}