import axios, { type AxiosInstance } from "axios";
import type {
    IHttpClient,
    IHttpClientOptions,
    IHttpClientRequest,
    IHttpClientResponse,
} from "./IHttpClient";
import { attachToken } from "./interceptors/attachToken";

class AxiosHttpClient implements IHttpClient {
    private instance: AxiosInstance;

    constructor(options: IHttpClientOptions) {
        this.instance = axios.create(options);
        this.instance.interceptors.request.use(attachToken);
    }

    public async request<T>(
        config: IHttpClientRequest,
    ): Promise<IHttpClientResponse<T>> {
        const response = await this.instance.request<T>(config);
        return response;
    }
}

export default AxiosHttpClient;
