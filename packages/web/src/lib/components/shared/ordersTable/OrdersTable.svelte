<script lang="ts">
    import UI from "$lib/components/ui";
    import OrdersColumn from "./OrdersColumn.svelte";
    import OrderItem from "./OrderItem.svelte";
    import { getAppContext } from "$lib/stores/index.svelte";
    import { onMount } from "svelte";

    const app = getAppContext();

    onMount(() => {
        app.orders.fetch();
    });

    let ordersProgress = $derived(app.orders.ordersProgress);
    let myOrder = $derived(
        [...(ordersProgress?.inProgress ?? []), ...(ordersProgress?.ready ?? [])].find(order => order.isCurrent),
    );
</script>

{#if app.orders.ordersStatus}
    <UI.Card class="relative">
        <UI.AuroraBackground accent={app.orders.orderIsReady ? "success" : "neutral"} />
        {#if ordersProgress.inProgress.length === 0 && ordersProgress.ready.length === 0}
            <p class="py-2 text-center text-sm font-medium text-surface-200">There are no active orders right now</p>
        {:else}
            <div class="flex gap-3.5">
                <OrdersColumn title="In progress" accent="primary" count={ordersProgress.inProgress.length}>
                    {#each ordersProgress.inProgress as order (order.id)}
                        <OrderItem value={order.id} accent={order.isCurrent ? "primary" : "neutral"} />
                    {/each}
                </OrdersColumn>

                <OrdersColumn title="Done" accent="success" count={ordersProgress.ready.length}>
                    {#each ordersProgress.ready as order (order.id)}
                        <OrderItem value={order.id} accent={order.isCurrent ? "success" : "neutral"} />
                    {/each}
                </OrdersColumn>
            </div>

            {#if myOrder}
                <div class="mt-2 flex gap-2 px-0.5">
                    <span class="text-[10px] font-semibold text-surface-400">Your order</span>
                    <span class="text-[10px] font-bold text-primary-500">#{myOrder.id} is highlighted</span>
                </div>
            {/if}
        {/if}
    </UI.Card>
{:else}
    <div class="placeholder rounded-[18px] animate-pulse h-45 w-full"></div>
{/if}
