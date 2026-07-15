<script lang="ts">
    import type { ClassValue } from "svelte/elements";

    interface Card {
	    class?: ClassValue | undefined | null;
        children: any;
    }

    let { children, class: classNames }: Card = $props();
</script>

<div
    class={[
        "card w-full overflow-hidden rounded-xl border border-surface-700/40 bg-surface-800 p-4 text-surface-50",
        classNames ? classNames : ""
    ]}
>
    {@render children()}
</div>
