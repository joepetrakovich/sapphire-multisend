<script lang="ts">
    import { ethers } from 'ethers';

    export let token: string;
    export let unit: number;
    export let total: bigint;
    export let numAddresses: number;
</script>

<div>
    <span>{token}</span>
    <span>{ethers.formatUnits(total, unit)}</span>
    <span>{numAddresses}</span>
</div>

