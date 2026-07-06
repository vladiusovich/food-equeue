<script lang="ts">
    const qrDots = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
</script>

<div class="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10 text-center">
    <div class="flex items-center gap-2">
        <div class="size-7 rounded-[9px] bg-primary-500"></div>
        <span class="text-base font-bold text-surface-50">eQueue</span>
    </div>

    <div class="rounded-[18px] border border-surface-700/40 bg-surface-800 p-6">
        <div class="grid grid-cols-5 gap-1.5 size-30">
            {#each qrDots as dot, i (i)}
                <div class={["rounded-[3px]", dot ? "bg-primary-500" : "bg-surface-50/8"]}></div>
            {/each}
        </div>
    </div>

    <div class="flex flex-col gap-2">
        <h2 class="text-xl font-bold text-surface-50">Scan your ticket QR code</h2>
        <p class="text-sm font-medium text-surface-200">Your status will appear here right after scanning</p>
    </div>

    <!-- <div class="rounded-full border border-dashed border-surface-50/8 px-4.5 py-2.5 text-xs font-bold text-surface-400">
        Waiting for scan…
    </div> -->
</div>
