import { Module } from "@nestjs/common";
import { OrdersStaffModule } from "./orders/staff-orders.module";
import { StaffProductsModule } from "./products/staff-products.module";
import { QCodeModule } from "./qr-code/qr-code.generator.module";
import { StaffNotificationsModule } from "./notifications/staff-notifications.module";

@Module({
    imports: [
        OrdersStaffModule,
        StaffProductsModule,
        QCodeModule,
        StaffNotificationsModule,
    ],
})
export class StaffModule {}
