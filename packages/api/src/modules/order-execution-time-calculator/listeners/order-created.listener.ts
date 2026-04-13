import { Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { OrderExecutionCalculatorService } from "../order-execution-calculator-service";
import { CustomersGateway } from "../../events.gateway/customers.gateway";

@Injectable()
export class OrderCreatedListener {
    constructor (
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,

        @Inject(CustomersGateway)
        private eventsGateway: CustomersGateway,

        @Inject(OrderExecutionCalculatorService)
        private readonly orderExecutionCalculatorService: OrderExecutionCalculatorService,
    ) {}

    // TODO: reimplement
    @OnEvent("order.updated")
    async handleOrderCreatedEvent () {
        this.logger.info(`Calculate order execution time`);

        const expirationTime = await this.orderExecutionCalculatorService.getAverage();

        this.eventsGateway.server.emit("customer.orders.executionTimeChanged", expirationTime);
    }
}
