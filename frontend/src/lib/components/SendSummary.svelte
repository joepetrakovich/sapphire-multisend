<script lang="ts">
    import { ethers } from 'ethers';

    export let token: string;
    export let unit: number;
    export let total: bigint;
    export let addresses: string[];
</script>

<div>
    <span>{token}</span>
    <span>{ethers.formatUnits(total, unit)}</span>
    <span>{addresses.length} addresses</span>
</div>

<style>
    div {
        border-radius: var(--container-border-radius);
        border: var(--border-success);
        background-color: var(--background-color-success);
    }
</style>