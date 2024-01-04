<script lang="ts">
    import { ethers } from 'ethers';
    import GenericERC20 from "$lib/contracts/GenericERC20.json";
	import type { Token } from './Models';
    import { createEventDispatcher } from 'svelte';

    export let token: Token;

    const dispatch = createEventDispatcher();
    let value: string;

    //could have separate flows for rose vs token but for now, 'if' branch.

	const getTokenDetails = async () => {
        if (!value?.trim()) {
            return;
        }

        //todo, a real selector arg?
        if (value === "R") { 
            token = { 
                name: "ROSE", 
                symbol: "ROSE", 
                decimals: 18,
                isChainNativeCurrency: true
            };
        } else {
            const contract = new ethers.Contract(
                value,
                GenericERC20.abi,
                new ethers.BrowserProvider(window.ethereum));

            let name = await contract.name(),
            symbol = await contract.symbol(),
            decimals = await contract.decimals();   
            token = { 
                name, 
                symbol, 
                decimals, 
                address: contract.target.toString(), 
                isChainNativeCurrency: false 
            };
        }

        dispatch('tokenselected', token); 
    };
</script>

<input type="text" bind:value on:change={getTokenDetails} placeholder="Enter a token address..." />


