import { Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { Order } from "../../shared";
import { ORDER_EVENTS } from "../../shared/events/order.events";
import { CustomersGateway } from "./customers.gateway";
import { CustomerOrdersService } from "./customer-orders.service";
import { createRoute } from "./utils/rooms.routing";
import { ROOMS, CUSTOMER_EVENTS } from "./constants";

@Injectable()
export class CustomerOrdersListener {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,

        private readonly eventsGateway: CustomersGateway,
        private readonly ordersService: CustomerOrdersService,
    ) {}

    @OnEvent(ORDER_EVENTS.UPDATED)
    async handleOrderUpdated(event: Order): Promise<void> {
        this.logger.info(`Order ${event?.id} updated — pushing to customers`);
        const ordersStatus = await this.ordersService.getOrdersStatus();
        this.eventsGateway.server
            .to(createRoute([ROOMS.BRANCH, event.branch.id]))
            .emit(CUSTOMER_EVENTS.ORDERS_UPDATED, ordersStatus);
    }

    @OnEvent(ORDER_EVENTS.CREATED)
    async handleOrderCreated(event: Order): Promise<void> {
        this.logger.info(`Order ${event.id} created — pushing to customers`);
        const ordersStatus = await this.ordersService.getOrdersStatus();
        this.eventsGateway.server
            .to(createRoute([ROOMS.BRANCH, event.branch.id]))
            .emit(CUSTOMER_EVENTS.ORDERS_UPDATED, ordersStatus);
    }
}
