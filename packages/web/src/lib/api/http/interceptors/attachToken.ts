import { ACCESS_TOKEN } from "$lib/const/authConstans";
import type { IHttpClientInterceptor } from "$lib/api/http/httpClient/IHttpClient";

export const attachTokenInterceptor: IHttpClientInterceptor = {
    onRequest: (context) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            context.headers["Authorization"] = `Bearer ${token}`;
        }
    },
};