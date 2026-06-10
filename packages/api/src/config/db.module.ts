import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order, Customer, Product, Branch } from "../modules/shared";

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "sqlite",
            database: "./db/db.sqlite",
            entities: [Customer, Order, Product, Branch],
            //shouldn't be used in production - otherwise you can lose production data
            synchronize: true,
        }),
    ],
})
export class SqLiteDbModule {}
