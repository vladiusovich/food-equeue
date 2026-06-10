import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "../../shared";
import { CustomersGateway } from "./customers.gateway";
import { CustomerOrdersService } from "./customer-orders.service";
import { CustomerOrdersListener } from "./customer-orders.listener";

@Module({
    imports: [TypeOrmModule.forFeature([Order])],
    providers: [CustomersGateway, CustomerOrdersService, CustomerOrdersListener],
    exports: [CustomersGateway],
})
export class CustomerNotificationsModule {}
