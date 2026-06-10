import { Module } from "@nestjs/common";
import { CustomerAuthModule } from "./auth/customer-auth.module";
import { CustomersModule } from "./customers/customers.module";
import { OrdersModule } from "./orders/orders.module";
import { CustomerNotificationsModule } from "./notifications/customer-notifications.module";

@Module({
    imports: [
        CustomerAuthModule,
        CustomersModule,
        OrdersModule,
        CustomerNotificationsModule,
    ],
})
export class ClientModule {}
