import { Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { OrderCreatedEvent } from "../types/order-created.event";
import { OrdersStaffInfoService } from "../services/staff-orders-info.service";
import { EventsGateway } from "src/modules/events.gateway/events.gateway";

@Injectable()
export class StaffOrdersListener {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,

        @Inject(EventsGateway)
        private eventsGateway: EventsGateway,

        @Inject(OrdersStaffInfoService)
        private readonly ordersStaffInfoService: OrdersStaffInfoService,
    ) {}

    @OnEvent("order.updated")
    async handleOrderUpdatedEvent(event: OrderCreatedEvent) {
        this.logger.info(`Order.Update STAFF ${event.payload.id} pushed`);

        const ordersStatus = await this.ordersStaffInfoService.getOrdersStatus();

        this.eventsGateway.emitStaff("staff.orders.updated", ordersStatus);
    }


    @OnEvent("order.created")
    async handleOrderCreatedEvent (event: OrderCreatedEvent) {
        this.logger.info(`Order STAFF ${event.payload.id} pushed`);

        const ordersStatus = await this.ordersStaffInfoService.getOrdersStatus();

        this.eventsGateway.emitStaff("staff.orders.updated", ordersStatus);
    }
}
