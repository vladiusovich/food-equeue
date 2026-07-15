<script lang="ts">
    import BranchInfo from "$lib/components/shared/branchInfo/BranchInfo.svelte";
    import ClientInfo from "$lib/components/shared/clientInfo/ClientInfo.svelte";
    import EnableNotifications from "$lib/components/shared/enableNotifications/EnableNotifications.svelte";
    import OrderReadyButton from "$lib/components/shared/orderReadyButton/OrderReadyButton.svelte";
    import QueueInfo from "$lib/components/shared/queueInfo/QueueInfo.svelte";
</script>

<div class="flex flex-col items-start gap-3 px-1 py-2">
    <BranchInfo />
    <ClientInfo />
    <QueueInfo />

    <EnableNotifications />
    <OrderReadyButton />
</div>
