import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdersStaffController } from "./staff-orders.controller";
import { OrdersStaffService } from "./staff-orders.service";
import { Order, Customer, Product, Branch } from "src/modules/shared";

@Module({
    imports: [
        TypeOrmModule.forFeature([Order, Product, Customer, Branch]),
    ],
    controllers: [OrdersStaffController],
    providers: [OrdersStaffService],
    exports: [OrdersStaffService],
})
export class OrdersStaffModule {}
