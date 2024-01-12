import { type Network, NetworkStatus } from "./Models";
import { ethers } from "ethers";
import ca from "$lib/contracts/contract-addresses.json";

const { MODE } = import.meta.env
const SWITCH_CHAIN_ERROR_CHAIN_NOT_ADDED: number = 4902;
const UNRECOGNIZED_CHAIN_ERROR: number = -32603;

export const OASIS_SAPPHIRE_TESTNET: Network = {
    name: "Sapphire",
    chainIdHex:  "0x5aff",
    chainIdDecimal: 23295,
    rpcUrls: ["https://testnet.sapphire.oasis.dev"],
    blockExplorerUrls: ["https://testnet.explorer.sapphire.oasis.dev"],
    nativeCurrency: {
        name: "TEST", 
        symbol: "TEST",
        decimals: 18
    }
}

export const OASIS_SAPPHIRE_MAINNET: Network = {
    name: "Sapphire",
    chainIdHex:  "0x5afe",
    chainIdDecimal: 23294,
    rpcUrls: ["https://sapphire.oasis.io"],
    blockExplorerUrls: ["https://explorer.sapphire.oasis.io"],
    nativeCurrency: {
        name: "ROSE", 
        symbol: "ROSE",
        decimals: 18
    }
}

export const HARDHAT_NETWORK: Network = {
    name: "Hardhat",
    chainIdHex:  "0x539",
    chainIdDecimal: 1337,
    rpcUrls: ["http://127.0.0.1:8545/"],
    blockExplorerUrls: ["https://localhost"],
    nativeCurrency: {
        name: "ETH", 
        symbol: "ETH",
        decimals: 18
    }
}

export const DESIRED_NETWORK: Network = MODE === 'testnet' ? OASIS_SAPPHIRE_TESTNET : MODE === 'mainnet' ? OASIS_SAPPHIRE_MAINNET : HARDHAT_NETWORK;
export const TACOSENDER_CONTRACT_ADDRESS: string = MODE === 'testnet' ? ca.MultiSendTestnet : MODE === 'mainnet' ? ca.MultiSendMainnet : ca.MultiSendHardhat;

  function addNetwork(network: Network) {
    return window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
            chainId: network.chainIdHex,
            rpcUrls: network.rpcUrls,
            chainName: network.name,
            nativeCurrency: network.nativeCurrency,
            blockExplorerUrls: network.blockExplorerUrls
        }]
    });
  }
  
  function switchNetwork(chainId: string) {
    return window.ethereum.request({
         method: 'wallet_switchEthereumChain',
         params: [{ chainId: chainId }]
    });
  }
  
  export function switchNetworkOrAddIfNotExists(network: Network) {
    switchNetwork(network.chainIdHex)
      .catch((error: { code: number; }) => {
          if (error.code === SWITCH_CHAIN_ERROR_CHAIN_NOT_ADDED ||
              error.code === UNRECOGNIZED_CHAIN_ERROR) {
              addNetwork(network);
          } else {
              throw error;
          }
      });
  }

  export function connectWallet() {
    window.ethereum.request({ method: 'eth_requestAccounts' })
    .catch((error: { code: number; }) => {
    if (error.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log('Please connect to MetaMask.');
    } else {
        console.error(error);
    }
    });
}

export async function getNetworkConnectionStatus(chainId: number): Promise<NetworkStatus> {
    try {    
        if (!window.ethereum) {
            return NetworkStatus.PROVIDER_NOT_FOUND;
        }
 
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (!accounts?.length) {
            return NetworkStatus.WALLET_NOT_CONNECTED;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();

        if (network.chainId.toString() === chainId.toString()) {
            return NetworkStatus.ON_DESIRED_NETWORK;
        }
        
        return NetworkStatus.ON_DIFFERENT_NETWORK;

    } catch (error) {
        console.error(`An error occurred while trying to connect to the network: ${error}`);
        return NetworkStatus.PROVIDER_NOT_FOUND;
    }
}