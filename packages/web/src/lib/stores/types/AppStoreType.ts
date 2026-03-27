import type { BranchStore } from "../branch.svelte";
import type { OrdersStore } from "../orders.svelte";
import type { UserStore } from "../user.svelte";

export interface AppStoreType {
    user: UserStore;

    branch: BranchStore;

    orders: OrdersStore;
}
