import { getContext, setContext } from "svelte";
import { browser } from "$app/environment";

export type NotificationPermissionState = "unsupported" | "default" | "granted" | "denied";

const isSupported = () => browser && "Notification" in window && "serviceWorker" in navigator;

const CONTEXT_KEY = Symbol("order-ready-notification");

export type OrderReadyNotificationStore = ReturnType<typeof createOrderReadyNotification>;

export function createOrderReadyNotification () {
    let permission = $state<NotificationPermissionState>(isSupported() ? (Notification.permission as NotificationPermissionState) : "unsupported");
    let registration: ServiceWorkerRegistration | undefined;

    if (isSupported()) {
        navigator.serviceWorker
            .register("/service-worker.js")
            .then(reg => {
                registration = reg;
            })
            .catch(error => {
                console.error("Failed to register service worker", error);
            });
    }

    async function requestPermission () {
        if (!isSupported()) return;

        permission = await Notification.requestPermission();
    }

    async function notify (title: string, options?: NotificationOptions) {
        if (!isSupported() || permission !== "granted") return;

        const reg = registration ?? (await navigator.serviceWorker.ready);

        reg.active?.postMessage({
            type: "show-notification",
            payload: { title, options },
        });
    }

    return {
        get permission () {
            return permission;
        },
        get isSupported () {
            return isSupported();
        },
        requestPermission,
        notify,
    };
}

export function initNotifications () {
     const notification = createOrderReadyNotification();
    setContext(CONTEXT_KEY, notification);

    return notification;
}

export function getNotifications () {
    return getContext<OrderReadyNotificationStore>(CONTEXT_KEY);
}
