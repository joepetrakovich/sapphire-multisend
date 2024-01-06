<script lang="ts">
    import "../app.css"
    import WalletConnection from "$lib/components/WalletConnection.svelte";
	import FeeView from "$lib/components/FeeView.svelte";
	import OwnerWithdraw from "$lib/components/OwnerWithdraw.svelte";
</script>
<nav>
   <div>
        <svg
            width="16.597019"
            height="16.597092"
            fill="#00008b"
            class="bi bi-x-diamond-fill"
            viewBox="0 0 16.597019 16.597092"
            version="1.1"
            id="svg1"
            xmlns="http://www.w3.org/2000/svg">
        <defs
            id="defs1" />
        <path
            d="m 9.3480098,0.73308157 c -0.58,-0.58 -1.52,-0.58 -2.1,0 l -2.903,2.90400003 3.953,3.954 3.9540002,-3.954 -2.9050002,-2.90400003 z m 3.6100002,3.61100003 -3.9520002,3.954 3.9540002,3.9540004 2.904,-2.9050004 c 0.58,-0.58 0.58,-1.519 0,-2.098 l -2.904,-2.905 z m -0.706,8.6140004 -3.9540002,-3.9520004 -3.954,3.9540004 2.905,2.904 c 0.58,0.58 1.519,0.58 2.098,0 l 2.9050002,-2.904 z m -8.6140002,-0.706 3.952,-3.9540004 -3.953,-3.954 -2.90400005,2.905 c -0.58,0.58 -0.58,1.519 0,2.098 z"
            id="path2"
            style="fill:#467dcd;fill-opacity:1;stroke:none;stroke-width:0.60000002;stroke-dasharray:none;stroke-opacity:1" />
        </svg>
        Sapphire Multisend
    </div>
   <WalletConnection showAddress={true} />
</nav>

<main>
    <slot></slot>
</main>

<footer>
    <div>
        <FeeView />
        <div>
            <a href="https://github.com/joepetrakovich/oasis-multisend" target="_blank">Github</a>
            <a href="https://faucet.testnet.oasis.dev/" target="_blank">Testnet Faucet</a>
        </div>
    </div>
    <OwnerWithdraw />
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
        margin-bottom: 2em;
    }
    footer {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    footer > div {
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: space-between;
        font-size: 0.88em;
        color: gray;
    }
    footer > div > div {
        display: flex;
        gap: 8px;
        align-items: center;
    }
    footer a:link, footer a:visited {
        color: gray;
    }
</style>