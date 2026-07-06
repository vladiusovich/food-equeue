<script lang="ts">
    interface Props {
        /** Additional classes, e.g. for width/height (Tailwind: "h-3 w-3/5"). */
        class?: string;
        /** Full pulse duration, e.g. "1.6s". */
        duration?: string;
    }

    let { class: className = "", duration = "1.6s" }: Props = $props();
</script>

<div class={["shimmer-bar", className]} style:--shimmer-duration={duration}></div>

<style>
    .shimmer-bar {
        border-radius: 6px;
        background: color-mix(in srgb, white 6%, transparent);
        animation: shimmer var(--shimmer-duration) ease-in-out infinite;
    }

    @keyframes shimmer {
        0%,
        100% {
            opacity: 0.4;
        }
        50% {
            opacity: 1;
        }
    }
</style>
