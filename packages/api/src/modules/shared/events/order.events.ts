export const ORDER_EVENTS = {
    CREATED: "order.created",
    UPDATED: "order.updated",
} as const;

export type OrderEventKey = typeof ORDER_EVENTS[keyof typeof ORDER_EVENTS];
