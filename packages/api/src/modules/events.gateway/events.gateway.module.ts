import { Module } from "@nestjs/common";
import { CustomersGateway } from "./customers.gateway";
import { StaffOrdersListener } from "./listeners/staff-orders.listener";
import { OrdersStaffInfoService } from "./services/staff-orders-info.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "../client/orders/entities/order.entity";
import { CustomerOrdersListener } from "./listeners/customer-orders.listener";
import { CustomerOrdersService } from "./services/customer-orders.service";
import { AdminGateway } from "./admin.gateway";

@Module({
    imports: [TypeOrmModule.forFeature([Order])],
    providers: [
        CustomersGateway,
        AdminGateway,
        StaffOrdersListener,
        OrdersStaffInfoService,
        CustomerOrdersListener,
        CustomerOrdersService,
    ],
    exports: [CustomersGateway],
})
export class EventsGatewayModule {}
