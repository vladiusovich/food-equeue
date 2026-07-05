<script lang="ts">
    let { title, value }: { title: string; value: string | number } = $props();
</script>

<div class="flex flex-col items-center gap-0.5">
    <span class="text-xl font-bold text-surface-50">{value}</span>
    <span class="text-center text-[10px] font-semibold text-surface-200">{title}</span>
</div>
