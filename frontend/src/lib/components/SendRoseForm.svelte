<script lang="ts">
    import DestinationsTextArea from '$lib/components/DestinationsTextArea.svelte';
    import { ethers } from 'ethers';
    import { connectedToSapphire, fee, signerAddress, unwrappedMultiSend, unwrappedProvider } from '$lib/Stores';
	import WalletConnection from '$lib/components/WalletConnection.svelte';
    import fsm from 'svelte-fsm'

    let balance: bigint;
    let addresses: string[];
    let amounts: number[];
    let total: bigint;
    let destinationsValid: boolean;
    let error: string | undefined;
    let parseError: string | undefined;

    const form = fsm('entering', {
        entering: {
            _enter() {
                balance = 0n;
                total = 0n;
                error = undefined;
            },

            validate: 'validating'
        },
        validating: {
            _enter() {
                const totalAsNumberString = amounts.reduce((partialSum, a) => partialSum + a, 0).toString();
                total = ethers.parseEther(totalAsNumberString);
                
                getRoseBalance()
                    .then((roseBalance) => {
                    balance = roseBalance;
                    if (balance >= total + $fee) {
                        this.success();
                    } else {
                        this.error('Insufficient Rose balance');
                    }
                    })
                    .catch(this.error);
                
            },
            success() { return 'valid' },
            error(e) {
                error = e;
                return 'invalid';
            },
        },
        invalid: {},
        valid: {
            send: 'sending'
        },
        sending: {
            _enter() {
                send()
                  .then(this.success)
                  .catch(this.error);
            },
            success() { return 'complete' },
            error(e) {
                error = e;
                return 'invalid';
            }
        },
        complete: {},
        '*': {
            input: 'entering',
            error(e) {
                error = e;
                return 'invalid';
            }
        }
    });

    $: $signerAddress && form.input();
    $: destinationsValid ? form.validate() : form.input();
    $: parseError ? form.error(parseError) : form.input();

    const getRoseBalance = async () => $unwrappedProvider!.getBalance($signerAddress);
    
    const send = async () => {
        const amountsBigInt = amounts.map(amount => ethers.parseEther(amount.toString()));
        const fee = await $unwrappedMultiSend!.fee();
        const receipt = await $unwrappedMultiSend!.multiSendRose(addresses, amountsBigInt, { value: total + fee });
        await receipt.wait();
    }
</script>

<div>
    <form>        
        <DestinationsTextArea bind:addresses bind:amounts bind:valid={destinationsValid} bind:error={parseError} disabled={!$connectedToSapphire}/>
        
        {#if $connectedToSapphire}
            <button on:click={form.send} disabled={$form !== 'valid'}>{$form === 'sending' ? 'Sending...' : 'Send'}</button> 
        {:else}
            <WalletConnection fullWidth={true} />
        {/if}
    </form>
  
    <details class={$form}>
        <summary>
            state internals 
            {#if error}(error: {error}){/if}
            {#if $form === 'complete'}(multisend complete){/if}
        </summary>
        <span>destinations valid: {destinationsValid}</span>
        <span>form state: {$form}</span>
        <span>balance: {ethers.formatEther(balance)}</span>
        <span>total to send: {ethers.formatEther(total)}</span>
        <span>error: {error}</span>
    </details>
</div>

<style>
    div, form, details {
        display: flex;
        flex-direction: column;
        gap: 0.2em;
    }
    details {
        font-style: italic;
        color: gray;
    }
    details.invalid {
        color: red;
    }
    details.complete {
        color: green;
    }
</style>