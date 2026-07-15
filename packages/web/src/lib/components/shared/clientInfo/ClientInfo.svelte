<script lang="ts">
    import { getAppContext } from "$lib/stores/index.svelte";
    import OrderStatusCard from "./OrderStatusCard.svelte";

    const app = getAppContext();

</script>

{#if app.user.orderId}
    <OrderStatusCard orderId={app.user.orderId} isReady={app.orders.orderIsReady} />
{:else}
    <div class="placeholder w-full h-40"></div>
{/if}
