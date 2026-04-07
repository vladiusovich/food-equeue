import { Module } from "@nestjs/common";
import { OrderExecutionCalculatorService } from "./order-execution-calculator-service";
import { CustomersGateway } from "../events.gateway/customers.gateway";
import { TaskCalculatorService } from "./task-calculator-service";
import { OrdersModule } from "src/modules/client/orders/orders.module";

@Module({
    imports: [OrdersModule],
    providers: [OrderExecutionCalculatorService, CustomersGateway, TaskCalculatorService],
})
export class OrderExecutionCalculatorModule {}
