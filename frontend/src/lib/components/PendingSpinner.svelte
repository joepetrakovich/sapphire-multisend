<script lang="ts">
	import Flasher from "./Flasher.svelte";

    export let tx: Promise<any>;
    export let message: string = "Transaction pending...";
</script>

{#await tx}<span><small><Flasher />{message}</small></span>{/await}

<style>
    span {
        border: 2px solid gray;
        border-radius: 4px;
        padding: 0.26em;
    }
    small {
        color: gray;
        font-style: italic;
        display: flex;
        gap: var(--space-2);
        align-items: center;
    }
</style>