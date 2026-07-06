<script lang="ts">
    import { getAppContext } from "$lib/stores/index.svelte";
    import { onMount } from "svelte";
    import OrderReadyBanner from "./OrderReadyBanner.svelte";
    import CookingProgressCard from "./CookingProgressCard.svelte";

    const app = getAppContext();

    onMount(() => {
        app.user.fetch();
    });

    let wasReady = $state(false);

    $effect(() => {
        if (app.orders.orderIsReady && !wasReady) {
            navigator.vibrate?.([80, 40, 80]);
        }

        wasReady = app.orders.orderIsReady;
    });

    const steps = $derived([
        { label: "Accepted", active: true, current: false },
        { label: "Cooking", active: true, current: !app.orders.orderIsReady },
        { label: "Done", active: app.orders.orderIsReady, current: false },
    ]);
</script>

{#if app.user.orderId}
    {#if app.orders.orderIsReady}
        <OrderReadyBanner orderId={app.user.orderId} />
    {:else}
        <CookingProgressCard orderId={app.user.orderId} {steps} />
    {/if}
{:else}
    <div class="placeholder w-full h-40"></div>
{/if}
