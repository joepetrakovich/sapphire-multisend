<script lang="ts">
	import CircleCheckmark from "./CircleCheckmark.svelte";
    import { createEventDispatcher } from "svelte";

    export let name: string;
    export let symbol: string;

    const dispatch = createEventDispatcher();
</script>

<div title={name}>
    <CircleCheckmark />
    {symbol}
    <button on:click|preventDefault={() => dispatch('clear')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="gray" class="bi bi-x-lg" viewBox="0 0 16 16">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
        </svg>
    </button>
</div>

<style>
    div {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        gap: 0.4em;
        max-width: fit-content;
        line-height: 0;
        padding: 0.14em;
        font-family: monospace;
        font-weight: bold;
        border-radius: 4px;
        color: var(--dark-spring-green);
        border: 2px solid var(--celadon);
        background-color: var(--celadon-light);
    }
    button {
        background: none;
        color: inherit;
        border: none;
        padding: 0;
        font: inherit;
        cursor: pointer;
        outline: inherit;
    }
</style>