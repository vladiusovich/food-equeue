import { Module } from "@nestjs/common";
import { SeederService } from "./seeder.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order, Customer, Product, Branch } from "src/modules/shared";

@Module({
    imports: [TypeOrmModule.forFeature([Customer, Order, Product, Branch])],
    providers: [SeederService],
})
export class SeederModule {}
