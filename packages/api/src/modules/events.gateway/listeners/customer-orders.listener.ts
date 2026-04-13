import { Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { OrderCreatedEvent } from "../../client/orders/events/order-created.event";
import { CustomersGateway } from "src/modules/events.gateway/customers.gateway";
import { CustomerOrdersService } from "../services/customer-orders.service";
import { createRoute } from "../utils/rooms.routing";
import ROOMS from "../constants/rooms";

@Injectable()
export class CustomerOrdersListener {
    constructor (
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,

        @Inject(CustomersGateway)
        private eventsGateway: CustomersGateway,

        @Inject(CustomerOrdersService)
        private readonly ordersService: CustomerOrdersService,
    ) {}

    // TODO: events name as const
    @OnEvent("order.updated")
    async handleOrderUpdatedEvent (event: OrderCreatedEvent) {
        this.logger.info(`Order ${event?.id} pushed`);

        const ordersStatus = await this.ordersService.getOrdersStatus();

        this.eventsGateway.server.to(createRoute([ROOMS.BRANCH, event.branch.id])).emit("customer.orders.updated", ordersStatus);
    }

    @OnEvent("order.created")
    async handleOrderCreatedEvent (event: OrderCreatedEvent) {
        this.logger.info(`Order ${event.id} pushed`);

        const ordersStatus = await this.ordersService.getOrdersStatus();

        this.eventsGateway.server.to(createRoute([ROOMS.BRANCH, event.branch.id])).emit("customer.orders.updated", ordersStatus);
    }
}
