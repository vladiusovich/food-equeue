import type FoodServiceApi from "$lib/api/requests/FoodServiceApi";
import { type UserStore } from "./user.svelte";

export class BranchStore {
    public info = $state<Branch | undefined>(undefined);
    public loading = $state(false);
    private userStore: UserStore;
    private foodServiceApi: FoodServiceApi;

    constructor (userStore: UserStore, foodServiceApi: FoodServiceApi, ) {
        this.userStore = userStore;
        this.foodServiceApi = foodServiceApi;
    }

    async fetch (): Promise<void> {
        this.loading = true;
        await this.userStore.fetch();

        this.info = await this.foodServiceApi.fetchBranches({
            id: `${this.userStore?.branchId ?? ""}`,
        });

        this.loading = false;
    }
}

export default BranchStore;
