import foodServiceApi from "$lib/api/requests";
import type FoodServiceApi from "$lib/api/requests/FoodServiceApi";
import type { RuntimeDataType } from "$lib/types/events/RuntimeDataType";
import type OrdersStatus from "$lib/types/OrdersStatus";
import { runtimeDataStore, type RuntimeDataStore } from "./runtimeDataStore.svelte";
import { userStore, type UserStore } from "./user.svelte";

type OrderStateType = {
    id: string;
    isCurrent: boolean;
};

const isCurrentUserOrder = (orderId: string | number, userOrderId: string | number) => orderId === userOrderId;

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
    private ordersStatusData?: OrdersStatus = $state();

    constructor(
        private dataRepository: RuntimeDataStore<RuntimeDataType>,
        userStore: UserStore,
        foodServiceApi: FoodServiceApi,
    ) {
        this.userStore = userStore;
        this.foodServiceApi = foodServiceApi;
    }

    public isLoading = $state(false);

    public async fetch() {
        this.isLoading = true;
        this.ordersStatusData = await this.foodServiceApi.fetchOrders();
        this.isLoading = false;
    }

    public executionTime = $derived.by(() => this.dataRepository.data?.executionTime);

    public ordersStatus = $derived.by(() => this.dataRepository.data.ordersStatus ?? this.ordersStatusData);

    public orderIsReady = $derived.by(() => {
        const ordersProgress = this.ordersProgress;
        const readyOrders = ordersProgress.ready ?? [];
        return readyOrders.some((order) => order.isCurrent);
    });

    public ordersProgress = $derived.by(() => {
        const userOrderId = this.userStore.orderId?.toString() ?? "";

        const inProgress = this.ordersStatus?.inProgress ?? [];
        const ready = this.ordersStatus?.ready ?? [];

        return {
            inProgress: mapOrders(inProgress, userOrderId).sort(sortForBoard),
            ready: mapOrders(ready, userOrderId).sort(sortForBoard),
        };
    });
}

export const ordersStore = new OrdersStore(runtimeDataStore, userStore, foodServiceApi);
