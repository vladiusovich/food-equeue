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
        { label: "Accepted", active: true, current: false },
        { label: "Cooking", active: true, current: !app.orders.orderIsReady },
        { label: "Done", active: app.orders.orderIsReady, current: false },
    ]);
</script>

{#if app.user.orderId}
    {#if app.orders.orderIsReady}
        <div
            class="hero-glow flex w-full flex-col items-center gap-2 rounded-[18px] border border-success-500/50 bg-success-500/16 px-4 py-5"
        >
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
        <UI.Card class="relative">
            <div class="wbg-aurora"></div>
            <div class="flex flex-col items-center gap-6">
                <div class="relative mt-3 size-45">
                    <div class="ring-track absolute inset-0 rounded-full"></div>
                    <div class="insert-ring absolute inset-2.5 flex flex-col items-center justify-center rounded-full bg-surface-800">
                        <span class="text-[10px] font-bold text-surface-200 uppercase">Your order</span>
                        <span class="text-5xl font-bold leading-none text-surface-50">{app.user.orderId}</span>
                    </div>
                </div>

                <div class="flex justify-center gap-5">
                    {#each steps as step (step.label)}
                        <div class="flex flex-col items-center gap-1.5">
                            <div
                                class={[
                                    "size-2 rounded-full",
                                    step.active ? "bg-primary-500" : "bg-surface-50/15",
                                    step.current && "step-pulse",
                                ]}
                            ></div>
                            <span
                                class={[
                                    "text-[10px] font-bold",
                                    step.active ? "text-surface-50" : "text-surface-400",
                                    step.current && "step-pulse",
                                ]}>{step.label}</span
                            >
                        </div>
                    {/each}
                </div>

                <div class="flex items-center gap-1.5 rounded-full border border-primary-500/45 bg-primary-500/16 px-3.5 py-1.5">
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
        box-shadow: rgb(from var(--color-primary-500) r g b / 0.3) 5px 0px 15px;
        background: conic-gradient(var(--color-primary-500) 0deg 245deg, color-mix(in srgb, white 8%, transparent) 245deg 360deg);
        animation: spin 3s linear infinite;
    }

    .insert-ring {
        box-shadow: var(--color-surface-950) 0 0 10px 0px;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .step-pulse {
        animation: step-pulse 1.4s ease-in-out infinite;
    }

    @keyframes step-pulse {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.45;
        }
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

    .wbg-aurora {
        position: absolute;
        inset: 0;
        overflow: hidden;
    }

    .wbg-aurora::before {
        background: radial-gradient(circle, var(--color-secondary-400), transparent 70%);
        top: -30%;
        left: 0%;
        animation: auroraDrift1 9s ease-in-out infinite;
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

    .wbg-aurora::after {
        background: radial-gradient(circle, var(--color-warning-300), transparent 60%);
        bottom: -20%;
        right: -25%;
        animation: s-MtI7LzEUDo2Z-auroraDrift2 11s ease-in-out infinite;
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
