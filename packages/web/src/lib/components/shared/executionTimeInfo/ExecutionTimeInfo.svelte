<script lang="ts">
    import UI from "$lib/components/ui";
    import { getAppContext } from "$lib/stores/index.svelte";

    const app = getAppContext();
    let executionTime = $derived(app.orders.executionTime);
</script>

{#if app.orders.ordersStatus}
    <UI.Card>
        <div class="flex flex-col gap-1">
            <h6 class="h6">Average waiting time</h6>
            {#if executionTime}
                <p class="xxsmall">{executionTime} min</p>
            {:else}
                <div class="placeholder animate-pulse w-20"></div>
            {/if}
        </div>
    </UI.Card>
{:else}
    <div class="placeholder rounded-xl animate-pulse h-20"></div>
{/if}
