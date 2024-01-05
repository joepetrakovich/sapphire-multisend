<script lang="ts">
    export let tx: Promise<any>;
    export let message: string = "Transaction pending...";
</script>

{#await tx}<span><small><i></i>{message}</small></span>{/await}

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
    i {
        height: 10px;
        width: 10px;
        border-radius: 14px;
        background-color: gray;
        animation: flash linear 1.25s infinite;
        display: inline-block;
        box-shadow: 0px 0px 4px 0px;
    }
</style>