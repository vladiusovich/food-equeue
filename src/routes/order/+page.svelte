<script lang="ts">
    import BranchInfo from "$lib/components/shared/branchInfo/BranchInfo.svelte";
    import ClientInfo from "$lib/components/shared/clientInfo/ClientInfo.svelte";
    import ExecutionTimeInfo from "$lib/components/shared/executionTimeInfo/ExecutionTimeInfo.svelte";
    import QueueInfo from "$lib/components/shared/queueInfo/QueueInfo.svelte";
</script>

<div class="flex flex-col items-start gap-2">
    <BranchInfo />
    <ClientInfo />
	<ExecutionTimeInfo />
    <QueueInfo />
</div>
