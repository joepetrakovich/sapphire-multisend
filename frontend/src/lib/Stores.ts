import { OasisNetworkStatus } from "./Models";
import { getOasisNetworkConnectionStatus } from "./Network";
import { readable, derived, type Readable } from "svelte/store";
import { ethers } from "ethers";
import * as sapphire from '@oasisprotocol/sapphire-paratime';
import MultiSendArtifact from "$lib/contracts/MultiSend.json";
import contractAddress from "$lib/contracts/contract-addresses.json";

export const oasisNetworkStatus = readable<OasisNetworkStatus>(OasisNetworkStatus.INITIALIZING, set => {
    const interval = setInterval(async () => {
        const status = await getOasisNetworkConnectionStatus();
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

export const connectedToSapphire: Readable<boolean> = derived(oasisNetworkStatus, ($oasisNetworkStatus) => $oasisNetworkStatus === OasisNetworkStatus.ON_SAPPHIRE_PARATIME);

export const provider: Readable<ethers.BrowserProvider|undefined> = derived([connectedToSapphire, signerAddress], ([$connected], set) => {
    $connected ? set(sapphire.wrap(new ethers.BrowserProvider(window.ethereum))) : set(undefined);
});

export const unwrappedProvider: Readable<ethers.BrowserProvider|undefined> = derived([connectedToSapphire, signerAddress], ([$connected], set) => {
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
            contractAddress.MultiSend,
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
            contractAddress.MultiSend,
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
