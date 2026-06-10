import { Controller, Get, Inject, ParseIntPipe, Query, UseGuards } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { OrdersStatus } from "src/modules/shared";
import CustomerOrderStatus from "./interfaces/customerOrderStatus";
import { AccessTokenGuard } from "../auth/guards/accessToken.guard";

@Controller("orders")
@UseGuards(AccessTokenGuard)
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) {}

    @Get("")
    async getOrdersStatus(): Promise<OrdersStatus> {
        return this.ordersService.getOrdersStatus();
    }

    @Get("customer")
    async getCustomerOrderStatus(@Query("id", ParseIntPipe) id: number): Promise<CustomerOrderStatus | null> {
        return await this.ordersService.getCustomerOrderStatus(id);
    }
}
