import { browser } from "$app/environment";

const STORAGE_KEY_PREFIX = "order_ready_acknowledged";

const storageKey = (orderId: string | number) => `${STORAGE_KEY_PREFIX}:${orderId}`;

function createOrderReadyAcknowledgedState() {
    let acknowledgedOrderId: string | number | undefined = $state(undefined);

    return {
        isAcknowledged(orderId: string | number): boolean {
            if (acknowledgedOrderId === orderId) {
                return true;
            }

            return browser && sessionStorage.getItem(storageKey(orderId)) !== null;
        },

        acknowledge(orderId: string | number) {
            acknowledgedOrderId = orderId;

            if (browser) {
                sessionStorage.setItem(storageKey(orderId), "1");
            }
        },

        clear(orderId: string | number) {
            if (acknowledgedOrderId === orderId) {
                acknowledgedOrderId = undefined;
            }

            if (browser) {
                sessionStorage.removeItem(storageKey(orderId));
            }
        },
    };
}

export const orderReadyAcknowledgedState = createOrderReadyAcknowledgedState();
