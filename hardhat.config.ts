//import '@oasisprotocol/sapphire-hardhat';
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require('dotenv').config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      accounts: {
        mnemonic: process.env.SEED_PHRASE,
      },
      chainId: 1337
    },
    sapphire_testnet: {
      url: "https://testnet.sapphire.oasis.dev",
      accounts: process.env.PRIVATE_KEYS?.split(','),
      chainId: 0x5aff,
    }
  },
  mocha: {
    timeout: 60000
  }
};

export default config;