<script lang="ts">
    import DestinationsTextArea from '$lib/components/DestinationsTextArea.svelte';
    import TokenSelector from '$lib/components/TokenSelector.svelte';
    import { ethers } from 'ethers';
    import { type Token } from '$lib/Models';
    import { connectedToSapphire, signerAddress } from '$lib/Stores';
    import GenericERC20 from "$lib/contracts/GenericERC20.json";
    import MultiSendArtifact from "$lib/contracts/MultiSend.json";
    import ca from "$lib/contracts/contract-addresses.json";
    import * as sapphire from '@oasisprotocol/sapphire-paratime';
	import WalletConnection from '$lib/components/WalletConnection.svelte';
    import fsm from 'svelte-fsm'

    let token: Token | undefined;
    let balance: bigint;
    let allowance: bigint;
    let addresses: string[];
    let amounts: number[];
    let total: bigint;
    let tokenValid: boolean, destinationsValid: boolean;
    let error: string | undefined;

    //TODO! changes to $signerAddress also need to invalidate
    //TODO: what about disconnects?
    
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
                const totalAsNumberString = amounts.reduce((partialSum, a) => partialSum + a, 0).toString();
                total = ethers.parseUnits(totalAsNumberString, token!.decimals);
   
                getTokenBalanceAndAllowance()
                    .then(ba => {
                    balance = ba.balance;
                    allowance = ba.allowance;
                    if (balance < total) {
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
            success() { return 'valid' },
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
            input: 'entering'
        }
    });

    $: $signerAddress && form.input();
    $: tokenValid && destinationsValid ? form.validate() : form.input();

    async function getTokenBalanceAndAllowance() {
        const contract = new ethers.Contract(
                 token!.address,
                 GenericERC20.abi,
            new ethers.BrowserProvider(window.ethereum));

        const balance = await contract.balanceOf($signerAddress);
        const allowance = await contract.allowance($signerAddress, ca.MultiSend);
        return { balance, allowance }
    }

    const approve = async () => {
        //this instance can be cached. does it need to be sapphire wrapped?
        //let wrapped = sapphire.wrap(window.ethereum);
        const signer = await new ethers.BrowserProvider(window.ethereum)
          .getSigner();

        const contract = new ethers.Contract(
                 token!.address,
                 GenericERC20.abi,
                 signer
            );
            
            const tx = await contract.approve(ca.MultiSend, total, { value: 0 });
            const l = await tx.wait();
            console.log(l);

            //todo: let fsm call?
            //todo: wait spinners, fsm can wait.
   
            // ?.placeBet(index, Horse[selectedHorse], { gasLimit: 10_000_000, value: betAmountInWei })
            // .then(receipt => {tx = waitForConfirmation(receipt); (event.target as HTMLFormElement).reset();})
            // .catch(console.log)
            // .finally(() => submitting = false)
    }
    
    const send = async () => {
        //this instance can be cached. does it need to be sapphire wrapped?
        let wrapped = sapphire.wrap(window.ethereum);
        const signer = await new ethers.BrowserProvider(wrapped).getSigner();
        const multiSendContract = new ethers.Contract(
                 ca.MultiSend,
                 MultiSendArtifact.abi,
                 signer
            );

        const amountsBigInt = amounts.map(amount => ethers.parseUnits(amount.toString(), token!.decimals));

        const tx = await multiSendContract.multiSendToken(token!.address, addresses, amountsBigInt);
        const l = await tx.wait();
        console.log(l);
        
        //let fsm call? etc etc
        //fsm can wait etc.
            
            // ?.placeBet(index, Horse[selectedHorse], { gasLimit: 10_000_000, value: betAmountInWei })
            // .then(receipt => {tx = waitForConfirmation(receipt); (event.target as HTMLFormElement).reset();})
            // .catch(console.log)
            // .finally(() => submitting = false)
    }
</script>

<div>
    <form>
        <TokenSelector bind:token bind:valid={tokenValid} disabled={!$connectedToSapphire} /> 
        <DestinationsTextArea bind:addresses bind:amounts bind:valid={destinationsValid} disabled={!$connectedToSapphire}/>
        
        {#if $connectedToSapphire}
            {#if $form === 'awaitingApproval' || $form === 'approving' }
                <button on:click={form.approve} disabled={$form === 'approving'}>{$form === 'approving' ? 'Approving...' : 'Approve'}</button>
            {:else}
                <button on:click={form.send} disabled={$form !== 'valid'}>{$form === 'sending' ? 'Sending...' : 'Send'}</button>
            {/if}
        {:else}
            <WalletConnection />
        {/if}
    </form>

    <details>
        <summary>state internals</summary>
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
    button {
        width: 100%;
    }
    details {
        font-style: italic;
        color: gray;
    }
</style>
