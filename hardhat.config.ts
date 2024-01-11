//import '@oasisprotocol/sapphire-hardhat';
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require('dotenv').config();

const config: HardhatUserConfig = {
  solidity: "0.8.22",
  networks: {
    hardhat: {
      accounts: {
        mnemonic: process.env.SEED_PHRASE_FOR_HARDHAT,
      },
      chainId: 1337
    },
    sapphire_testnet: {
      url: "https://testnet.sapphire.oasis.dev",
      accounts: process.env.TESTNET_PRIVATE_KEYS?.split(','),
      chainId: 0x5aff,
    },
    sapphire_mainnet: {
      url: "https://sapphire.oasis.io",
      accounts: process.env.MAINNET_PRIVATE_KEYS?.split(','),
      chainId: 0x5afe,
    }
  },
  mocha: {
    timeout: 60000
  }
};

export default config;