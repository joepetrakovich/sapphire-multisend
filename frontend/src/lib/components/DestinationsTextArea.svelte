<script lang="ts">
    import { ethers } from 'ethers';
    import Papa from 'papaparse';
    import fsm from 'svelte-fsm'

    export let disabled: boolean; 
    export let addresses: string[];
    export let amounts: number[];
    export let valid: boolean;
    export let error: string | undefined;

    let text: string;
    let lineNum = 0;

    const state = fsm('entering', {
        entering: {
            _enter() {
                error = undefined;
                lineNum = 0;
                addresses = amounts = [];
            },
            parse() {
                text = text?.trim();  
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
            state.error('See console for details.');
            parser.abort();
            return;
        }

        if (results.data.length != 2) {
            state.error(`line ${lineNum} is not formatted properly.`);
            parser.abort();
            return;
        }

        if (!ethers.isAddress(results.data[0])) {
            state.error(`line ${lineNum} is not a valid address.`);
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
    }

    const complete = () => {
        if ($state !== 'invalid') {
            state.success();
        }
    }

    const parse = () => Papa.parse(text, { delimiter: ',', step, complete });
</script>

<textarea rows="10" class={$state} 
          bind:value={text} on:blur={state.parse} on:input={state.input} 
          {disabled} 
          placeholder="Enter a comma-separated address and amount on each line..." 
        />
