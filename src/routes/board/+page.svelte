<script lang="ts">
    import ClientInfo from "$lib/components/shared/clientInfo/ClientInfo.svelte";
    import OrdersTable from "$lib/components/shared/ordersTable/OrdersTable.svelte";
</script>

<div class="flex flex-col items-start gap-2">
    <ClientInfo />
    <OrdersTable />
</div>
