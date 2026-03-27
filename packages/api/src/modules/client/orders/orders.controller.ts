import { Controller, Get, Inject, ParseIntPipe, Query, UseGuards } from "@nestjs/common";
import { OrdersService as OrdersService } from "src/modules/client/orders/orders.service";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import OrdersStatus from "./interfaces/ordersStatus";
import CustomerOrderStatus from "./interfaces/customerOrderStatus";
import { AccessTokenGuard } from "../customer-auth/guards/accessToken.guard";

@Controller("orders")
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) { }

    @Get("")
    async getOrdersStatus(): Promise<OrdersStatus> {
        return this.ordersService.getOrdersStatus();
    }

    @Get("customer")
    @UseGuards(AccessTokenGuard)
    async getCustomerOrderStatus(@Query("id", ParseIntPipe) id: number): Promise<CustomerOrderStatus | null> {
        return await this.ordersService.getCustomerOrderStatus(id);
    }
}
