<script lang="ts">
    import { ethers } from 'ethers';

    export let symbol: string;
    export let unit: number;
    export let total: bigint;
    export let addresses: string[];
    export let success: boolean = false;  
</script>

<div class:success>
    {#if success}
        <span>Send successful!</span>
    {:else}
        <span><slot name="message">Everything look good?</slot></span>
    {/if}
    <span>
        {success ? "Sent" : "Sending"} {ethers.formatUnits(total, unit)} 
        {symbol} to {addresses.length} address{#if addresses.length > 1}es{/if}
    </span>
    <slot />
</div>

<style>
    div {
        display: flex;
        flex-direction: column;
        gap:0.2em;
        padding: 0.2em;
        border-radius: var(--container-border-radius);
        border: 2px solid lightgray;
        background-color: #fff;
    }
    div.success {
        border: var(--border-success);
        background-color: var(--background-color-success);
    }
    span:first-child {
        display: flex;
        align-items: center;
        gap: 0.2em;
        font-size: 0.8em;
        opacity: 0.6;
    }
    span:nth-child(2) {
        font-family: monospace;
        color: gray;
    }
</style>