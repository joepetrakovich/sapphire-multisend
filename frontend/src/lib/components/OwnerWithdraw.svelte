<script lang="ts">
	import { multiSendContractUnsigned, multiSendContract, provider, signerAddress } from "$lib/Stores";
	import { ethers } from "ethers";
    import contractAddress from "$lib/contracts/contract-addresses.json";

    let owner: string;
    let balance: bigint;

    $: $multiSendContractUnsigned?.owner().then(o => owner = o);
    $: $provider?.getBalance(contractAddress.MultiSend).then(b => balance = b);
    $: isOwner = owner && $signerAddress && owner.toLowerCase() === $signerAddress.toLowerCase();

    let withdrawing: boolean;
    const withdraw = async () => {
        if ($multiSendContract) {
            withdrawing = true;
            $multiSendContract
            .withdraw()
            .then(receipt => {
                return receipt.wait()
                .then(() => {
                    $provider?.getBalance(contractAddress.MultiSend)
                              .then(b => balance = b);
                })
            })
            .catch(console.log)
            .finally(() => { withdrawing = false; })
        }
    }
</script>

<span>
    {#if isOwner} 
        <button disabled={withdrawing} on:click={withdraw}>{withdrawing ? 'Withdrawing...' : `Withdraw ${balance && ethers.formatEther(balance)}`}</button>
    {/if}
</span>