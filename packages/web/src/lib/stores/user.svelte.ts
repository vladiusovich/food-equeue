import type FoodServiceApi from "$lib/api/requests/FoodServiceApi";
import type MessagesApiProvider from "$lib/api/socketApiListner/MessagesApiProvider";
import { AuthStore } from "./auth.svelte";

export class UserStore {
    private foodServiceApi: FoodServiceApi;
    private orderInfo = $state<CustomerOrderInfo | undefined>(undefined);
    private messagesApiProvider: MessagesApiProvider;

    public orderId = $derived(this.orderInfo?.orderId);
    public branchId = $derived(this.orderInfo?.branchId);
    public auth: AuthStore;

    constructor (auth: AuthStore, foodServiceApi: FoodServiceApi, messagesApiProvider: MessagesApiProvider) {
        this.auth = auth;
        this.foodServiceApi = foodServiceApi;
        this.messagesApiProvider = messagesApiProvider;
    }

    async fetch (): Promise<void> {
        this.orderInfo = await this.foodServiceApi.fetchCustomerOrder({
            hash: this.auth.hash ?? "",
        });

        // TODO
        if (this.orderInfo.branchId) {
            this.messagesApiProvider.join({ branchId: this.orderInfo?.branchId });
        }
    }
}

export default UserStore;
