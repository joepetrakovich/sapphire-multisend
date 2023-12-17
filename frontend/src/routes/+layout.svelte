<script lang="ts">
    import WalletConnection from "$lib/WalletConnection.svelte";
import "../app.css"
</script>
<nav>
   <div>Oasis Multisend</div>
   <WalletConnection />
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
    main {
        max-width: 500px;
        margin: 0 auto;
    }
    footer {
        display: flex;
        align-items: center;
        justify-content: end;
    }
</style>