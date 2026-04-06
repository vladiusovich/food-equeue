import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "src/modules/client/orders/orders.service";
import { Order } from "./entities/order.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CustomerAuthModule } from "../customer-auth/customer-auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Order]),
        CustomerAuthModule,
    ],
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [TypeOrmModule],
})
export class OrdersModule {}
