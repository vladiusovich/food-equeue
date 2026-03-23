import type { RuntimeDataType } from '$lib/types/events/RuntimeDataType'
import type OrdersProgressStatus from '$lib/types/OrdersProgressStatus'
import {
  runtimeDataStore,
  type RuntimeDataStore
} from './runtimeDataStore.svelte'
import { userStore, type UserStore } from './user.svelte'

type OrderStateType = {
  id: string
  isCurrent: boolean
}

const isCurrentUserOrder = (
  orderId: string | number,
  userOrderId: string | number
) => orderId === userOrderId

const mapOrders = (orders: string[], userOrderId: string): OrderStateType[] => {
  return orders.map(order => ({
    id: order,
    isCurrent: isCurrentUserOrder(order, userOrderId)
  }))
}

const sortForBoard = (a: OrderStateType, b: OrderStateType) => {
  if (a.isCurrent && !b.isCurrent) {
    return -1
  }

  if (!a.isCurrent && b.isCurrent) {
    return 1
  }

  return parseInt(b.id) - parseInt(a.id)
}

export class OrdersStore {
  public userStore: UserStore

  constructor (
    private dataRepository: RuntimeDataStore<RuntimeDataType>,
    userStore: UserStore
  ) {
    this.userStore = userStore
  }

  public ordersProgress = $derived.by(() => {
    const ordersStatus = this.dataRepository.data.ordersStatus
    const userOrderId = this.userStore.orderId?.toString() ?? ''

    const inProgress = ordersStatus?.inProgress ?? []
    const ready = ordersStatus?.ready ?? []

    return {
      inProgress: mapOrders(inProgress, userOrderId).sort(sortForBoard),
      ready: mapOrders(ready, userOrderId).sort(sortForBoard)
    }
  })
}

export const ordersStore = new OrdersStore(runtimeDataStore, userStore)
