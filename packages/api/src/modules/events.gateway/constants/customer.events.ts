const CUSTOMER_EVENTS = {
    USER_JOIN: "customer.user.join",
    ORDER_CREATED: "customer.order.created",
    ORDER_UPDATED: "customer.order.updated",
    ORDERS_UPDATED: "customer.orders.updated",
    ORDERS_EXECUTIONTIMECHANGED: "customer.orders.executionTimeChanged",
} as const;

export default CUSTOMER_EVENTS;
