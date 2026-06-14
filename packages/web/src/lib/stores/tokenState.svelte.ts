import { browser } from "$app/environment";
import { ACCESS_TOKEN, REFRESH_TOKEN, ORDER_HASH } from "$lib/const/authConstans";

function createTokenState() {
    let accessToken: string | null = $state(
        browser ? localStorage.getItem(ACCESS_TOKEN) : null
    );
    let hash: string = $state(
        browser ? (localStorage.getItem(ORDER_HASH) ?? "") : ""
    );

    return {
        get accessToken() { return accessToken; },
        get hash() { return hash; },

        set(token: string, orderHash: string) {
            localStorage.setItem(ACCESS_TOKEN, token);
            localStorage.setItem(ORDER_HASH, orderHash);
            accessToken = token;
            hash = orderHash;
        },

        clear() {
            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(REFRESH_TOKEN);
            localStorage.removeItem(ORDER_HASH);
            accessToken = null;
            hash = "";
        },
    };
}

export const tokenState = createTokenState();
