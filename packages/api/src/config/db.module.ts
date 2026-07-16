import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order, Customer, Product, Branch } from "../modules/shared";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: "postgres",
                host: configService.get<string>("DB_HOST", "localhost"),
                port: configService.get<number>("DB_PORT", 5432),
                username: configService.get<string>("DB_USER"),
                password: configService.get<string>("DB_PASSWORD"),
                database: configService.get<string>("DB_NAME"),
                entities: [Customer, Order, Product, Branch],
                //shouldn't be used in production - otherwise you can lose production data
                synchronize: true,
            }),
        }),
    ],
})
export class DbModule {}
