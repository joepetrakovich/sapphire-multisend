import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log("Deploying the contracts with the account:", deployerAddress);

  const MyToken = await ethers.getContractFactory("MyToken");
  const MultiSend = await ethers.getContractFactory("MultiSend");
  const myToken = await MyToken.deploy();
  const initialFee = ethers.parseEther('10');
  const multiSend = await MultiSend.deploy(deployerAddress, initialFee);
  await myToken.waitForDeployment();
  await multiSend.waitForDeployment();

  console.log(`MyToken deployed to ${await myToken.getAddress()}`);
  console.log(`MultiSend deployed to ${await multiSend.getAddress()} with initial fee: ${ethers.formatEther(initialFee)} Rose`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});