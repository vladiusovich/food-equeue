<script lang="ts">
    import UI from "$lib/components/ui";
    import OrdersColumn from "./OrdersColumn.svelte";
    import OrderItem from "./OrderItem.svelte";
    import { getAppContext } from "$lib/stores";

    const app = getAppContext();

    $effect(() => {
        app.orders.fetch();
    });

    let ordersProgress = $derived(app.orders.ordersProgress);
</script>

{#if app.orders.ordersStatus}
    <UI.Card>
        <div class="grid grid-cols-2 gap-2">
            <OrdersColumn title="In progress">
                {#each ordersProgress.inProgress as order (order.id)}
                    <OrderItem value={order.id} isCurrent={order.isCurrent} />
                {/each}
            </OrdersColumn>

            <OrdersColumn title="Done">
                {#each ordersProgress.ready as order (order.id)}
                    <OrderItem value={order.id} isCurrent={order.isCurrent} />
                {/each}
            </OrdersColumn>
        </div>
    </UI.Card>
{:else}
    <div class="placeholder rounded-xl animate-pulse h-45 w-full"></div>
{/if}
