<script lang="ts">
    import BranchInfo from "$lib/components/shared/branchInfo/BranchInfo.svelte";
    import OrdersTable from "$lib/components/shared/ordersTable/OrdersTable.svelte";
</script>

<div class="flex flex-col items-start gap-3 px-1 py-2">
    <BranchInfo />
    <OrdersTable />
</div>
