<script lang="ts">
	import { TACOSENDER_CONTRACT_ADDRESS } from "$lib/Network";
	import { unwrappedMultiSend, provider, signerAddress } from "$lib/Stores";
	import { ethers } from "ethers";

    let owner: string;
    let balance: bigint;

    $: $unwrappedMultiSend?.owner().then(o => owner = o);
    $: $provider?.getBalance(TACOSENDER_CONTRACT_ADDRESS).then(b => balance = b);
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
                       ?.getBalance(TACOSENDER_CONTRACT_ADDRESS)
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