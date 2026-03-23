import foodServiceApi from "$lib/api/requests";
import type FoodServiceApi from "$lib/api/requests/FoodServiceApi";
import { browser } from "$app/environment";
import { ACCESS_TOKEN } from "$lib/const/authConstans";

export class AuthStore {
    public hash = $derived("");
    public isLoggedIn = $derived(!!this.accessToken);
    private foodServiceApi: FoodServiceApi;
    private accessToken?: string | null = $state("");

    constructor(foodServiceApi: FoodServiceApi) {
        this.foodServiceApi = foodServiceApi;

        if (browser) {
            this.hash = localStorage.getItem("hash") ?? "";
            this.accessToken = localStorage.getItem(ACCESS_TOKEN);
        }
    }

    public async login(hash: string): Promise<void> {
        try {
            const info = await this.foodServiceApi.fetchCustomerIdenitify({
                hash,
            });

            if (info) {
                localStorage.setItem(ACCESS_TOKEN, info.access_token!);
                localStorage.setItem("hash", hash);

                this.hash = hash;
                this.accessToken = info.access_token;
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
    }

    // public hash = $derived(localStorage.getItem('hash'))

    public logout(): void {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem("hash");
        this.accessToken = null;
    }
}

export const authStore = new AuthStore(foodServiceApi);
