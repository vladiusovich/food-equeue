import { getContext, setContext } from "svelte";
import { browser } from "$app/environment";
import useVibrationLoop from "$lib/utils/useVibrationLoop.svelte";
import vibrationConfig from "$lib/config/vibrationConfig";
import type { OrdersStore } from "./orders.svelte";
import type { UserStore } from "./user.svelte";
import type { OrderReadyNotificationStore } from "./orderReadyNotification.svelte";

const STORAGE_KEY_PREFIX = "order_ready_acknowledged";
const CONTEXT_KEY = Symbol("order-ready-vibration");

const storageKey = (orderId: string | number) => `${STORAGE_KEY_PREFIX}:${orderId}`;

function readAcknowledged (orderId: string | number | undefined): boolean {
    if (!orderId) return true;
    if (!browser) return false;
    return sessionStorage.getItem(storageKey(orderId)) === "1";
}

export type OrderReadyStore = ReturnType<typeof createOrderReadyStore>;

export function createOrderReadyStore (orders: OrdersStore, user: UserStore, notifications: OrderReadyNotificationStore) {
    const inAppVibration = useVibrationLoop(vibrationConfig.inApp);

    let acknowledged = $state(readAcknowledged(user.orderId));
    let wasReady = false;
    let notified = false;

    $effect(() => {
        acknowledged = readAcknowledged(user.orderId);
    });

    $effect(() => {
        if (orders.orderIsReady && !acknowledged) {
            inAppVibration?.start();

            if (!notified) {
                notified = true;
                notifications.notify("Your order is ready!", {
                    body: user.orderId ? `Order #${user.orderId} is ready — please proceed to the service point.` : "Please proceed to the service point.",
                    tag: `order-ready-${user.orderId ?? ""}`,
                    requireInteraction: true,
                });
            }
        } else {
            inAppVibration?.stop();
        }

        if (!orders.orderIsReady && wasReady) {
            wasReady = false;
            acknowledged = false;
            notified = false;

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

export function initOrderReadyStore (orders: OrdersStore, user: UserStore, notifications: OrderReadyNotificationStore) {
    setContext(CONTEXT_KEY, createOrderReadyStore(orders, user, notifications));
}

export function getOrderReadyStore () {
    return getContext<OrderReadyStore>(CONTEXT_KEY);
}
