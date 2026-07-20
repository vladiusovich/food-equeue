import type { IHttpClientInterceptor } from "$lib/api/http/httpClient/IHttpClient";
import { networkState } from "$lib/stores/networkState.svelte";

export const networkReachabilityInterceptor: IHttpClientInterceptor = {
    onResponse: () => {
        networkState.setReachable();
    },
    onError: (error: unknown) => {
        if ((error as any)?.response === undefined) {
            networkState.setUnreachable();
        } else {
            networkState.setReachable();
        }
        return Promise.reject(error);
    },
};
