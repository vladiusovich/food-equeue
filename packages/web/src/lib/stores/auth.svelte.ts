import foodServiceApi from "$lib/api/requests";
import type FoodServiceApi from "$lib/api/requests/FoodServiceApi";
import { browser } from "$app/environment";
import { ORDER_HASH, ACCESS_TOKEN, REFRESH_TOKEN } from "$lib/const/authConstans";

export class AuthStore {
    private foodServiceApi: FoodServiceApi;
    private accessToken: string | null = $state(null);
    public hash: string = $state("");
    public isLoggedIn: boolean = $derived(!!this.accessToken);

    constructor(foodServiceApi: FoodServiceApi) {
        this.foodServiceApi = foodServiceApi;

        if (browser) {
            this.hash = localStorage.getItem(ORDER_HASH) ?? "";
            this.accessToken = localStorage.getItem(ACCESS_TOKEN);
        }
    }

    public async login(hash: string): Promise<void> {
        try {
            const info = await this.foodServiceApi.fetchCustomerIdentify({ hash });

            if (info?.access_token) {
                localStorage.setItem(ACCESS_TOKEN, info.access_token);
                localStorage.setItem(ORDER_HASH, hash);

                this.accessToken = info.access_token;
                this.hash = hash;
            }
        } catch (error) {
            // console.error("Login failed:", error);
        }
    }

    public logout(): void {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        localStorage.removeItem(ORDER_HASH);

        this.accessToken = null;
        this.hash = "";
    }
}

export default AuthStore;
