<script lang="ts">
    interface OrderReadyBanner {
        orderId: string | number;
    }

    let { orderId }: OrderReadyBanner = $props();
</script>

<div class="hero-glow flex w-full flex-col items-center gap-2 rounded-[18px] border border-success-500/50 bg-success-500/16 px-4 py-5">
    <div class="flex size-8.5 items-center justify-center rounded-full bg-success-500">
        <div class="check"></div>
    </div>
    <span class="text-[11px] font-bold tracking-[0.04em] text-success-500 uppercase">Your order</span>
    <span class="text-6xl font-bold leading-none text-surface-50">{orderId}</span>
    <div class="mt-1 flex flex-col items-center text-center">
        <span class="text-base font-bold text-success-500">Order ready!</span>
        <span class="text-xs font-medium text-surface-200">Pick it up at the counter</span>
    </div>
</div>

<style>
    .hero-glow {
        animation: pulse-glow 2.2s ease-in-out infinite;
    }

    .check {
        width: 14px;
        height: 8px;
        border-left: 3px solid var(--color-success-950);
        border-bottom: 3px solid var(--color-success-950);
        transform: rotate(-45deg) translateY(-2px);
    }
</style>
