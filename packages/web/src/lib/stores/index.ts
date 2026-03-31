import { createContext, setContext } from "svelte";
import { branchStore } from "./branch.svelte";
import type { AppStoreType } from "./types/AppStoreType";
import { userStore } from "./user.svelte";
import { ordersStore } from "./orders.svelte";
import SocketApiListner, { type SocketEventHandlersType } from "$lib/api/socketApiListner/SocketApiListner";
import { io } from "socket.io-client";
import { runtimeDataStore } from "./runtimeDataStore.svelte";

const socketEventHandlers: SocketEventHandlersType = {
    "customer.orders.updated": (data) => runtimeDataStore.setData("ordersStatus", data),
    "customer.orders.executionTimeChanged": (data) => runtimeDataStore.setData("executionTime", data),
};

const socket = io("http://192.168.100.11:3002");

new SocketApiListner(socket, socketEventHandlers);

const appStore: AppStoreType = {
    user: userStore,
    orders: ordersStore,
    branch: branchStore,
};

export const [getAppContext, setAppContext] = createContext<AppStoreType>();

export const initAppContext = () => {
    setAppContext(appStore);
};
