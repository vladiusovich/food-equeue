import { Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { Cron, CronExpression } from "@nestjs/schedule";
import { OrderExecutionCalculatorService } from "./order-execution-calculator-service";
import { CustomersGateway } from "../events.gateway/customers.gateway";

@Injectable()
export class TaskCalculatorService {
    constructor(
        @Inject(OrderExecutionCalculatorService)
        private readonly orderExecutionCalculatorService: OrderExecutionCalculatorService,

        @Inject(CustomersGateway)
        private eventsGateway: CustomersGateway,
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
    ) {}

    // TODO: reimplement
    @Cron(CronExpression.EVERY_10_SECONDS)
    async calculateExecutionTime() {
        const executionTime = await this.orderExecutionCalculatorService.getAverage();

        this.eventsGateway.server.emit("customer.orders.executionTimeChanged", executionTime);
    }
}
