<script lang="ts">
    import UI from "$lib/components/ui";
    import { getAppContext } from "$lib/stores/index.svelte";
    import { onMount } from "svelte";

    const app = getAppContext();

    onMount(() => {
        app.user.fetch();
    });

    let wasReady = $state(false);

    $effect(() => {
        if (app.orders.orderIsReady && !wasReady) {
            navigator.vibrate?.([80, 40, 80]);
        }

        wasReady = app.orders.orderIsReady;
    });

    const steps = $derived([
        { label: "Accepted", active: true },
        { label: "Cooking", active: true },
        { label: "Done", active: app.orders.orderIsReady },
    ]);
</script>

{#if app.user.orderId}
    {#if app.orders.orderIsReady}
        <div class="hero-glow flex w-full flex-col items-center gap-2 rounded-[18px] border border-success-500/50 bg-success-500/16 px-4 py-5">
            <div class="flex size-8.5 items-center justify-center rounded-full bg-success-500">
                <div class="check"></div>
            </div>
            <span class="text-[11px] font-bold tracking-[0.04em] text-success-500 uppercase">Your order</span>
            <span class="text-6xl font-bold leading-none text-surface-50">{app.user.orderId}</span>
            <div class="mt-1 flex flex-col items-center text-center">
                <span class="text-base font-bold text-success-500">Order ready!</span>
                <span class="text-xs font-medium text-surface-200">Pick it up at the counter</span>
            </div>
        </div>
    {:else}
        <UI.Card>
            <div class="flex flex-col items-center">
                <div class="relative mt-1.5 size-43">
                    <div class="ring-track absolute inset-0 rounded-full"></div>
                    <div class="absolute inset-2.5 flex flex-col items-center justify-center rounded-full bg-surface-800">
                        <span class="text-[10px] font-bold tracking-[0.04em] text-surface-200 uppercase">Your order</span>
                        <span class="text-5xl font-bold leading-none text-surface-50">{app.user.orderId}</span>
                    </div>
                </div>

                <div class="mt-2.5 flex justify-center gap-5">
                    {#each steps as step (step.label)}
                        <div class="flex flex-col items-center gap-1.5">
                            <div class={["size-2 rounded-full", step.active ? "bg-primary-500" : "bg-surface-50/15"]}></div>
                            <span class={["text-[10px] font-bold", step.active ? "text-surface-50" : "text-surface-400"]}>{step.label}</span>
                        </div>
                    {/each}
                </div>

                <div class="mt-3 flex items-center gap-1.5 rounded-full border border-primary-500/45 bg-primary-500/16 px-3.5 py-1.5">
                    <div class="float-dot size-1.5 rounded-full bg-primary-500"></div>
                    <span class="text-xs font-bold text-primary-500">Cooking</span>
                </div>
            </div>
        </UI.Card>
    {/if}
{:else}
    <div class="placeholder w-full h-40"></div>
{/if}

<style>
    .ring-track {
        background: conic-gradient(
            var(--color-primary-500) 0deg 245deg,
            color-mix(in srgb, white 8%, transparent) 245deg 360deg
        );
    }

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

    .float-dot {
        animation: float-dot 1.4s ease-in-out infinite;
    }
</style>
