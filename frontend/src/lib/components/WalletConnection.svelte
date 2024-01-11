<script lang="ts">
    import CurrentAccount from '$lib/components/CurrentAccount.svelte';
    import { NetworkStatus } from '$lib/Models';
    import { networkStatus } from '$lib/Stores';
	import { DESIRED_NETWORK, connectWallet, switchNetworkOrAddIfNotExists } from '$lib/Network';

    export let showAddress: boolean = false;
    export let fullWidth: boolean = false;

    const handleConnectToNetwork = () => {
       switchNetworkOrAddIfNotExists(DESIRED_NETWORK);
    };

    const handleConnectWallet = () => {
        connectWallet();
    }
</script>

<div>
    {#if $networkStatus === NetworkStatus.INITIALIZING}
        <button class:fullWidth disabled>Initializing...</button>
    {:else if $networkStatus === NetworkStatus.PROVIDER_NOT_FOUND}
        <a class:fullWidth href="https://metamask.io/" target="_blank" rel="noreferrer">Install MetaMask</a>
    {:else if $networkStatus === NetworkStatus.WALLET_NOT_CONNECTED}
        <button class:fullWidth on:click={handleConnectWallet}>Connect</button>
    {:else if $networkStatus === NetworkStatus.ON_DESIRED_NETWORK}
        <CurrentAccount {showAddress} />
    {:else}
        <button class:fullWidth on:click={handleConnectToNetwork}>Connect to {DESIRED_NETWORK.name}</button>
    {/if}
</div>

<style>
    .fullWidth {
        width: 100%;
    }
</style>