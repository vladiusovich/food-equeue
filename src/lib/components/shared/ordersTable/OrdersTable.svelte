<script lang="ts">
    import OrdersColumn from "./OrdersColumn.svelte";
    import OrderItem from "./OrderItem.svelte";
    import { getAppContext } from "$lib/stores";

    const app = getAppContext();

    $effect(() => {
        app.orders.fetch();
    });

    let ordersProgress = $derived(app.orders.ordersProgress);
</script>

<div class="card preset-filled-surface-100-900 border border-surface-200-800 w-full divide-surface-200-800 p-2">
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
</div>
