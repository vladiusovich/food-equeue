<script lang="ts">
    import { getAppContext } from "$lib/stores/index.svelte";
    import { getOrderReadyStore } from "$lib/stores/orderReadyVibration.svelte";

    const app = getAppContext();
    const vibration = getOrderReadyStore();
</script>

<div class="flex flex-col w-full">
    {#if !vibration.isMute && app.orders.orderIsReady}
        <button
            type="button"
            class="w-full rounded-lg border border-success-500/45 bg-success-500/25 px-4 py-4 text-xs font-bold text-surface-200 active:opacity-80"
            onclick={vibration.mute}
        >
            I'm on my way
        </button>
    {/if}
</div>
