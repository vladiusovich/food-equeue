import { browser } from "$app/environment";

function createNetworkState() {
    let online: boolean = $state(browser ? navigator.onLine : true);
    let apiUnreachable: boolean = $state(false);

    if (browser) {
        window.addEventListener("online", () => { online = true; });
        window.addEventListener("offline", () => { online = false; });
    }

    return {
        get online() { return online; },
        get apiUnreachable() { return apiUnreachable; },

        setUnreachable() { apiUnreachable = true; },
        setReachable() { apiUnreachable = false; },
    };
}

export const networkState = createNetworkState();
