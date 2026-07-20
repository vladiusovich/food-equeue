import { createContext } from "svelte";
import BranchStore from "./branch.svelte";
import type { AppStoreType } from "./types/AppStoreType";
import UserStore from "./user.svelte";
import MessagesApiProvider, { type SocketEventHandlersType } from "$lib/api/socketApiListner/MessagesApiProvider";
import { io } from "socket.io-client";
import { AuthStore } from "./auth.svelte";
import OrdersStore from "./orders.svelte";
import RuntimeDataStore from "./runtimeDataStore.svelte";
import type { RuntimeDataType } from "$lib/types/events/RuntimeDataType";
import apiUrls from "$lib/api/http/apiUrls";
import FoodServiceApi from "$lib/api/requests/FoodServiceApi";
import AxiosHttpClient from "$lib/api/http/httpClient/AxiosHttpClient";
import { attachTokenInterceptor } from "$lib/api/http/interceptors/attachToken";
import { unauthorizeRedirect } from "$lib/api/http/interceptors/unauthorizeRedirect";
import { networkReachabilityInterceptor } from "$lib/api/http/interceptors/networkReachability";

export const [getAppContext, setAppContext] = createContext<AppStoreType>();

export const initAppContext = () => {
    const httpClient = new AxiosHttpClient({
        baseURL: apiUrls.foodServer,
        timeout: 10000,
        interceptors: [
            attachTokenInterceptor,
            unauthorizeRedirect,
            networkReachabilityInterceptor,
        ],
    });

    const foodServiceApi = new FoodServiceApi(httpClient);

    const runtimeDataStore = new RuntimeDataStore<RuntimeDataType>();

    const socketEventHandlers: SocketEventHandlersType = {
        "customer.orders.updated": data => runtimeDataStore.setData("ordersStatus", data),
        "customer.orders.executionTimeChanged": data => runtimeDataStore.setData("executionTime", data),
    };

    const messagesApiProvider = new MessagesApiProvider(io(apiUrls.foodServerSocket), socketEventHandlers);

    const authStore = new AuthStore(foodServiceApi);
    const userStore = new UserStore(authStore, foodServiceApi, messagesApiProvider);
    const branchStore = new BranchStore(userStore, foodServiceApi);
    const ordersStore = new OrdersStore(runtimeDataStore, userStore, foodServiceApi);

    const appStore: AppStoreType = {
        user: userStore,
        orders: ordersStore,
        branch: branchStore,
    };

    setAppContext(appStore);

    return appStore;
};
