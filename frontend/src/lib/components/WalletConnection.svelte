<script lang="ts">
    import CurrentAccount from '$lib/components/CurrentAccount.svelte';
    import { OasisNetworkStatus } from '$lib/Models';
    import { oasisNetworkStatus } from '$lib/Stores';
	import { OASIS_SAPPHIRE_TESTNET, connectWallet, switchNetworkOrAddIfNotExists } from '$lib/Network';

    export let showAddress: boolean = false;
    export let fullWidth: boolean = false;

    const handleConnectToSapphire = () => {
       switchNetworkOrAddIfNotExists(OASIS_SAPPHIRE_TESTNET);
    };

    const handleConnectWallet = () => {
        connectWallet();
    }
</script>

<div>
    {#if $oasisNetworkStatus === OasisNetworkStatus.INITIALIZING}
        <button class:fullWidth disabled>Initializing...</button>
    {:else if $oasisNetworkStatus === OasisNetworkStatus.PROVIDER_NOT_FOUND}
        <a class:fullWidth href="https://metamask.io/" target="_blank" rel="noreferrer">Install MetaMask</a>
    {:else if $oasisNetworkStatus === OasisNetworkStatus.WALLET_NOT_CONNECTED}
        <button class:fullWidth on:click={handleConnectWallet}>Connect</button>
    {:else if $oasisNetworkStatus === OasisNetworkStatus.ON_SAPPHIRE_PARATIME}
        <CurrentAccount {showAddress} />
    {:else}
        <button class:fullWidth on:click={handleConnectToSapphire}>Connect to Sapphire</button>
    {/if}
</div>

<style>
    .fullWidth {
        width: 100%;
    }
</style>