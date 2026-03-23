import foodServiceApi from "$lib/api/requests";
import type FoodServiceApi from "$lib/api/requests/FoodServiceApi";
import type { RuntimeDataType } from "$lib/types/events/RuntimeDataType";
import type OrdersStatus from "$lib/types/OrdersStatus";
import {
    runtimeDataStore,
    type RuntimeDataStore,
} from "./runtimeDataStore.svelte";
import { userStore, type UserStore } from "./user.svelte";

type OrderStateType = {
    id: string;
    isCurrent: boolean;
};

const isCurrentUserOrder = (
    orderId: string | number,
    userOrderId: string | number,
) => orderId === userOrderId;

const mapOrders = (orders: string[], userOrderId: string): OrderStateType[] => {
    return orders.map((order) => ({
        id: order,
        isCurrent: isCurrentUserOrder(order, userOrderId),
    }));
};

const sortForBoard = (a: OrderStateType, b: OrderStateType) => {
    if (a.isCurrent && !b.isCurrent) {
        return -1;
    }

    if (!a.isCurrent && b.isCurrent) {
        return 1;
    }

    return parseInt(b.id) - parseInt(a.id);
};

export class OrdersStore {
    public userStore: UserStore;
    private foodServiceApi: FoodServiceApi;
    private ordersStatus?: OrdersStatus = $state();

    constructor(
        private dataRepository: RuntimeDataStore<RuntimeDataType>,
        userStore: UserStore,
        foodServiceApi: FoodServiceApi,
    ) {
        this.userStore = userStore;
        this.foodServiceApi = foodServiceApi;
    }

    public async fetch() {
        this.ordersStatus = await this.foodServiceApi.fetchOrders();
    }

    public ordersProgress = $derived.by(() => {
        const ordersStatus =
            this.dataRepository.data.ordersStatus ?? this.ordersStatus;

        const userOrderId = this.userStore.orderId?.toString() ?? "";

        const inProgress = ordersStatus?.inProgress ?? [];
        const ready = ordersStatus?.ready ?? [];

        return {
            inProgress: mapOrders(inProgress, userOrderId).sort(sortForBoard),
            ready: mapOrders(ready, userOrderId).sort(sortForBoard),
        };
    });
}

export const ordersStore = new OrdersStore(
    runtimeDataStore,
    userStore,
    foodServiceApi,
);
