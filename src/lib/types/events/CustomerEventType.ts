// TODO: Add more events as needed
export const customerEvents = [
    "customer.order.created",
    "customer.order.updated",
    "customer.orders.updated",
    "customer.orders.executionTimeChanged",
] as const;

export type CustomerEventType = (typeof customerEvents)[number];
