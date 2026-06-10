import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderExecutionCalculatorService } from "./order-execution-calculator-service";
import { TaskCalculatorService } from "./task-calculator-service";
import { Order } from "../../shared";
import { CustomerNotificationsModule } from "../../client/notifications/customer-notifications.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Order]),
        CustomerNotificationsModule,
    ],
    providers: [OrderExecutionCalculatorService, TaskCalculatorService],
})
export class OrderExecutionCalculatorModule {}
