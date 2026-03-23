export interface IHttpClientOptions {
    baseURL: string;
    timeout: number;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface IHttpClientRequest {
    method: HttpMethod;
    url: string;
    params?: Record<string, any>;
    data?: any;
    headers?: Record<string, string>;
    cacheTimeInSeconds?: number;
}

export interface IHttpClientResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
}

// Adapter
export interface IHttpClient {
    request<T>(request: IHttpClientRequest): Promise<IHttpClientResponse<T>>;
}
