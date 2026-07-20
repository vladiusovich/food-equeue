import { PUBLIC_FOOD_SERVER_URL, PUBLIC_FOOD_SERVER_SOCKET_URL } from "$env/static/public";

export type ApiUrlType = "foodServer" | "foodServerSocket";

const apiUrls: Record<ApiUrlType, string> = {
    foodServer: PUBLIC_FOOD_SERVER_URL,
    foodServerSocket: PUBLIC_FOOD_SERVER_SOCKET_URL,
};

export default apiUrls;