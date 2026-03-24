<script lang="ts">
    import UI from "$lib/components/ui";
    import { getAppContext } from "$lib/stores";
    import QueueItem from "./QueueItem.svelte";

    const app = getAppContext();

    $effect(() => {
        app.orders.fetch();
    });

    let ordersProgress = $derived(app.orders.ordersProgress);

    let inProgress = $derived(ordersProgress?.inProgress?.length ?? 0);
    let ready = $derived(ordersProgress?.ready?.length ?? 0);
</script>

<div class="grid grid-cols-3 gap-2 w-full">
    <UI.Card>
        <QueueItem title="Count" value={inProgress + ready} />
    </UI.Card>

    <UI.Card>
        <QueueItem title="In progress" value={inProgress} />
    </UI.Card>

    <UI.Card>
        <QueueItem title="Ready" value={ready} />
    </UI.Card>
</div>
