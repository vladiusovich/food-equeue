<script lang="ts">
    import { getAccentBadgeClasses, type Accent } from "$lib/components/ui/types/Accent";

    let { value, accent = "neutral" }: { value: string | number; accent?: Accent } = $props();

    const accentClasses = $derived(getAccentBadgeClasses(accent));
</script>

<div
    class={[
        "rounded-xl border px-1 py-2.5 text-center text-base font-bold",
        accentClasses.border,
        accentClasses.bg,
        accentClasses.text,
    ]}
>
    {value}
</div>
