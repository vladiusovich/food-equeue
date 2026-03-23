import foodServiceApi from '$lib/api/requests'
import type FoodServiceApi from '$lib/api/requests/FoodServiceApi'
import { AuthStore, authStore } from './auth.svelte'

export class UserStore {
  private foodServiceApi: FoodServiceApi
  private auth: AuthStore
  private orderInfo?: CustomerOrderInfo = $state()

  constructor (auth: AuthStore, foodServiceApi: FoodServiceApi) {
    this.auth = auth
    this.foodServiceApi = foodServiceApi
  }

  public orderId = $derived(this?.orderInfo?.orderId ?? null)
  public branchId = $derived(this?.orderInfo?.branchId ?? null)

  async fetch (): Promise<void> {
    this.orderInfo = await this.foodServiceApi.fetchCustomerOrder({
      hash: this.auth.hash ?? ''
    })
  }
}

export const userStore = new UserStore(authStore, foodServiceApi)
