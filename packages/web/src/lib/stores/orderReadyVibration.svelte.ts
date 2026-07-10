import { getContext, setContext } from "svelte";
import { browser } from "$app/environment";
import useVibrationLoop from "$lib/utils/useVibrationLoop.svelte";
import vibrationConfig from "$lib/config/vibrationConfig";
import type { OrdersStore } from "./orders.svelte";
import type { UserStore } from "./user.svelte";

const STORAGE_KEY_PREFIX = "order_ready_acknowledged";
const CONTEXT_KEY = Symbol("order-ready-vibration");

const storageKey = (orderId: string | number) => `${STORAGE_KEY_PREFIX}:${orderId}`;

function readAcknowledged (orderId: string | number | undefined): boolean {
    if (!orderId) return true;
    if (!browser) return false;
    return sessionStorage.getItem(storageKey(orderId)) === "1";
}

export type OrderReadyVibrationStore = ReturnType<typeof createOrderReadyVibration>;

export function createOrderReadyVibration (orders: OrdersStore, user: UserStore) {
    const inAppVibration = useVibrationLoop(vibrationConfig.inApp);

    let acknowledged = $state(readAcknowledged(user.orderId));
    let wasReady = false;

    $effect(() => {
        acknowledged = readAcknowledged(user.orderId);
    });

    $effect(() => {
        if (orders.orderIsReady && !acknowledged) {
            inAppVibration?.start();
        } else {
            inAppVibration?.stop();
        }

        if (!orders.orderIsReady && wasReady) {
            wasReady = false;
            acknowledged = false;

            if (browser && user.orderId) {
                sessionStorage.removeItem(storageKey(user.orderId));
            }
        }

        if (orders.orderIsReady) {
            wasReady = true;
        }

        return () => inAppVibration?.stop();
    });

    return {
        get isMute () {
            return acknowledged;
        },
        mute () {
            acknowledged = true;

            if (browser && user.orderId) {
                sessionStorage.setItem(storageKey(user.orderId), "1");
            }
        },
    };
}

export function setOrderReadyVibration (store: OrderReadyVibrationStore) {
    setContext(CONTEXT_KEY, store);
}

export function getOrderReadyVibration () {
    return getContext<OrderReadyVibrationStore>(CONTEXT_KEY);
}
