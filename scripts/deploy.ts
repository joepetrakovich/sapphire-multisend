import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log("Deploying the contracts with the account:", deployerAddress);

  const MultiSend = await ethers.getContractFactory("MultiSend");
  const initialFee = ethers.parseEther('2');
  const multiSend = await MultiSend.deploy(deployerAddress, initialFee);
  await multiSend.waitForDeployment();

  console.log(`MultiSend deployed to ${await multiSend.getAddress()} with initial fee: ${ethers.formatEther(initialFee)} Rose`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});