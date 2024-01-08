<script lang="ts">
	import { unwrappedMultiSend, provider, signerAddress } from "$lib/Stores";
	import { ethers } from "ethers";
    import contractAddress from "$lib/contracts/contract-addresses.json";

    let owner: string;
    let balance: bigint;

    $: $unwrappedMultiSend?.owner().then(o => owner = o);
    $: $provider?.getBalance(contractAddress.MultiSend).then(b => balance = b);
    $: isOwner = owner && $signerAddress && owner.toLowerCase() === $signerAddress.toLowerCase();

    let withdrawing: boolean;
    const withdraw = async () => {
        if ($unwrappedMultiSend) {
            withdrawing = true;
            $unwrappedMultiSend
            .withdraw()
            .then(receipt => {
                return receipt.wait()
                .then(() => {
                    $provider
                       ?.getBalance(contractAddress.MultiSend)
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