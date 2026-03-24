<script lang="ts">
    import { getAppContext } from "$lib/stores";

    const app = getAppContext();

    let branch = $derived(app.branch.info);

    $effect(() => {
        app.branch.fetch();
    });
</script>

<div
    class="card preset-filled-surface-100-900 border border-surface-200-800 w-full divide-surface-200-800 p-3"
>
    <h4 class="h4">{branch?.name}</h4>
    <p class="text-xs">
        {branch?.address}
    </p>
</div>
