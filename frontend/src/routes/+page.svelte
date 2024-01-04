<script lang="ts">
    import TokenSelector from '$lib/TokenSelector.svelte';
    import { ethers } from 'ethers';
    import Papa from 'papaparse';
    import { OasisNetworkStatus, type Token } from '$lib/Models';
    import { oasisNetworkStatus, signerAddress } from '$lib/Stores';
    import GenericERC20 from "$lib/contracts/GenericERC20.json";
    import MultiSendArtifact from "$lib/contracts/MultiSend.json";
    import ca from "$lib/contracts/contract-addresses.json";
    import * as sapphire from '@oasisprotocol/sapphire-paratime';
	import WalletConnection from '$lib/WalletConnection.svelte';
    import fsm from 'svelte-fsm'
    import OasisLogo from '$lib/images/oasis-logo-120px.png';
    
    const dapp = fsm('disconnected', {
        disconnected: {
            connect: 'connected'
        },
        connected: {
            disconnect: 'disconnected'
        }
    });

    const form = fsm('entering', {
        entering: {},
        valid: {},
        invalid: {}
    });

    enum SendType { ERC20Token, Rose }
    let group: SendType = SendType.ERC20Token;

    let token: Token;
    let balance: bigint;
    let allowance: bigint;

    $: $oasisNetworkStatus !== OasisNetworkStatus.ON_SAPPHIRE_PARATIME ? dapp.disconnect() : dapp.connect();

    $: balanceDisplay = token && balance ? ethers.formatUnits(balance, token.decimals) : '';
    $: allowanceDisplay = token && allowance ? ethers.formatUnits(allowance, token.decimals) : '';

    let text: string;
    let addressesAndAmounts: { address: string, amount: bigint }[] = [];
    let lineNum = 0;

    let totalToSend: number;

    $: needsApproval = !token?.isChainNativeCurrency && allowance < totalToSend

    const getTokenBalanceAndAllowance = async () => {
        if (token.isChainNativeCurrency) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            balance = await provider.getBalance($signerAddress);
        } else {
            const contract = new ethers.Contract(
                 token.address!,
                 GenericERC20.abi,
            new ethers.BrowserProvider(window.ethereum));

            balance = await contract.balanceOf($signerAddress);
            allowance = await contract.allowance($signerAddress, ca.MultiSend);
        }
    }

    const step = (results: any, parser: any) => {
        lineNum += 1;
        if (results.errors.length) {
            alert('error parsing addresses and amounts.');
            console.log(results.errors);
            parser.abort();
            return;
        }

        if (results.data.length != 2) {
            alert(`line ${lineNum} not formatted properly.`);
            parser.abort();
            return;
        }

        if (!ethers.isAddress(results.data[0])) { //do I need to verify its a saph addr?
            alert(`line ${lineNum} not an address.`);
            parser.abort();
            return;
        }
        const address = results.data[0];

        const amountFloat = parseFloat(results.data[1]);
        if (Number.isNaN(amountFloat) || amountFloat <= 0) {
            alert(`line ${lineNum} amount must be a number greater than 0.`);
            parser.abort();
            return;
        }
        totalToSend += amountFloat;
        const amount: bigint = ethers.parseUnits(results.data[1], token.decimals);

        addressesAndAmounts = [...addressesAndAmounts, { address, amount }];
    }
    const complete = () => {
        alert(`processed ${lineNum} lines`);
        validateSend();
    }
    const parse = async () => {
        lineNum = 0; //would this lose error'd line num?
        totalToSend = 0;
        addressesAndAmounts = [];

        Papa.parse(text, { delimiter: ',', step, complete });
        //may need transform, step, error, complete
    };

    async function validateSend() {
        //check sufficient balance 
        //check allowance for erc20s
        
        if (token.isChainNativeCurrency) {
            // no allowance, just need enough balance.
            // const provider = new ethers.BrowserProvider(window.ethereum);
            // const roseBalance = await provider.getBalance($signerAddress);
            // balance = ethers.formatEther(roseBalance);
        } else {
            const contract = new ethers.Contract(
                 token.address!,
                 GenericERC20.abi,
            new ethers.BrowserProvider(window.ethereum));

            let allowance:bigint = await contract.allowance($signerAddress, ca.MultiSend);
            allowanceDisplay = ethers.formatUnits(allowance, token.decimals);
        }
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

        const addresses = addressesAndAmounts.map(aa => aa.address);
        const amounts = addressesAndAmounts.map(aa => aa.amount);
        const totalSendAmount: BigInt = ethers.parseEther(totalToSend.toString()); 

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
        <div>
            What are you sending?
            <label><input type="radio" value={SendType.ERC20Token} bind:group disabled={$dapp !== 'connected'} />Token</label>
            <label><input type="radio" value={SendType.Rose} bind:group disabled={$dapp !== 'connected'} /><img src={OasisLogo} alt="Oasis Logo" width="16" />Rose</label>
        </div>
        
        {#if group === SendType.ERC20Token}
            <TokenSelector disabled={$dapp !== 'connected'} /> 
        {/if}

       <textarea rows="10" disabled={$dapp !== 'connected'} placeholder="Enter comma-delimeted addresses and amounts..." />

        {#if $dapp === 'connected'}
            <button disabled={$form !== 'valid'}>Send</button>
        {:else}
            <WalletConnection />
        {/if}
    </form>

    <span>dapp state: {$dapp}</span>
    <span>form state: {$form}</span>
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
    form > div, label {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.2em;
    }
    label {
        line-height: 0;
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
