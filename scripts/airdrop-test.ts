import { ethers } from "hardhat";
import fs from 'fs';
import Papa from 'papaparse';
import ca from '../frontend/src/lib/contracts/contract-addresses.json';
import artifact from '../artifacts/contracts/MultiSend.sol/MultiSend.json';
import myTokenArtifact from '../artifacts/contracts/MyToken.sol/MyToken.json';

async function main() {
  const [deployer] = await ethers.getSigners();

  const multiSend = new ethers.Contract(
    //ca.MultiSendHardhat,
    ca.MultiSendTestnet,
    artifact.abi,
    deployer);

  
  const token = '0x92F17B164eA66f21E184b832261E8ba6642a568F' ; //saph
//const token = '0x736cbB6a7E2e794b44270DFe718b8830d53943A2'; //hh

  const myToken = new ethers.Contract(
    token,
    myTokenArtifact.abi,
  deployer);

  console.log('Adding eligible addresses...');

  const fee = await multiSend.fee();
  console.log('fee: ', fee);

  let csv = fs.readFileSync('./scripts/airdrop-addresses.txt').toString();

  let addresses: string[], amounts: string[];

const parse = Papa.parse(csv, { delimiter: ',', dynamicTyping: true });
addresses = parse.data.map(function(x) {
  return x[0];
});

let notAddrCount = 0;
amounts = parse.data.map(function(x) {
  if (!ethers.isAddress(x[1])) {
    notAddrCount++;
    //console.log(`${x[1]} IS NOT ADDRESS`);
  }
  return x[1];
});

console.log(notAddrCount);
console.log(addresses);
console.log(amounts);

await myToken.approve(multiSend.target, ethers.parseUnits('1023', 18));
console.log('approved');
const tx = await multiSend.multiSendToken(token, addresses, amounts, { value: fee });
const rec = await tx.wait();
console.log(rec);
console.log('done');

  // let parsed = Papa.parse(addresses);
  // console.log(parsed.data);
  // addresses = addresses.map(a => a.toLowerCase());
  // let unique = [...new Set(addresses)];

  // const chunkSize = 50;
  // for (let i = 0; i < addresses.length; i += chunkSize) {
  //     const chunk = addresses.slice(i, i + chunkSize);
  //     //console.log(chunk);
  //     const tx = await airdropEligible.addEligibleAddresses(chunk, { gasLimit: 10_000_000 });
  //     await tx.wait();
  //     console.log('batch sent', i);
  // }

  // const tx = await multiSend.multiSendToken(parsed.data, { value: fee, gasLimit: 30_000_000 });
  // await tx.wait();

  // console.log('Addresses added, now checking they exist...');
  // const eligibleAddresses = await airdropEligible.getEligibleAddresses();
  // console.log(eligibleAddresses);
  // console.log('is 0x6402D4C99AC42CB0747eaf6eb23773306C37CbA4 eligible? (should be):  ');
  // console.log(await airdropEligible.checkEligibility('0x6402D4C99AC42CB0747eaf6eb23773306C37CbA4'));

  // console.log('is 0xBb50dC2148E46dD852cc611935d2996a45C5684C eligible? (should NOT be):  ');
  // console.log(await airdropEligible.checkEligibility('0xBb50dC2148E46dD852cc611935d2996a45C5684C'));

  // console.log('orig length: ', unique.length);
  // console.log('final count', eligibleAddresses.length)
  // console.log('done.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});