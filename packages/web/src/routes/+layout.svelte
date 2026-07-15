<script lang="ts">
    import "../app.css";
    import favicon from "$lib/assets/favicon.svg";
    import { page } from "$app/state";
    import MenuBar from "$lib/components/shared/menuBar/MenuBar.svelte";
    import { initAppContext } from "$lib/stores/index.svelte";
    import { initOrderReadyStore } from "$lib/stores/orderReadyVibration.svelte";
    import { initNotifications } from "$lib/stores/orderReadyNotification.svelte";

    let { children } = $props();

    const app = initAppContext();
    initOrderReadyStore(app.orders, app.user, initNotifications());

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
