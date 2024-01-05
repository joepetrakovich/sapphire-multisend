<script lang="ts">
    import WalletConnection from "$lib/components/WalletConnection.svelte";
import "../app.css"
</script>
<nav>
   <div>Oasis Multisend</div>
   <WalletConnection showAddress={true} />
</nav>

<main>
    <slot></slot>
</main>

<footer>
    <a href="https://github.com/joepetrakovich/rose-derby">Github</a>
    <a href="https://faucet.testnet.oasis.dev/">Testnet Faucet</a>
</footer>

<style>
    nav {
        display: flex;
        justify-content: space-between;
    }
    footer {
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: end;
    }
</style>