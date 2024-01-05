<script lang="ts">
    import WalletConnection from "$lib/components/WalletConnection.svelte";
import "../app.css"
</script>
<nav>
   <div>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="darkblue" class="bi bi-x-diamond-fill" viewBox="0 0 16 16">
            <path d="M9.05.435c-.58-.58-1.52-.58-2.1 0L4.047 3.339 8 7.293l3.954-3.954L9.049.435zm3.61 3.611L8.708 8l3.954 3.954 2.904-2.905c.58-.58.58-1.519 0-2.098l-2.904-2.905zm-.706 8.614L8 8.708l-3.954 3.954 2.905 2.904c.58.58 1.519.58 2.098 0l2.905-2.904zm-8.614-.706L7.292 8 3.339 4.046.435 6.951c-.58.58-.58 1.519 0 2.098z"/>
        </svg>
        Sapphire Multisend
    </div>
   <WalletConnection showAddress={true} />
</nav>

<main>
    <slot></slot>
</main>

<footer>
    <a href="https://github.com/joepetrakovich/oasis-multisend" target="_blank">Github</a>
    <a href="https://faucet.testnet.oasis.dev/" target="_blank">Testnet Faucet</a>
    <span>Fee: 0</span>
</footer>

<style>
    nav {
        display: flex;
        justify-content: space-between;
        margin: 1em 0 2em 0;
    }
    nav div {
        display: flex;
        gap: 0.4em;
        align-items: center;
    }
    main {
        margin-bottom: 1em;
    }
    footer {
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: end;
        font-size: 0.88em;
        color: gray;
    }
    footer span {
        font-size: 1em;
    }
    footer a:link, footer a:visited {
        color: gray;
    }
</style>