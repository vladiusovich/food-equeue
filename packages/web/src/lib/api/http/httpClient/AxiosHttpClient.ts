import axios from "axios";
import type { IHttpClient, IHttpClientOptions, IHttpClientRequest, IHttpClientResponse } from "./IHttpClient";
import { setupCache, type AxiosCacheInstance } from "axios-cache-interceptor";

class AxiosHttpClient implements IHttpClient {
    private instance: AxiosCacheInstance;

    constructor(options: IHttpClientOptions) {
        const axiosInstance = axios.create(options);
        /*
			cache.methods
			Default: ["get", "head"]
		*/
        this.instance = setupCache(axiosInstance, {
            enabled: false, // no cache by default
        });

        for (const interceptor of options.interceptors ?? []) {
            if (interceptor.onRequest) {
                this.instance.interceptors.request.use(async (axiosConfig) => {
                    const context = {
                        headers: (axiosConfig.headers ?? {}) as Record<string, string>,
                    };
                    await interceptor.onRequest!(context);
                    axiosConfig.headers = context.headers as any;
                    return axiosConfig;
                });
            }

            if (interceptor.onResponse || interceptor.onError) {
                this.instance.interceptors.response.use(
                    interceptor.onResponse
                        ? (res) => {
                            interceptor.onResponse!({ data: res.data, status: res.status, statusText: res.statusText });
                            return res;
                        }
                        : undefined,
                    interceptor.onError,
                );
            }
        }
    }

    public async request<T>(config: IHttpClientRequest): Promise<IHttpClientResponse<T>> {
        const response = await this.instance.request<T>({
            ...config,
            cache: config.cacheTimeInSeconds ? { enabled: true, ttl: config.cacheTimeInSeconds * 1000 } : false,
        });

        return response;
    }
}

export default AxiosHttpClient;