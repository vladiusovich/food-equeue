import { goto } from "$app/navigation";
import type { IHttpClientInterceptor } from "$lib/api/http/httpClient/IHttpClient";
import { tokenState } from "$lib/stores/tokenState.svelte";

export const unauthorizeRedirect: IHttpClientInterceptor = {
    onError: (error: unknown) => {
        if ((error as any)?.response?.status === 401) {
            tokenState.clear();
            goto("/");
        }
        return Promise.reject(error);
    },
};