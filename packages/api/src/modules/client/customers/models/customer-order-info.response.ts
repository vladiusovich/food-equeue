interface CustomerOrderInfoResponse {
    orderId: number;
    branchId: number;
    status: string;
}

export interface IdentifyCustomerOrderResponse {
    access_token: string;
    // refresh_token: string;
}

export default CustomerOrderInfoResponse;
