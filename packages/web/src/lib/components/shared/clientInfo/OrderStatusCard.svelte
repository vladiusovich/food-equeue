<script lang="ts">
    import UI from "$lib/components/ui";

    interface OrderStatusCard {
        orderId: string | number;
        isReady: boolean;
    }

    let { orderId, isReady }: OrderStatusCard = $props();

    const accent = $derived(isReady ? "success" : "primary");

    const accentClasses = $derived(
        isReady
            ? {
                  dot: "bg-success-500",
                  text: "text-success-500",
                  badgeBorder: "border-success-500/45",
                  badgeBg: "bg-success-500/16",
              }
            : {
                  dot: "bg-primary-500",
                  text: "text-primary-500",
                  badgeBorder: "border-primary-500/45",
                  badgeBg: "bg-primary-500/16",
              },
    );

    const stepDescriptions = {
        Accepted: "Your request was accepted and is queued",
        "In Progress": "Your request is being processed",
        Done: "Please proceed to the service point",
    };

    const steps = $derived([
        { label: "Accepted", active: true, current: false },
        { label: "In Progress", active: true, current: !isReady },
        { label: "Done", active: isReady, current: false },
    ]);

    const badgeText = $derived(isReady ? "Ready" : "In Progress");
    const description = $derived(isReady ? stepDescriptions.Done : stepDescriptions["In Progress"]);
</script>

<UI.Card class="relative">
    <UI.AuroraBackground accent={isReady ? "success" : "neutral"} />
    <div class="flex flex-col items-center gap-6">
        <div class="relative mt-3 size-45" style:--ring-color={`var(--color-${accent}-500)`}>
            <div class={["ring-track absolute inset-0 rounded-full", isReady && "ring-track--ready"]}></div>
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
                            step.active ? accentClasses.dot : "bg-surface-50/15",
                            step.current && "step-pulse",
                        ]}
                    ></div>
                    <span
                        class={[
                            "text-[10px] font-bold",
                            step.active ? "text-surface-50" : "text-surface-400",
                        ]}>{step.label}</span
                    >
                </div>
            {/each}
        </div>

        <div class={["flex items-center gap-1.5 rounded-full border px-3.5 py-1.5", accentClasses.badgeBorder, accentClasses.badgeBg]}>
            {#if isReady}
                <div class="badge-check"></div>
            {:else}
                <div class={["float-dot size-1.5 rounded-full", accentClasses.dot]}></div>
            {/if}
            <span class={["text-xs font-bold", accentClasses.text]}>{badgeText}</span>
        </div>

        {#if description}
            <span class="-mt-4 text-xs font-medium text-surface-200">{description}</span>
        {/if}
    </div>
</UI.Card>

<style>
    .ring-track {
        box-shadow: rgb(from var(--ring-color) r g b / 0.3) 5px 0px 15px;
        background: conic-gradient(var(--ring-color) 0deg 245deg, color-mix(in srgb, white 8%, transparent) 245deg 360deg);
        animation: spin 3s linear infinite;
    }

    .ring-track--ready {
        background: var(--ring-color);
        animation: pulse-glow 2.2s ease-in-out infinite;
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

    .badge-check {
        width: 8px;
        height: 5px;
        border-left: 2px solid var(--color-success-500);
        border-bottom: 2px solid var(--color-success-500);
        transform: rotate(-45deg) translateY(-1px);
    }
</style>
