import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { Order, OrdersStatus } from "../../shared";

const getId = (order: Order): string => order.id.toString();

@Injectable()
export class CustomerOrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly ordersRepository: Repository<Order>,

        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
    ) {}

    async getOrdersStatus(): Promise<OrdersStatus> {
        const orders = await this.ordersRepository.findBy({
            status: In(["pending", "inProgress", "ready"]),
        });

        return {
            inProgress: orders.filter((o) => o.status === "inProgress" || o.status === "pending").map(getId),
            ready: orders.filter((o) => o.status === "ready").map(getId),
        };
    }
}
