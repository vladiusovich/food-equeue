import { ACCESS_TOKEN } from "$lib/const/authConstans";

export const attachToken = (value: any): Promise<any> => {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (token) {
        value.headers["Authorization"] = `Bearer ${token}`;
    }

    return value;
};
