<script lang="ts">
    let { children } = $props();
</script>

<div
    class="card w-full overflow-hidden rounded-[18px] border border-surface-700/40 bg-surface-800 p-4 text-surface-50"
>
    {@render children()}
</div>
