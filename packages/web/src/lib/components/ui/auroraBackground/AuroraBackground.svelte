<script lang="ts">
    interface AuroraBackground {
        color1?: string;
        color2?: string;
    }

    let { color1 = "var(--color-secondary-400)", color2 = "var(--color-warning-300)" }: AuroraBackground = $props();
</script>

<div class="wbg-aurora" style:--aurora-color-1={color1} style:--aurora-color-2={color2}></div>

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
