import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order, Product, Customer } from "src/modules/shared";
import { StaffProductsController } from "./staff-products.controller";
import { StaffProductsService } from "./staff-products.service";

@Module({
    imports: [
        // EventsGatewayModule,
        TypeOrmModule.forFeature([Order, Product, Customer]),
    ],
    controllers: [StaffProductsController],
    providers: [StaffProductsService],
})
export class StaffProductsModule {}
