<script lang="ts">
    import { getAccentColors, type Accent } from "../types/Accent";

    interface AuroraBackground {
        accent?: Accent;
        color1?: string;
        color2?: string;
    }

    let { accent = "neutral", color1, color2 }: AuroraBackground = $props();

    const accentColors = $derived(getAccentColors(accent));
    const resolvedColor1 = $derived(color1 ?? accentColors.color1);
    const resolvedColor2 = $derived(color2 ?? accentColors.color2);
</script>

<div class="wbg-aurora" style:--aurora-color-1={resolvedColor1} style:--aurora-color-2={resolvedColor2}></div>

<style>
    .wbg-aurora {
        position: absolute;
        inset: 0;
        overflow: hidden;
    }

    .wbg-aurora::before,
    .wbg-aurora::after {
        content: "";
        position: absolute;
        width: 40%;
        padding-top: 50%;
        border-radius: 50%;
        filter: blur(65px);
        opacity: 0.5;
    }

    .wbg-aurora::before {
        background: radial-gradient(circle, var(--aurora-color-1), transparent 70%);
        top: -30%;
        left: 0%;
        animation: auroraDrift1 9s ease-in-out infinite;
    }

    .wbg-aurora::after {
        background: radial-gradient(circle, var(--aurora-color-2), transparent 60%);
        bottom: -20%;
        right: -25%;
        animation: auroraDrift2 11s ease-in-out infinite;
    }

    @keyframes auroraDrift1 {
        0%,
        100% {
            transform: translate(0, 0) scale(1);
        }
        50% {
            transform: translate(18%, 14%) scale(1.15);
        }
    }

    @keyframes auroraDrift2 {
        0%,
        100% {
            transform: translate(0, 0) scale(1);
        }
        50% {
            transform: translate(-14%, -12%) scale(1.1);
        }
    }
</style>
