import foodServiceApi from '$lib/api/requests'
import type FoodServiceApi from '$lib/api/requests/FoodServiceApi'
import { userStore, type UserStore } from './user.svelte'

export class BranchStore {
  public info?: Branch = $state()
  public loading = $state(false)
  private userStore: UserStore
  private foodServiceApi: FoodServiceApi

  constructor (userStore: UserStore, foodServiceApi: FoodServiceApi) {
    this.userStore = userStore
    this.foodServiceApi = foodServiceApi
  }

  async fetch (): Promise<void> {
    this.loading = true
    await this.userStore.fetch()

    this.info = await this.foodServiceApi.fetchBranches({
      id: `${this.userStore?.branchId ?? ''}`
    })

    this.loading = false
  }
}

export const branchStore = new BranchStore(userStore, foodServiceApi)
