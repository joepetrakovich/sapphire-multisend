import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log("Deploying the contracts with the account:", deployerAddress);

  const MyToken = await ethers.getContractFactory("MyToken");
  const MultiSend = await ethers.getContractFactory("MultiSend");
  const myToken = await MyToken.deploy();
  const multiSend = await MultiSend.deploy(deployerAddress);
  await myToken.waitForDeployment();
  await multiSend.waitForDeployment();

  console.log(`MyToken deployed to ${await myToken.getAddress()}`);
  console.log(`MultiSend deployed to ${await multiSend.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});