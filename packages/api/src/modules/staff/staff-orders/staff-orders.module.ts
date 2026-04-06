import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdersStaffController } from "./staff-orders.controller";
import { OrdersStaffInfoService } from "../../events.gateway/services/staff-orders-info.service";
import { OrdersStaffService } from "./staff-orders.service";
import { Order } from "../../client/orders/entities/order.entity";
import { Product } from "../staff-products/entities/product.entity";
import { Customer } from "../../client/customers/entities/customer.entity";
import { Branch } from "../../branches/entities/branch.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Order, Product, Customer, Branch]),
    ],
    controllers: [OrdersStaffController],
    providers: [OrdersStaffService, OrdersStaffInfoService],
})
export class OrdersStaffModule {}
