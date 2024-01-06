<script lang="ts">
    import { connectedToSapphire } from '$lib/Stores';
    import OasisLogo from '$lib/images/oasis-logo-120px.png';
	import SendTokenForm from '$lib/components/SendTokenForm.svelte';
    import SendRoseForm from '$lib/components/SendRoseForm.svelte';
    
    enum SendType { ERC20Token, Rose }
    let group: SendType = SendType.ERC20Token;
</script>

<div>
    <div>
        What are you sending?
        <label><input type="radio" value={SendType.ERC20Token} bind:group disabled={!$connectedToSapphire} />Token</label>
        <label><input type="radio" value={SendType.Rose} bind:group disabled={!$connectedToSapphire} /><img src={OasisLogo} alt="Oasis Logo" width="16" />Rose</label>
    </div>

    {#if group === SendType.Rose}
        <SendRoseForm />
    {:else}
        <SendTokenForm />
    {/if}
</div>

<style>
    div {
        display: flex;
        flex-direction: column;
        gap: 0.4em;
    }
    div > div, label {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.2em;
    }
    label {
        line-height: 0;
    }
</style>
