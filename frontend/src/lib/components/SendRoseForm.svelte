<script lang="ts">
    import DestinationsTextArea from '$lib/components/DestinationsTextArea.svelte';
    import { ethers } from 'ethers';
    import { connected, fee, signerAddress, unwrappedMultiSend, provider } from '$lib/Stores';
	import WalletConnection from '$lib/components/WalletConnection.svelte';
    import fsm from 'svelte-fsm'
	import { focus, sumDecimalsAsBigInt } from '$lib/Utils';
	import SendSummary from './SendSummary.svelte';
	import type BigNumber from 'bignumber.js';
	import Flasher from './Flasher.svelte';

    let balance: bigint;
    let addresses: string[];
    let amounts: BigNumber[];
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
                try {
                    total = sumDecimalsAsBigInt(amounts, 18);
                } catch (e) {
                    this.error(e);
                    return;
                }
                
                getRoseBalance()
                    .then((roseBalance) => {
                        balance = roseBalance;
                        if (balance >= total + $fee) {
                            this.success();
                        } else if (balance >= total) {
                            this.error('Insufficient Rose balance to pay fee');
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

    $: destinationsValid ? form.validate() : form.input();
    $: parseError ? form.error(parseError) : form.input();

    const getRoseBalance = async () => $provider!.getBalance($signerAddress);
    
    const send = async () => {
        const amountsBigInt = amounts.map(amount => ethers.parseEther(amount.toFixed()));
        const fee = await $unwrappedMultiSend!.fee();
        const receipt = await $unwrappedMultiSend!.multiSendRose(addresses, amountsBigInt, { value: total + fee });
        await receipt.wait();
    }
</script>

<div>
    <form>        
        <DestinationsTextArea bind:addresses bind:amounts bind:valid={destinationsValid} bind:error={parseError} disabled={!$connected}/>
        
        {#if !$connected}
            <WalletConnection fullWidth={true} />
        {:else if $form !== 'entering' && $form !== 'invalid'}
            <SendSummary symbol="ROSE" unit={18} {addresses} {total} success={$form === 'complete'}>
                <svelte:fragment slot="message">
                    {#if $form === 'sending'}<Flasher />Sending Rose...{:else}Everything look good?{/if}
                </svelte:fragment>
                {#if $form === 'valid'}
                    <button class="btn-primary" on:click={form.send} use:focus>Send</button>
                {:else if $form === 'sending'}
                    <button disabled>Sending...</button>
                {/if}
            </SendSummary>
        {/if}
    </form>
    {#if error}<span>{error}</span>{/if}
</div>

<style>
    div, form {
        display: flex;
        flex-direction: column;
        gap: 0.2em;
    }
    span {
        font-style: italic;
        color: red;
    }
</style>