import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "../../shared";
import { AdminGateway } from "./admin.gateway";
import { StaffOrdersInfoService } from "./staff-orders-info.service";
import { StaffOrdersListener } from "./staff-orders.listener";

@Module({
    imports: [TypeOrmModule.forFeature([Order])],
    providers: [AdminGateway, StaffOrdersInfoService, StaffOrdersListener],
    exports: [AdminGateway],
})
export class StaffNotificationsModule {}
