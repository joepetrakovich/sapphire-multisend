<script lang="ts">
    import CurrentAccount from '$lib/CurrentAccount.svelte';
    import { OasisNetworkStatus } from '$lib/Models';
    import { oasisNetworkStatus } from '$lib/Stores';
	import { OASIS_SAPPHIRE_TESTNET, connectWallet, switchNetworkOrAddIfNotExists } from '$lib/Network';

    export let showAddress: boolean = false;

    const handleConnectToSapphire = () => {
       switchNetworkOrAddIfNotExists(OASIS_SAPPHIRE_TESTNET);
    };

    const handleConnectWallet = () => {
        connectWallet();
    }
</script>

<div>
    {#if $oasisNetworkStatus === OasisNetworkStatus.INITIALIZING}
        <button disabled>Initializing...</button>
    {:else if $oasisNetworkStatus === OasisNetworkStatus.PROVIDER_NOT_FOUND}
        <a href="https://metamask.io/" target="_blank" rel="noreferrer">Install MetaMask</a>
    {:else if $oasisNetworkStatus === OasisNetworkStatus.WALLET_NOT_CONNECTED}
        <button on:click={handleConnectWallet}>Connect</button>
    {:else if $oasisNetworkStatus === OasisNetworkStatus.ON_SAPPHIRE_PARATIME}
        <CurrentAccount {showAddress} />
    {:else}
        <button on:click={handleConnectToSapphire}>Connect to Sapphire</button>
    {/if}
</div>