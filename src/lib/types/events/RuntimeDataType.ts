import type OrdersStatus from "../OrdersStatus";

export interface RuntimeDataType {
    ordersStatus?: OrdersStatus;
    executionTime?: number;
}