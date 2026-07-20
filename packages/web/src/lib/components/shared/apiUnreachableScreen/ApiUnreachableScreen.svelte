<script lang="ts">
    import { WifiOff } from "@lucide/svelte";
</script>

<div class="fixed inset-0 z-50 flex flex-1 flex-col items-center justify-center gap-6 bg-surface-900 px-4 py-10 text-center">
    <div class="rounded-[18px] border border-surface-700/40 bg-surface-800 p-6">
        <WifiOff stroke="pink" class="size-10" />
    </div>

    <div class="flex flex-col gap-2">
        <h2 class="text-xl font-bold text-surface-50">Server is unavailable</h2>
        <p class="text-sm font-medium text-surface-200">We can't reach the server right now. Please try again.</p>
    </div>

    <button
        type="button"
        class="rounded-full border border-surface-700/40 bg-surface-800 px-6 py-2 text-xs font-bold text-surface-200 active:opacity-80"
        onclick={() => location.reload()}
    >
        Retry
    </button>
</div>
