import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QrCodeService } from "./qr-code.service";
import { QrCodeOrderService } from "./qr-code.order.service";
import { QrCodeOrderController } from "./qr-code.order.controller";
import { ConfigModule } from "@nestjs/config";
import { Order } from "src/modules/shared";

@Module({
    imports: [TypeOrmModule.forFeature([Order, ConfigModule])],
    controllers: [QrCodeOrderController],
    providers: [QrCodeService, QrCodeOrderService],
})
export class QCodeModule {}
