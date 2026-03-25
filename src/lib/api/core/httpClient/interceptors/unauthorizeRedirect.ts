import { ACCESS_TOKEN, ORDER_HASH, REFRESH_TOKEN } from "$lib/const/authConstans";
import { goto } from "$app/navigation";
import type { AxiosError } from "axios";

type InterceptorFuncType = (value: any) => Promise<any>;

export const unauthorizeRedirect: InterceptorFuncType = (error: AxiosError) => {
    if (error.response?.status === 401) {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        localStorage.removeItem(ORDER_HASH);
        goto("/welcome");
    }
    return Promise.reject(error);
};
