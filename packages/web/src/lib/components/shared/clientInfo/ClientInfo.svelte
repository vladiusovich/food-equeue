<script lang="ts">
    import { getAppContext } from "$lib/stores/index.svelte";
    import { getOrderReadyVibration } from "$lib/stores/orderReadyVibration.svelte";
    import OrderStatusCard from "./OrderStatusCard.svelte";

    const app = getAppContext();
    const vibration = getOrderReadyVibration();
</script>

{#if app.user.orderId}
    <OrderStatusCard orderId={app.user.orderId} isReady={app.orders.orderIsReady} />

    {#if !vibration.isMute && app.orders.orderIsReady}
        <button
            type="button"
            class="w-full rounded-full border border-surface-700/40 bg-surface-800 px-4 py-2 text-xs font-bold text-surface-200 active:opacity-80"
            onclick={vibration.mute}
        >
            Mute vibration
        </button>
    {/if}
{:else}
    <div class="placeholder w-full h-40"></div>
{/if}
