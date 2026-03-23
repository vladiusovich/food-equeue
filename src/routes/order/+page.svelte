<script lang="ts">
    import BranchInfo from "./branchInfo/BranchInfo.svelte";
    import ClientInfo from "./clientInfo/ClientInfo.svelte";
    import ClientOrderReady from "./clientOrderReady/ClientOrderReady.svelte";
    import QueueInfo from "./queueInfo/QueueInfo.svelte";
</script>

<div class="flex flex-col items-start gap-2">
    <BranchInfo />
    <ClientInfo />
    <ClientOrderReady />
    <QueueInfo />
</div>
