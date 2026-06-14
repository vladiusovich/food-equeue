import type FoodServiceApi from "$lib/api/requests/FoodServiceApi";
import { tokenState } from "./tokenState.svelte";

export class AuthStore {
    private foodServiceApi: FoodServiceApi;
    public isLoggedIn: boolean = $derived(!!tokenState.accessToken);

    get hash() { return tokenState.hash; }

    constructor (foodServiceApi: FoodServiceApi) {
        this.foodServiceApi = foodServiceApi;
    }

    public async login (hash: string): Promise<void> {
        try {
            const info = await this.foodServiceApi.fetchCustomerIdentify({ hash });

            if (info?.access_token) {
                tokenState.set(info.access_token, hash);
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
    }

    public logout (): void {
        tokenState.clear();
    }
}

export default AuthStore;
