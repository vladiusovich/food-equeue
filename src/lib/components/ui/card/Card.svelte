<script lang="ts">
    let { children } = $props();
</script>

<div class="card p-4 rounded-xl preset-filled-surface-100-900 border-0 w-full overflow-hidden">
    {@render children()}
</div>
