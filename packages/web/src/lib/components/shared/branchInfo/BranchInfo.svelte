<script lang="ts">
    import UI from "$lib/components/ui";
    import { getAppContext } from "$lib/stores";

    const app = getAppContext();
    let branch = $derived(app.branch.info);

    $effect(() => {
        app.branch.fetch();
    });
</script>

{#if branch}
    <UI.Card>
        <h4 class="h4">{branch?.name}</h4>
        <p class="text-xs">
            {branch?.address}
        </p>
    </UI.Card>
{:else}
    <div class="placeholder rounded-xl animate-pulse w-full h-20"></div>
{/if}
