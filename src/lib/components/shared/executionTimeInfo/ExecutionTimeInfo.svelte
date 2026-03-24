<script lang="ts">
    import { getAppContext } from "$lib/stores";

    const app = getAppContext();
    let executionTime = $derived(app.orders.executionTime);
</script>

<div
    class="card preset-filled-surface-100-900 border border-surface-200-800 w-full divide-surface-200-800 p-3"
>
    <div class="flex flex-col gap-1">
        <h6 class="h6">Average waiting time</h6>
        {#if executionTime}
            <p class="xxsmall">{executionTime} min</p>
        {:else}
            <div class="placeholder animate-pulse w-20"></div>
        {/if}
    </div>
</div>
