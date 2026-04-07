export const customerEvents = [
    "customer.order.created",
    "customer.order.updated",
    "customer.orders.updated",
    "customer.orders.executionTimeChanged",
    "customer.user.join",
] as const;

export type CustomerEventType = typeof customerEvents[number];
