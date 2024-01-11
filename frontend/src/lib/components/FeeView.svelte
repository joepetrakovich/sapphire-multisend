<script lang="ts">
	import { fee, connected } from "$lib/Stores";
	import { ethers } from "ethers";
</script>

<span>
    {#if $connected}
        Fee: {ethers.formatEther($fee)} Rose
    {/if}
</span>

<style>
    span {
        font-size: 1em;
        opacity: 0.6;
    }
</style>