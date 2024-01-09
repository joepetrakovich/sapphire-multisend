<script lang="ts">
    import DestinationsTextArea from '$lib/components/DestinationsTextArea.svelte';
    import TokenSelector from '$lib/components/TokenSelector.svelte';
    import { ethers } from 'ethers';
    import { type Token } from '$lib/Models';
    import { connectedToSapphire, fee, signerAddress, unwrappedMultiSend, provider, unwrappedSigner } from '$lib/Stores';
    import GenericERC20 from "$lib/contracts/GenericERC20.json";
    import ca from "$lib/contracts/contract-addresses.json";
	import WalletConnection from '$lib/components/WalletConnection.svelte';
    import fsm from 'svelte-fsm'
	import { sumDecimalsAsBigInt } from '$lib/Utils';
	import SendSummary from './SendSummary.svelte';
	import type BigNumber from 'bignumber.js';

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

    $: $signerAddress && form.input();
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
        const allowance = await contract.allowance($signerAddress, ca.MultiSend);
        
        return { balance, allowance, roseBalance }
    }

    const approve = async () => {
        const contract = new ethers.Contract(
                 token!.address,
                 GenericERC20.abi,
                 $unwrappedSigner!
            );
            
        const tx = await contract.approve(ca.MultiSend, total, { value: 0 });
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
        <TokenSelector bind:token bind:valid={tokenValid} bind:error={tokenError} disabled={!$connectedToSapphire} /> 
        <DestinationsTextArea bind:addresses bind:amounts bind:valid={destinationsValid} bind:error={parseError} disabled={!$connectedToSapphire}/>
        
        {#if $connectedToSapphire}
            {#if $form === 'awaitingApproval' || $form === 'approving' }
                <button on:click={form.approve} disabled={$form === 'approving'}>{$form === 'approving' ? 'Approving...' : 'Approve'}</button>
            {:else}
                <button class="btn-primary" on:click={form.send} disabled={$form !== 'valid'}>{$form === 'sending' ? 'Sending...' : 'Send'}</button>
            {/if}
        {:else}
            <WalletConnection fullWidth={true} />
        {/if}
    </form>

    <details class={$form}>
        <summary>
            state internals {#if error}(error: {error}){/if}
            {#if $form === 'complete'}(multisend complete){/if}
        </summary>
        <span>token valid: {tokenValid}</span>
        <span>destinations valid: {destinationsValid}</span>
        <span>form state: {$form}</span>
        <span>token: {token?.name || ''}</span>
        <span>balance: {ethers.formatUnits(balance, token?.decimals)}</span>
        <span>allowance: {ethers.formatUnits(allowance, token?.decimals)}</span>
        <span>total to send: {ethers.formatUnits(total, token?.decimals)}</span>
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
