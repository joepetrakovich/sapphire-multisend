<script lang="ts">
    import { ethers } from 'ethers';
    import { type Token } from '$lib/Models';
    import GenericERC20 from "$lib/contracts/GenericERC20.json";
    import fsm from 'svelte-fsm'

    export let disabled: boolean;
    export let token: Token | undefined;
    export let valid: boolean;

    let address: string;
    let error: string | undefined;

    export const state = fsm('entering', {
        entering: {
            _enter() {
                error = undefined;
                token = undefined;
            },
            change: 'loading'
        },
        loading: {
            _enter() {
                address = address.trim();
                getTokenDetails()
                  .then(this.loaded)
                  .catch(this.error)
            },

            loaded(details: Token) {
                token = details
                return 'valid'; 
            },

            error(e) {
				error = e;
                return 'invalid';
            }
        },
        valid: {
            input: 'entering'
        },
        invalid: {
            input: 'entering'
        }
    });

    $: valid = $state === 'valid';

    const getTokenDetails = async () => {
        if (!ethers.isAddress(address)) {
            throw new Error('not an address');
        }

        const tokenContract = new ethers.Contract(
            address,
            GenericERC20.abi,
            new ethers.BrowserProvider(window.ethereum)
        );

        let name: string = await tokenContract.name();
        let symbol: string = await tokenContract.symbol();
        let decimals: number = await tokenContract.decimals();       
        
        return { name, symbol, decimals, address }; 
    }
</script>

<input type="text" class={$state} bind:value={address} on:change={state.change} on:input={state.input} {disabled} placeholder="Enter a token address..." />

<style>
    .invalid {
        border:2px solid red;
    }
    .valid {
        border:2px solid lightgreen;
    }
</style>

