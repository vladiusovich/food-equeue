<script lang="ts">
    import { getAppContext } from "$lib/stores/index.svelte";
    import { getOrderReadyVibration } from "$lib/stores/orderReadyVibration.svelte";

    const app = getAppContext();
    const vibration = getOrderReadyVibration();
</script>

{#if app.orders.orderIsReady && !vibration.acknowledged}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 p-4 backdrop-blur-sm">
        <div class="ready-pulse flex w-full max-w-sm flex-col items-center gap-5 rounded-[18px] border border-success-500/45 bg-surface-800 p-6 text-center text-surface-50">
            <div class="badge-check-lg"></div>
            <div class="flex flex-col gap-1">
                <span class="text-lg font-bold">Your order is ready!</span>
                <span class="text-sm text-surface-300">Order #{app.user.orderId} is ready. Please proceed to the service point.</span>
            </div>
            <button
                type="button"
                class="w-full rounded-full bg-success-500 px-5 py-3 text-sm font-bold text-surface-950 active:opacity-80"
                onclick={vibration.acknowledgeModal}
            >
                I saw it
            </button>
        </div>
    </div>
{/if}

<style>
    .ready-pulse {
        animation: ready-pulse-scale 1.4s ease-in-out infinite;
    }

    @keyframes ready-pulse-scale {
        0%,
        100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.02);
        }
    }

    .badge-check-lg {
        width: 22px;
        height: 13px;
        border-left: 4px solid var(--color-success-500);
        border-bottom: 4px solid var(--color-success-500);
        transform: rotate(-45deg) translateY(-3px);
    }
</style>
