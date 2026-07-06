<script lang="ts">
    import UI from "$lib/components/ui";

    interface Step {
        label: string;
        active: boolean;
        current: boolean;
    }

    interface CookingProgressCard {
        orderId: string | number;
        steps: Step[];
    }

    let { orderId, steps }: CookingProgressCard = $props();
</script>

<UI.Card class="relative">
    <UI.AuroraBackground />
    <div class="flex flex-col items-center gap-6">
        <div class="relative mt-3 size-45">
            <div class="ring-track absolute inset-0 rounded-full"></div>
            <div class="insert-ring absolute inset-2.5 flex flex-col items-center justify-center rounded-full bg-surface-800">
                <span class="text-[10px] font-bold text-surface-200 uppercase">Your order</span>
                <span class="text-5xl font-bold leading-none text-surface-50">{orderId}</span>
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

<style>
    .ring-track {
        box-shadow: rgb(from var(--color-primary-500) r g b / 0.3) 5px 0px 15px;
        background: conic-gradient(var(--color-primary-500) 0deg 245deg, color-mix(in srgb, white 8%, transparent) 245deg 360deg);
        animation: spin 3s linear infinite;
    }

    .insert-ring {
        box-shadow: var(--color-surface-950) 0 0 10px 0px;
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

    .float-dot {
        animation: float-dot 1.4s ease-in-out infinite;
    }
</style>
