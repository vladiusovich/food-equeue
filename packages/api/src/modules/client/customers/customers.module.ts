import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "src/modules/shared";
import { CustomerOrderService } from "./customer.order.service";
import { CustomerController } from "./customer.controller";
import { AccessTokenGuard } from "../auth/guards/accessToken.guard";
import { CustomerAuthModule } from "../auth/customer-auth.module";

@Module({
    imports: [TypeOrmModule.forFeature([Order]), CustomerAuthModule],
    controllers: [CustomerController],
    providers: [CustomerOrderService, AccessTokenGuard],
})
export class CustomersModule {}
