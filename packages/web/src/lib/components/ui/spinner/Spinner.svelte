<script lang="ts">
    interface Props {
        /** Size in pixels (width & height). */
        size?: number;
        /** Thickness of the ring in pixels. */
        thickness?: number;
        /** Arc color (any valid CSS color). */
        color?: string;
        /** Color of the "track" behind the arc. */
        trackColor?: string;
        /** Length of the visible arc, in degrees (0-360). */
        arc?: number;
        /** Full rotation duration, e.g. "0.9s" or "1200ms". */
        duration?: string;
        /** Additional classes for the root element. */
        class?: string;
    }

    let {
        size = 56,
        thickness = 6,
        color = "var(--color-primary-500)",
        trackColor = "color-mix(in srgb, white 10%, transparent)",
        arc = 270,
        duration = "0.9s",
        class: className = "",
    }: Props = $props();
</script>

<div
    class={["spinner rounded-full", className]}
    style:width="{size}px"
    style:height="{size}px"
    style:--spinner-color={color}
    style:--spinner-track-color={trackColor}
    style:--spinner-arc="{arc}deg"
    style:--spinner-thickness="{thickness}px"
    style:--spinner-duration={duration}
    role="status"
    aria-label="Loading"
></div>

<style>
    .spinner {
        background: conic-gradient(var(--spinner-color) 0deg var(--spinner-arc), var(--spinner-track-color) var(--spinner-arc) 360deg);
        mask: radial-gradient(farthest-side, transparent calc(100% - var(--spinner-thickness)), #000 calc(100% - var(--spinner-thickness)));
        -webkit-mask: radial-gradient(
            farthest-side,
            transparent calc(100% - var(--spinner-thickness)),
            #000 calc(100% - var(--spinner-thickness))
        );
        animation: spin var(--spinner-duration) linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
