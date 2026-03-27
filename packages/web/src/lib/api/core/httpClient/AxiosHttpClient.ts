import axios, { type AxiosInstance } from "axios";
import type { IHttpClient, IHttpClientOptions, IHttpClientRequest, IHttpClientResponse } from "./IHttpClient";
import { attachToken } from "./interceptors/attachToken";
import { setupCache, type AxiosCacheInstance } from "axios-cache-interceptor";
import { unauthorizeRedirect } from "./interceptors/unauthorizeRedirect";

class AxiosHttpClient implements IHttpClient {
    private instance: AxiosCacheInstance;

    constructor (options: IHttpClientOptions) {
        const axiosInstance = axios.create(options);
        /*
			cache.methods
			Default: ["get", "head"]
		*/
        this.instance = setupCache(axiosInstance, {
            enabled: false // no cache by default
        });

        this.instance.interceptors.request.use(attachToken);
        this.instance.interceptors.response.use(undefined, unauthorizeRedirect);
    }

    public async request<T> (config: IHttpClientRequest): Promise<IHttpClientResponse<T>> {
        const response = await this.instance.request<T>({
            ...config,
            cache: config.cacheTimeInSeconds ? { enabled: true, ttl: config.cacheTimeInSeconds * 1000 } : false
        });

        return response;
    }
}

export default AxiosHttpClient;
