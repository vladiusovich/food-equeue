<script lang="ts">
    import "../app.css";
    import favicon from "$lib/assets/favicon.svg";
    import { getAppContext, initAppContext } from "$lib/stores";
    import { page } from "$app/state";
    import MenuBar from "$lib/components/shared/menuBar/MenuBar.svelte";

    let { children } = $props();

    initAppContext();

    const app = getAppContext();
    let isLoggedIn = $derived(app.user.auth.isLoggedIn);
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<div id="app">
    {@render children()}
</div>

{#if isLoggedIn && page.status === 200}
    <MenuBar />
{/if}
