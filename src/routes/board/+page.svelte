<script lang="ts">
    import BranchInfo from "$lib/components/shared/branchInfo/BranchInfo.svelte";
    import ClientInfo from "$lib/components/shared/clientInfo/ClientInfo.svelte";
    import ClientOrderReady from "$lib/components/shared/clientOrderReady/ClientOrderReady.svelte";
    import OrdersTable from "$lib/components/shared/ordersTable/OrdersTable.svelte";
</script>

<div class="flex flex-col items-start gap-2">
    <BranchInfo />
    <ClientInfo />
    <ClientOrderReady />
    <OrdersTable />
</div>
