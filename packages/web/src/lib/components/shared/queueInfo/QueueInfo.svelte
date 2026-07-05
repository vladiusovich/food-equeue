<script lang="ts">
    import UI from "$lib/components/ui";
    import { getAppContext } from "$lib/stores/index.svelte";
    import { onMount } from "svelte";
    import QueueItem from "./QueueItem.svelte";

    const app = getAppContext();

    onMount(() => {
        app.orders.fetch();
    });

    let ordersProgress = $derived(app.orders.ordersProgress);
    let inProgress = $derived(ordersProgress?.inProgress?.length ?? 0);
    let ready = $derived(ordersProgress?.ready?.length ?? 0);
    let executionTime = $derived(app.orders.executionTime);
    let isReady = $derived(app.orders.orderIsReady);
</script>

{#if app.orders.ordersStatus}
    <UI.Card>
        <div class="flex w-full">
            <div class="flex flex-1 items-center justify-center">
                <QueueItem
                    title={isReady ? "Time in progress" : "Waiting, min"}
                    value={isReady ? `${executionTime ?? "—"} min` : executionTime ?? "—"}
                />
            </div>
            <div class="flex flex-1 items-center justify-center">
                <QueueItem title="In progress" value={inProgress} />
            </div>
            <div class="flex flex-1 items-center justify-center">
                <QueueItem title={isReady ? "Total" : "Done"} value={isReady ? inProgress + ready : ready} />
            </div>
        </div>
    </UI.Card>
{:else}
    <div class="placeholder w-full h-20"></div>
{/if}
