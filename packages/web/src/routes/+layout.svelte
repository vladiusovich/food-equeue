<script lang="ts">
    import "../app.css";
    import favicon from "$lib/assets/favicon.svg";
    import { page } from "$app/state";
    import MenuBar from "$lib/components/shared/menuBar/MenuBar.svelte";
    import { getAppContext, initAppContext } from "$lib/stores/index.svelte";
    import { createOrderReadyVibration, setOrderReadyVibration } from "$lib/stores/orderReadyVibration.svelte";

    let { children } = $props();

    initAppContext();

    const app = getAppContext();

    setOrderReadyVibration(createOrderReadyVibration(app.orders, app.user));

    let hasFetchedUser = false;

    $effect(() => {
        if (app.user.auth.isLoggedIn && !hasFetchedUser) {
            hasFetchedUser = true;
            app.user.fetch();
        }
    });
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<div id="app">
    <div id="app-content">
        {@render children()}
    </div>

    {#if app.user.auth.isLoggedIn && page.status === 200}
        <MenuBar />
    {/if}
</div>
