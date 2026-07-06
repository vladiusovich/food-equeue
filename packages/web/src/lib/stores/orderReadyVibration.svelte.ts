import { createContext } from "svelte";
import useVibrationLoop from "$lib/utils/useVibrationLoop.svelte";
import vibrationConfig from "$lib/config/vibrationConfig";
import { orderReadyAcknowledgedState } from "./orderReadyAcknowledgedState.svelte";
import type { OrdersStore } from "./orders.svelte";
import type { UserStore } from "./user.svelte";

export type OrderReadyVibrationStore = ReturnType<typeof createOrderReadyVibration>;

export const [getOrderReadyVibration, setOrderReadyVibration] = createContext<OrderReadyVibrationStore>();

export function createOrderReadyVibration (orders: OrdersStore, user: UserStore) {
    const modalVibration = useVibrationLoop(vibrationConfig.readyModal);
    const inAppVibrationConfig = vibrationConfig.inApp;
    const inAppVibration = inAppVibrationConfig.enabled ? useVibrationLoop(inAppVibrationConfig) : undefined;

    let inAppMuted = $state(false);
    let wasReady = false;

    const acknowledged = $derived(!user.orderId || orderReadyAcknowledgedState.isAcknowledged(user.orderId));

    $effect(() => {
        if (orders.orderIsReady && !acknowledged) {
            modalVibration.start();
        } else {
            modalVibration.stop();
        }

        return modalVibration.stop;
    });

    $effect(() => {
        if (orders.orderIsReady && acknowledged && !inAppMuted) {
            inAppVibration?.start();
        } else {
            inAppVibration?.stop();
        }

        return () => inAppVibration?.stop();
    });

    $effect(() => {
        if (orders.orderIsReady) {
            wasReady = true;
        } else if (wasReady) {
            wasReady = false;
            inAppMuted = false;

            if (user.orderId) {
                orderReadyAcknowledgedState.clear(user.orderId);
            }
        }
    });

    return {
        get acknowledged() { return acknowledged; },
        get inAppMuted() { return inAppMuted; },
        get inAppEnabled() { return inAppVibrationConfig.enabled; },

        acknowledgeModal () {
            if (user.orderId) {
                orderReadyAcknowledgedState.acknowledge(user.orderId);
            }
        },

        muteInApp () {
            inAppMuted = true;
        },
    };
}
