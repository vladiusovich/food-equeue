import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { Order } from "src/modules/shared";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CustomerAuthModule } from "../auth/customer-auth.module";

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
