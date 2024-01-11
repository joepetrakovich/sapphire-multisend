import { NetworkStatus } from "./Models";
import { TACOSENDER_CONTRACT_ADDRESS, DESIRED_NETWORK, getNetworkConnectionStatus } from "./Network";
import { readable, derived, type Readable } from "svelte/store";
import { ethers } from "ethers";
import * as sapphire from '@oasisprotocol/sapphire-paratime';
import MultiSendArtifact from "$lib/contracts/MultiSend.json";

export const networkStatus = readable<NetworkStatus>(NetworkStatus.INITIALIZING, set => {
    const interval = setInterval(async () => {
        const status = await getNetworkConnectionStatus(DESIRED_NETWORK.chainIdDecimal);
        set(status);
    }, 1000);

    return function stop() {
        clearInterval(interval);
    }
});

export const signerAddress = readable<string>('', set => {
    const interval = setInterval(async () => {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            set(accounts?.length ? accounts[0] : '');
        }
    }, 1000);

    return function stop() {
        clearInterval(interval);
    }
});

export const connected: Readable<boolean> = derived(networkStatus, ($oasisNetworkStatus) => $oasisNetworkStatus === NetworkStatus.ON_DESIRED_NETWORK);

export const provider: Readable<ethers.BrowserProvider|undefined> = derived([connected, signerAddress], ([$connected], set) => {
    $connected ? set(sapphire.wrap(new ethers.BrowserProvider(window.ethereum))) : set(undefined);
});

export const unwrappedProvider: Readable<ethers.BrowserProvider|undefined> = derived([connected, signerAddress], ([$connected], set) => {
    $connected ? set(new ethers.BrowserProvider(window.ethereum)) : set(undefined);
});

export const signer: Readable<ethers.JsonRpcSigner|undefined> = derived(provider, ($provider, set) => {
    $provider ? $provider.getSigner().then(set) : set(undefined);
});

export const unwrappedSigner: Readable<ethers.JsonRpcSigner|undefined> = derived(unwrappedProvider, ($unwrappedProvider, set) => {
    $unwrappedProvider ? $unwrappedProvider.getSigner().then(set) : set(undefined);
});

export const multiSend: Readable<ethers.Contract|undefined> = derived(signer, ($signer, set) => {
    if ($signer) {
        set(new ethers.Contract(
            TACOSENDER_CONTRACT_ADDRESS,
            MultiSendArtifact.abi,
            $signer
        ))
    } else {
        set(undefined);
    }
});

export const unwrappedMultiSend: Readable<ethers.Contract|undefined> = derived(unwrappedSigner, ($unwrappedSigner, set) => {
    if ($unwrappedSigner) {
        set(new ethers.Contract(
            TACOSENDER_CONTRACT_ADDRESS,
            MultiSendArtifact.abi,
            $unwrappedSigner
        ))
    } else {
        set(undefined);
    }
});

export const fee: Readable<bigint> = derived(unwrappedMultiSend, ($unwrappedMultiSend, set) => {
    $unwrappedMultiSend?.fee().then(set);
}, BigInt(0));
