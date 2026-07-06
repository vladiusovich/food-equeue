<script lang="ts">
    import UI from "$lib/components/ui";
    import { getAppContext } from "$lib/stores/index.svelte";
    import { onMount } from "svelte";

    const app = getAppContext();

    let branch = $derived(app.branch.info);

    onMount(() => {
        app.branch.fetch();
    });
</script>

{#if branch}
    <UI.Card class="relative">
        <UI.AuroraBackground accent={app.orders.orderIsReady ? "success" : "neutral"} />
        <div class="flex flex-col gap-0.5">
            <span class="text-[15px] font-extrabold text-surface-50">{branch?.name}</span>
            <span class="text-xs font-medium text-surface-200">{branch?.address}</span>
        </div>
    </UI.Card>
{:else}
    <div class="placeholder rounded-[18px] animate-pulse w-full h-20"></div>
{/if}
