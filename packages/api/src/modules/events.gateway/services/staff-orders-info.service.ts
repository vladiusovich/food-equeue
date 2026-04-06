import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "../../client/orders/entities/order.entity";

@Injectable()
export class OrdersStaffInfoService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
    ) {}

    async getOrdersStatus(): Promise<Order[]> {
        const orders = await this.ordersRepository.find({
            relations: ["products", "customer"],
        });

        return orders;
    }
}
