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
                //approve async func
            },
            success() { return 'valid' },
            error(e) {
                error = e;
                return 'invalid';
            }
        },
        invalid: {},
        valid: {},
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
                 token.address!,
                 GenericERC20.abi,
                 signer
            );
            
            const amount: bigint = ethers.parseUnits(totalToSend.toString(), token.decimals);
            alert(`going to approve ${amount}`);
   
            //gas estimate? g
            const tx = await contract.approve(ca.MultiSend, amount, { value: 0 });
            const l = await tx.wait();
            console.log(l);

   
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

        //const addresses = addressesAndAmounts.map(aa => aa.address);
        //const amounts = addressesAndAmounts.map(aa => aa.amount);
        const totalSendAmount: BigInt = ethers.parseEther(total.toString()); 

        if (token.isChainNativeCurrency) {
            //estimate gas?
            const tx = await multiSendContract.multiSendRose(addresses, amounts, { value: totalSendAmount });
            const l = await tx.wait();
            console.log(l);
        } else {           
            //estimate gas?
            const tx = await multiSendContract.multiSendToken(token.address, addresses, amounts);
            const l = await tx.wait();
            console.log(l);
        }

            
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
            {#if $form === 'awaitingApproval'}
                <button>Approve</button>
            {:else}
                <button disabled={$form !== 'valid'}>Send</button>
            {/if}
        {:else}
            <WalletConnection />
        {/if}
    </form>

    <span>token valid: {tokenValid}</span>
    <span>destinations valid: {destinationsValid}</span>
    <span>form state: {$form}</span>
    <span>token: {token?.name || ''}</span>
    <span>balance: {ethers.formatUnits(balance, token?.decimals)}</span>
    <span>allowance: {ethers.formatUnits(allowance, token?.decimals)}</span>
    <span>total to send: {ethers.formatUnits(total, token?.decimals)}</span>
    <span>error: {error}</span>

</div>

<style>
    div, form {
        display: flex;
        flex-direction: column;
        gap: 0.2em;
    }
    form :global(button) {
        width: 100%;
    }
</style>

<!-- 
Name: {token?.name || ''}
Symbol: {token?.symbol || ''}
Decimals: {token?.decimals || ''}
Balance: {balanceDisplay}

<div>
    <TokenSelector bind:token on:tokenselected={getTokenBalanceAndAllowance} /> 
    <textarea bind:value={text} on:change={parse} rows="10" placeholder="Enter a comma-separated list of address, value pairs..."></textarea>
   
    {#if $oasisNetworkStatus !== OasisNetworkStatus.ON_SAPPHIRE_PARATIME}
        <WalletConnection />
    {:else}
        {#if needsApproval}
            <button on:click={approve}>Approve</button>
        {:else}
            <button on:click={send}>Send</button>       
        {/if}
    {/if}

    <ul>
        {#each addressesAndAmounts as pair}
            <li>{pair.address}, {pair.amount.toString()}</li>
        {/each}
    </ul>

    Total {token?.symbol || ''} to send: {totalToSend || ''}

    {#if token && !token.isChainNativeCurrency}
        Spend Allowance: {allowanceDisplay}
    {/if}
</div>

<style>
    div {
        display: flex;
        flex-direction: column;
        background-color: white;
    }
    div :global(button) {
        width: 100%;
    }
</style> -->
