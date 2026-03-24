<script lang="ts">
    let { title, children } = $props();
</script>

<div class="flex flex-col items-center gap-2">
    <span class="font-bold">{title}</span>
    <div class="flex flex-row flex-wrap gap-2 items-stretch">
        {@render children()}
    </div>
</div>
