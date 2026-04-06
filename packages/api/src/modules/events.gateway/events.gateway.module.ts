import { Module } from "@nestjs/common";
import { EventsGateway } from "./events.gateway";
import { StaffOrdersListener } from "./listeners/staff-orders.listener";
import { OrdersStaffInfoService } from "./services/staff-orders-info.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "../client/orders/entities/order.entity";
import { CustomerOrdersListener } from "./listeners/customer-orders.listener";
import { CustomerOrdersService } from "./services/customer-orders.service";

@Module({
    imports: [TypeOrmModule.forFeature([Order])],
    providers: [
        EventsGateway,
        StaffOrdersListener,
        OrdersStaffInfoService,
        CustomerOrdersListener,
        CustomerOrdersService,
    ],
    exports: [EventsGateway],
})
export class EventsGatewayModule {}
