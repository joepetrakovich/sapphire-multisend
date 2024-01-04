<script lang="ts">
    import { ethers } from 'ethers';
    import Papa from 'papaparse';
    import type { Token } from '$lib/Models';
    import TokenSelector from '$lib/TokenSelector.svelte';
    import { signerAddress } from '$lib/Stores';
    import GenericERC20 from "$lib/contracts/GenericERC20.json";
    import MultiSendArtifact from "$lib/contracts/MultiSend.json";
    import ca from "$lib/contracts/contract-addresses.json";
    import * as sapphire from '@oasisprotocol/sapphire-paratime';

    let token: Token;
    let balance: string;
    let text: string;
    let addressesAndAmounts: { address: string, amount: bigint }[] = [];
    let lineNum = 0;
    let remainingAllowance: string;
    let totalToSend: number;

    const getTokenBalance = async () => {
        if (token.isChainNativeCurrency) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const roseBalance = await provider.getBalance($signerAddress);
            balance = ethers.formatEther(roseBalance);
        } else {
            const contract = new ethers.Contract(
                 token.address!,
                 GenericERC20.abi,
            new ethers.BrowserProvider(window.ethereum));
   
            balance = ethers.formatUnits(await contract.balanceOf($signerAddress), token.decimals);
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

            remainingAllowance = ethers.formatUnits(await contract.allowance($signerAddress, ca.MultiSend), token.decimals);
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

Name: {token?.name || ''}
Symbol: {token?.symbol || ''}
Decimals: {token?.decimals || ''}
Balance: {balance || ''}

<div>
    <TokenSelector bind:token on:tokenselected={getTokenBalance} /> 
    <textarea bind:value={text} on:change={parse} rows="10" placeholder="Enter a comma-separated list of address, value pairs..."></textarea>
    <button on:click={approve}>Approve</button>
    <button on:click={send}>Send</button>
    <ul>
        {#each addressesAndAmounts as pair}
            <li>{pair.address}, {pair.amount.toString()}</li>
        {/each}
    </ul>
        Total {token?.symbol || ''} to send: {totalToSend || ''}
        Spend Allowance: {remainingAllowance || ''}
</div>

<style>
    div {
        display: flex;
        flex-direction: column;
        background-color: white;
    }
</style>
