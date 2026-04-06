import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { Order } from "src/modules/client/orders/entities/order.entity";
import OrdersStatus from "src/modules/share/types/OrdersStatus";

const getId = (order: Order): string => order.id.toString();

@Injectable()
export class CustomerOrdersService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,

        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
    ) {}

    async getOrdersStatus(): Promise<OrdersStatus> {
        const orders = await this.ordersRepository.findBy({
            status: In(["pending", "inProgress", "ready"]),
        });

        return {
            inProgress: orders.filter((order) => order.status === "inProgress" || order.status === "pending").map(getId),
            ready: orders.filter((order) => order.status === "ready").map(getId),
        };
    }
}
