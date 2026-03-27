<script>
    import ExecutionTimeInfo from "$lib/components/shared/executionTimeInfo/ExecutionTimeInfo.svelte";
    import OrdersTable from "$lib/components/shared/ordersTable/OrdersTable.svelte";
    import QueueInfo from "$lib/components/shared/queueInfo/QueueInfo.svelte";
</script>

<div class="flex flex-col items-start gap-2">
    <h2 class="h2">Welcome to our service</h2>
    <p class="text-xs">You should to scan QR-code of your order and only after that you will see the order online</p>

    <ExecutionTimeInfo />
    <QueueInfo />
    <OrdersTable />
</div>
