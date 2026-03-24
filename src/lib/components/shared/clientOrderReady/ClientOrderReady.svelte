<script lang="ts">
    import { getAppContext } from "$lib/stores";
    const app = getAppContext();

    const ordersProgress = $derived(app.orders.ordersProgress);
    const readyOrders = $derived(ordersProgress.ready ?? []);
    const isReady = $derived(readyOrders.some((order) => order.isCurrent));
</script>

{#if isReady}
    <div
        class="card preset-filled-surface-100-900 border border-surface-200-800 w-full divide-surface-200-800 p-3"
    >
        <div class="flex flex-col gap-1 items-center">
            <h6 class="h6">
                Your order is ready
            </h6>
            <p class="text-xs">Please pick up your order at the pick-up location</p>
        </div>
    </div>
{/if}
