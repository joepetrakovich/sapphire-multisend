<script lang="ts">
    import "../app.css"
    import WalletConnection from "$lib/components/WalletConnection.svelte";
	import FeeView from "$lib/components/FeeView.svelte";
	import OwnerWithdraw from "$lib/components/OwnerWithdraw.svelte";
    import Icon from "$lib/images/taco-icon.svg";
    import GithubLogo from "$lib/images/github-logo.svg";
    import ConeIcon from "$lib/images/cone-icon.svg";
    const { MODE } = import.meta.env;
</script>
<nav>
   <div>
        <img src={Icon} alt="Taco logo">
        <span>Taco<i>sender</i></span>
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
            <a href="https://github.com/joepetrakovich/oasis-multisend" target="_blank">
                <img src={GithubLogo} alt="Github Logo">
            </a>
            {#if MODE === 'testnet' || MODE === 'hardhat'}
                <img src={ConeIcon} alt="Cone Icon" title="{MODE}">
            {/if}

            {#if MODE === 'testnet'}
                <a href="https://faucet.testnet.oasis.dev/" target="_blank">Testnet Faucet</a>
            {/if}
        </div>
    </div>
    <div>
        <OwnerWithdraw />
        <span>v{PKG.version}</span>
    </div>
</footer>

<style>
    nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 1em 0 2em 0;
    }
    nav div {
        display: flex;
        gap: 0.4em;
        align-items: center;
    }
    nav i {
        font-style: unset;
        margin: 0;
        background-color: #ec4740;
        border-radius: 6px;
        padding: 0 4px;
        margin-left: 2px;
        color: white;
        display: inline-block;
        line-height: 1.24em;
    }
    nav span {
        display: none;
        font-family: var(--font-title);
    }
    @media (min-width: 342px) {
        nav div span {
            display: inline-block;
        }
    }
    main {
        margin-bottom: 3em;
    }
    footer {
        display: flex;
        flex-direction: column;
        gap: 0.8em;
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
        gap: 0.4em;
        align-items: center;
    }
    footer a:link, footer a:visited {
        color: gray;
    }
    footer a:focus {
        outline: none;
    }
    footer span {
        font-size: 1em;
        opacity:0.4;
        padding:0;
        margin:0;
    }
    footer img {
        vertical-align: sub;
    }
</style>