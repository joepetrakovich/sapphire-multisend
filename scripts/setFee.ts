import { ethers } from "hardhat";
import ca from '../frontend/src/lib/contracts/contract-addresses.json';
import artifact from '../frontend/src/lib/contracts/MultiSend.json';

async function main() {
  const [deployer] = await ethers.getSigners();

  const multiSendContract = new ethers.Contract(
    ca.MultiSend,
    artifact.abi,
    deployer);
    
    await multiSendContract.setFee(ethers.parseEther('2'));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});