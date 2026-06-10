import { Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { Order } from "../../shared";
import { ORDER_EVENTS } from "../../shared/events/order.events";
import { AdminGateway } from "./admin.gateway";
import { StaffOrdersInfoService } from "./staff-orders-info.service";
import { createRoute, ROOMS } from "./utils/rooms.routing";
import { STAFF_EVENTS } from "./constants";

@Injectable()
export class StaffOrdersListener {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,

        private readonly eventsGateway: AdminGateway,
        private readonly ordersInfoService: StaffOrdersInfoService,
    ) {}

    @OnEvent(ORDER_EVENTS.UPDATED)
    async handleOrderUpdated(event: Order): Promise<void> {
        this.logger.info(`Order ${event.id} updated — pushing to staff`);
        const ordersStatus = await this.ordersInfoService.getOrdersStatus();
        this.eventsGateway.server
            .to(createRoute([ROOMS.BRANCH, event.branch.id]))
            .emit(STAFF_EVENTS.ORDERS_UPDATED, ordersStatus);
    }

    @OnEvent(ORDER_EVENTS.CREATED)
    async handleOrderCreated(event: Order): Promise<void> {
        this.logger.info(`Order ${event.id} created — pushing to staff`);
        const ordersStatus = await this.ordersInfoService.getOrdersStatus();
        this.eventsGateway.server
            .to(createRoute([ROOMS.BRANCH, event.branch.id]))
            .emit(STAFF_EVENTS.ORDERS_UPDATED, ordersStatus);
    }
}
