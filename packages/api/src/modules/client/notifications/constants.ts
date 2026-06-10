export const ROOMS = {
    BRANCH: "branch",
    USER: "user",
} as const;

export const CUSTOMER_EVENTS = {
    USER_JOIN: "customer.user.join",
    ORDERS_UPDATED: "customer.orders.updated",
    ORDERS_EXECUTION_TIME_CHANGED: "customer.orders.executionTimeChanged",
} as const;
