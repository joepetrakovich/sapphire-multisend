<script lang="ts">
    import { ethers } from 'ethers';
    import Papa from 'papaparse';
    import fsm from 'svelte-fsm'

    export let disabled: boolean; 
    export let addresses: string[];
    export let amounts: number[];
    export let valid: boolean;

    let text: string;
    let lineNum = 0;
    let error: string | undefined;

    const state = fsm('entering', {
        entering: {
            _enter() {
                error = undefined;
                lineNum = 0;
                addresses = amounts = [];
            },
            parse() {
                text = text.trim();  
                if (text) {
                    return 'parsing';
                }
            }
        },
        parsing: {
            _enter() {
                parse();
            },

            success: 'valid',

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

    const step = (results: any, parser: any) => {

        lineNum += 1;

        if (results.errors.length) {
            console.log(results.errors);
            state.error('error parsing addresses and amounts.');
            parser.abort();
            return;
        }

        if (results.data.length != 2) {
            state.error(`line ${lineNum} not formatted properly.`);
            parser.abort();
            return;
        }

        if (!ethers.isAddress(results.data[0])) {
            state.error(`line ${lineNum} not an address.`);
            parser.abort();
            return;
        }
        const address = results.data[0];

        const amount = Number(results.data[1]);
        if (Number.isNaN(amount) || amount <= 0) {
            state.error(`line ${lineNum} amount must be a number greater than 0.`);
            parser.abort();
            return;
        }

        addresses = [...addresses, address];
        amounts = [...amounts, amount];
        //const amount: bigint = ethers.parseUnits(results.data[1], token.decimals);
    }

    const complete = () => {
        if ($state !== 'invalid') {
            state.success();
        }
    }

    const parse = () => Papa.parse(text, { delimiter: ',', step, complete });
</script>

<textarea rows="10" class={$state} bind:value={text} on:change={state.parse} on:input={state.input} {disabled} placeholder="Enter comma-delimeted addresses and amounts..." />

<style>
    .invalid {
        border:2px solid red;
    }
    .valid {
        border:2px solid lightgreen;
    }
</style>