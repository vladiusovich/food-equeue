<script lang="ts">
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
    <!-- <div class="col-span-12">
		ExecutionTimeInfo
	</div> -->

    <div class="">
        <div
            class="card preset-filled-surface-100-900 border border-surface-200-800 w-full divide-surface-200-800 p-3"
        >
            <QueueItem title="Count" value={inProgress + ready} />
        </div>
    </div>

    <div class="">
        <div
            class="card preset-filled-surface-100-900 border border-surface-200-800 w-full divide-surface-200-800 p-3"
        >
            <QueueItem title="In progress" value={inProgress} />
        </div>
    </div>

    <div class="">
        <div
            class="card preset-filled-surface-100-900 border border-surface-200-800 w-full divide-surface-200-800 p-3"
        >
            <QueueItem title="Ready" value={ready} />
        </div>
    </div>
</div>
