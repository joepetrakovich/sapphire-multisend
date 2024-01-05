<script lang="ts">
    import DestinationsTextArea from '$lib/components/DestinationsTextArea.svelte';
    import TokenSelector from '$lib/components/TokenSelector.svelte';
    import { ethers } from 'ethers';
    import Papa from 'papaparse';
    import { OasisNetworkStatus, type Token } from '$lib/Models';
    import { connectedToSapphire, oasisNetworkStatus, signerAddress } from '$lib/Stores';
    import GenericERC20 from "$lib/contracts/GenericERC20.json";
    import MultiSendArtifact from "$lib/contracts/MultiSend.json";
    import ca from "$lib/contracts/contract-addresses.json";
    import * as sapphire from '@oasisprotocol/sapphire-paratime';
	import WalletConnection from '$lib/components/WalletConnection.svelte';
    import fsm from 'svelte-fsm'
    import OasisLogo from '$lib/images/oasis-logo-120px.png';
    
    let balance: bigint;
    let addresses: string[];
    let amounts: number[];
    let total: bigint;
    let destinationsValid: boolean;
    let error: string | undefined;

    //TODO! changes to $signerAddress also need to invalidate
    //TODO: what about disconnects?
    
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
                    if (balance >= total) {
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
        valid: {},
        '*': {
            input: 'entering'
        }
    });

    $: $signerAddress && form.input();
    $: destinationsValid ? form.validate() : form.input();

    async function getRoseBalance() {
        const provider = new ethers.BrowserProvider(window.ethereum);
        return await provider.getBalance($signerAddress);
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
        <DestinationsTextArea bind:addresses bind:amounts bind:valid={destinationsValid} disabled={!$connectedToSapphire}/>
        
        {#if $connectedToSapphire}
            <button disabled={$form !== 'valid'}>Send</button> 
        {:else}
            <WalletConnection />
        {/if}
    </form>

    <span>destinations valid: {destinationsValid}</span>
    <span>form state: {$form}</span>
    <span>balance: {ethers.formatEther(balance)}</span>
    <span>total to send: {ethers.formatEther(balance)}</span>
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
