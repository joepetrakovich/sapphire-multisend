<script lang="ts">
    import OasisLogo from '$lib/images/oasis-logo-120px.png';
	import SendTokenForm from '$lib/components/SendTokenForm.svelte';
    import SendRoseForm from '$lib/components/SendRoseForm.svelte';
    import { connected } from '$lib/Stores';
    
    enum SendType { ERC20Token, Rose }
    let group: SendType = SendType.ERC20Token;
</script>

<div>
    <div>
        <span>Send:</span>
        <input type="radio" value={SendType.ERC20Token} bind:group disabled={!$connected} id="token" /><label for="token">Tokens</label>
        <input type="radio" value={SendType.Rose} bind:group disabled={!$connected} id="rose" /><label for="rose"><img src={OasisLogo} alt="Oasis Logo" width="16" />Rose</label>
    </div>

    {#key $connected}
        {#if group === SendType.Rose}
            <SendRoseForm />
        {:else}
            <SendTokenForm />
        {/if}
    {/key}
</div>

<style>
    div {
        display: flex;
        flex-direction: column;
        gap: 0.2em;
    }
    div > div, label {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.2em;
    }
    div > div {
        gap: 0.2em;
    }
    span {
        text-wrap: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }
    input {
        display: none;
    }
    label {
        background-color: white;
        border-radius: var(--container-border-radius);
        padding: 0 4px;
        border: 1px solid black;
        cursor: pointer;
        line-height: 1.2em;
    }
    input[type=radio]:checked+label {
        cursor:default;
        box-shadow: inset 0px 0px 5px var(--color-taco-red);
        background-color: #ffa5a5;
    }
    input[type=radio]:disabled+label {
        cursor:default;
        background-color: unset;
        box-shadow: unset;
        opacity: 0.5;
        border-color: gray;
    }
</style>
