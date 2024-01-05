<script lang="ts">
	import { fee } from "$lib/Stores";
	import { ethers } from "ethers";

</script>

<span>
    {`Fee: ${ethers.formatEther($fee)} Rose`} 
</span>

<style>
    span {
        font-size: 1em;
        opacity: 0.6;
    }
</style>