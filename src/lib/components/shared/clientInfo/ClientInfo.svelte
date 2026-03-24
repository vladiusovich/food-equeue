<script lang="ts">
    import UI from "$lib/components/ui";
    import { getAppContext } from "$lib/stores";

    const app = getAppContext();
</script>

{#if app.user.orderId}
    <div class="w-full" class:wobble={app.orders.orderIsReady}>
        <UI.Card>
            <div class="flex flex-col gap-3">
                <div class="flex flex-col items-center">
                    <h6 class="h6">Your order</h6>
                    <h1 class="h1">
                        {app.user.orderId}
                    </h1>
                </div>

                <div class="flex flex-col gap-1 items-center">
                    {#if app.orders.orderIsReady}
                        <h6 class="h6">Your order is ready</h6>
                        <p class="text-xs">Please pick up your order at the pick-up location</p>
                    {:else}
                        <h6 class="h6">Processing...</h6>
                        <p class="text-xs">Please wait</p>
                    {/if}
                </div>
            </div>
        </UI.Card>
    </div>
{:else}
    <div class="placeholder rounded-xl animate-pulse w-full h-40"></div>
{/if}

<style>
    .wobble {
        animation: wobble 2s infinite;
        animation-delay: 0ms;
    }

    @keyframes wobble {
        0%,
        33%,
        100% {
            transform: translateX(0%);
            transform-origin: 50% 50%;
        }
        5% {
            transform: translateX(-7px) rotate(-2deg);
        }
        10% {
            transform: translateX(7px) rotate(2deg);
        }
        15% {
            transform: translateX(-7px) rotate(-1deg);
        }
        20% {
            transform: translateX(4px) rotate(1deg);
        }
        25% {
            transform: translateX(-3px) rotate(-0.6deg);
        }
    }
</style>
