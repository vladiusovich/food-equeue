<script lang="ts">
    import { getAppContext } from "$lib/stores/index.svelte";
    import { getNotifications } from "$lib/stores/orderReadyNotification.svelte";
    import { Bell } from "@lucide/svelte";

    const app = getAppContext();
    const notification = getNotifications();
</script>

{#if notification.isSupported && notification.permission === "default" && !app.orders.orderIsReady}
    <button
        type="button"
        class="w-full rounded-full border border-surface-700/40 bg-surface-800 py-2 text-xs font-bold text-surface-200 active:opacity-80"
        onclick={notification.requestPermission}
    >
        <div class="flex gap-2 justify-center items-center">
            <Bell stroke="pink" class="size-4" />
            Enable notifications
        </div>
    </button>
{/if}
