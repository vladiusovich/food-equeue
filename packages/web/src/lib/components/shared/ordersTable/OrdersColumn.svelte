<script lang="ts">
    import { getAccentDotClass, type Accent } from "$lib/components/ui/types/Accent";

    let { title, accent, count, children }: { title: string; accent: Accent; count: number; children: any } = $props();

    const dotClass = $derived(getAccentDotClass(accent));
</script>

<div class="flex flex-1 flex-col gap-2">
    <div class="flex items-center gap-1.5">
        <div class={["size-1.5 rounded-full", dotClass]}></div>
        <span class="text-[11px] font-bold tracking-[0.03em] text-surface-200">{title} · {count}</span>
    </div>

    <div class="grid grid-cols-2 gap-1.5">
        {@render children()}
    </div>
</div>
