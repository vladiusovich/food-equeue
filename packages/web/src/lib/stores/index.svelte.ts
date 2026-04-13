import { createContext, setContext } from "svelte";
import BranchStore from "./branch.svelte";
import foodServiceApi from "$lib/api/requests";
import type { AppStoreType } from "./types/AppStoreType";
import UserStore from "./user.svelte";
import MessagesApiProvider, { type SocketEventHandlersType } from "$lib/api/socketApiListner/MessagesApiProvider";
import { io } from "socket.io-client";
import { AuthStore } from "./auth.svelte";
import OrdersStore from "./orders.svelte";
import RuntimeDataStore from "./runtimeDataStore.svelte";
import type { RuntimeDataType } from "$lib/types/events/RuntimeDataType";

export const runtimeDataStore = new RuntimeDataStore<RuntimeDataType>();

const socketEventHandlers: SocketEventHandlersType = {
    "customer.orders.updated": data => runtimeDataStore.setData("ordersStatus", data),
    "customer.orders.executionTimeChanged": data => runtimeDataStore.setData("executionTime", data),
};

const messagesApiProvider = new MessagesApiProvider(io("http://192.168.100.11:3002/customers"), socketEventHandlers);

const authStore = new AuthStore(foodServiceApi);
const userStore = new UserStore(authStore, foodServiceApi, messagesApiProvider);
const branchStore = new BranchStore(userStore, foodServiceApi);
const ordersStore = new OrdersStore(runtimeDataStore, userStore, foodServiceApi);

const appStore: AppStoreType = {
    user: userStore,
    orders: ordersStore,
    branch: branchStore,
};

export const [getAppContext, setAppContext] = createContext<AppStoreType>();

export const initAppContext = () => {
    setAppContext(appStore);
};
