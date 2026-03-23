import type { OrderProgressItem } from "./OrderProgressItem";

export default interface OrdersProgressStatus {
    inProgress: OrderProgressItem[];

    ready: OrderProgressItem[];
}
