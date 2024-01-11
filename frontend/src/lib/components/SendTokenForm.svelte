<script lang="ts">
    import DestinationsTextArea from '$lib/components/DestinationsTextArea.svelte';
    import TokenSelector from '$lib/components/TokenSelector.svelte';
    import { ethers } from 'ethers';
    import { type Token } from '$lib/Models';
    import { fee, signerAddress, unwrappedMultiSend, provider, unwrappedSigner, connected } from '$lib/Stores';
    import GenericERC20 from "$lib/contracts/GenericERC20.json";
	import WalletConnection from '$lib/components/WalletConnection.svelte';
    import fsm from 'svelte-fsm'
	import { focus, sumDecimalsAsBigInt } from '$lib/Utils';
	import SendSummary from './SendSummary.svelte';
	import type BigNumber from 'bignumber.js';
	import Flasher from './Flasher.svelte';
	import { TACOSENDER_CONTRACT_ADDRESS } from '$lib/Network';

    let token: Token | undefined;
    let balance: bigint;
    let allowance: bigint;
    let addresses: string[];
    let amounts: BigNumber[];
    let total: bigint;
    let tokenValid: boolean, destinationsValid: boolean;
    let error: string | undefined;
    let tokenError: string | undefined;
    let parseError: string | undefined;

    const form = fsm('entering', {
        entering: {
            _enter() {
                balance = 0n;
                allowance = 0n;
                total = 0n;
                error = undefined;
            },
            validate: 'validating'
        },
        validating: {
            _enter() {
                try {
                    total = sumDecimalsAsBigInt(amounts, token!.decimals);
                } catch (e) {
                    this.error(e);
                    return;
                }

                getTokenBalanceAndAllowance()
                    .then(ba => {
                    balance = ba.balance;
                    allowance = ba.allowance;
                    if (ba.roseBalance < $fee) {
                        this.error('Insufficient Rose balance to pay fee')
                    }
                    else if (balance < total) {
                        this.error('Insufficient token balance')
                    } else if (allowance < total) {
                        this.needsApproval();
                    } else {
                        this.success();
                    }
                    })
                    .catch(this.error);       
            },
            needsApproval() {return 'awaitingApproval'},
            success() { return 'valid' },
            error(e) {
                error = e;
                return 'invalid';
            },
        },
        awaitingApproval: {
            approve: 'approving'
        },
        approving: {
            _enter() {
                approve()
                  .then(this.success)
                  .catch(this.error);
            },
            success() { return 'validating' },
            error(e) {
                error = e;
                return 'invalid';
            }
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

    $: tokenValid && destinationsValid ? form.validate() : form.input();
    $: parseError ? form.error(parseError) : form.input();
    $: tokenError ? form.error(tokenError) : form.input();

    async function getTokenBalanceAndAllowance() {
        const contract = new ethers.Contract(
            token!.address,
            GenericERC20.abi,
            $provider!);

        const roseBalance = await $provider!.getBalance($signerAddress);
        const balance = await contract.balanceOf($signerAddress);
        const allowance = await contract.allowance($signerAddress, TACOSENDER_CONTRACT_ADDRESS);
        
        return { balance, allowance, roseBalance }
    }

    const approve = async () => {
        const contract = new ethers.Contract(
                 token!.address,
                 GenericERC20.abi,
                 $unwrappedSigner!
            );
            
        const tx = await contract.approve(TACOSENDER_CONTRACT_ADDRESS, total, { value: 0 });
        await tx.wait();
    }

    const send = async () => {
        const amountsBigInt = amounts.map(amount => ethers.parseUnits(amount.toFixed(), token!.decimals));
        const fee = await $unwrappedMultiSend!.fee();
        const receipt = await $unwrappedMultiSend!.multiSendToken(token!.address, addresses, amountsBigInt, { value: fee });
        await receipt.wait();
    }
</script>

<div>
    <form>
        <TokenSelector bind:token bind:valid={tokenValid} bind:error={tokenError} disabled={!$connected} /> 
        <DestinationsTextArea bind:addresses bind:amounts bind:valid={destinationsValid} bind:error={parseError} disabled={!$connected}/>

        {#if !$connected}
            <WalletConnection fullWidth={true} />
        {:else if $form !== 'entering' && $form !== 'invalid' && token}
            <SendSummary symbol={token.symbol} unit={token.decimals} {addresses} {total} success={$form === 'complete'}>
                <svelte:fragment slot="message">
                    {#if $form === 'sending'}<Flasher />Sending {token.symbol}...{:else if $form === 'approving'}<Flasher />Approving token allowance...{:else}Everything look good?{/if}
                </svelte:fragment>
                {#if $form === 'awaitingApproval'}
                    <button on:click={form.approve} use:focus>Approve</button>
                {:else if $form === 'valid'}
                    <button class="btn-primary" on:click={form.send} use:focus>Send</button>
                {:else if $form === 'approving' || $form === 'sending'}
                    <button disabled>{$form === 'approving' ? 'Approving...' : 'Sending...'}</button>
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
    button:focus {
        border: 2px solid black;
    }
</style>
