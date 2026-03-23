import type { IdentityCustomerInfo } from '$lib/types/customer/IdentityCustomerInfo'
import apiUrls from '../core/apiUrls'
import HttpClient from '../core/httpClient/AxiosHttpClient'
import type { IHttpClient } from '../core/httpClient/IHttpClient'

class FoodServiceApi {
  private httpClient: IHttpClient = new HttpClient({
    baseURL: apiUrls.foodServer,
    timeout: 10000
  })

  public async fetchBranches (request: { id: string }) {
    const d = await this.httpClient.request<Branch>({
      method: 'GET',
      url: '/branches',
      cacheTimeInSeconds: 60,
      params: request,
    })

    return d.data
  }

  public async fetchCustomerOrder (request: { hash: string }) {
    const d = await this.httpClient.request<CustomerOrderInfo>({
      method: 'POST',
      url: '/customer/order',
      data: request
    })

    return d.data
  }

  public async fetchCustomerIdenitify (request: {
    hash: string
  }): Promise<IdentityCustomerInfo> {
    const d = await this.httpClient.request<IdentityCustomerInfo>({
      method: 'POST',
      url: '/customer/auth/idenitify',
      data: request
    })

    return d.data
  }

  public async fetchOrders () {
    const d = await this.httpClient.request<object>({
      method: 'GET',
      url: '/orders'
    })

    return d.data
  }
}

export default FoodServiceApi
