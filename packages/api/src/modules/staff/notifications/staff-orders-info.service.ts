import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "../../shared";

@Injectable()
export class StaffOrdersInfoService {
    constructor(
        @InjectRepository(Order)
        private readonly ordersRepository: Repository<Order>,
    ) {}

    async getOrdersStatus(): Promise<Order[]> {
        return this.ordersRepository.find({
            relations: ["products", "customer"],
        });
    }
}
