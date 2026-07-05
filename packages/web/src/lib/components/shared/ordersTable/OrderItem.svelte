<script lang="ts">
    let { value, isCurrent }: { value: string | number; isCurrent: boolean } = $props();
</script>

<div
    class={[
        "rounded-xl border px-1 py-2.5 text-center text-base font-bold",
        isCurrent
            ? "border-primary-500/45 bg-primary-500/16 text-primary-500"
            : "border-surface-700/40 bg-surface-700 text-surface-50",
    ]}
>
    {value}
</div>
