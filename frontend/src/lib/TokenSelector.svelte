<script lang="ts">
    import { ethers } from 'ethers';
    import { type Token } from '$lib/Models';
    import GenericERC20 from "$lib/contracts/GenericERC20.json";
    import fsm from 'svelte-fsm'

    export let disabled: boolean;

    let address: string;
    let token: Token | undefined;
    let error: string | undefined;

    const form = fsm('entering', {
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

<input type="text" bind:value={address} on:change={form.change} on:input={form.input} {disabled} placeholder="Enter a token address..." />
<span>t: {token?.name}</span>
<span>e: {error}</span>
<span>form state: {$form}</span>


