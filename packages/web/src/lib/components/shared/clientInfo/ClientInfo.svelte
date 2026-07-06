<script lang="ts">
    import { getAppContext } from "$lib/stores/index.svelte";
    import { onMount } from "svelte";
    import OrderStatusCard from "./OrderStatusCard.svelte";

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
</script>

{#if app.user.orderId}
    <OrderStatusCard orderId={app.user.orderId} isReady={app.orders.orderIsReady} />
{:else}
    <div class="placeholder w-full h-40"></div>
{/if}
