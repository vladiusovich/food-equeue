import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { QrCodeService } from "./qr-code.service";
import { Order } from "../../client/orders/entities/order.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { generateUrl } from "./utility/url.generator";
import { ConfigService } from "@nestjs/config";
import QrInfo from "./models/qr-info";

@Injectable()
export class QrCodeOrderService {
    constructor(
        @Inject(QrCodeService)
        private readonly qrCodeService: QrCodeService,
        @Inject(ConfigService)
        private readonly configService: ConfigService,
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
    ) {}

    async generateQrCode(id: number): Promise<QrInfo> {
        const order = await this.ordersRepository.findOne({
            where: { id },
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        } else if (!order?.hash) {
            throw new NotFoundException(`Order hash for order ${id} not found`);
        }

        const url = generateUrl(this.getClientAppAddress(), order.hash);

        const isDev = this.configService.get<boolean>("IS_DEV", false);

        return {
            url: isDev ? url : undefined,
            qrCode: await this.qrCodeService.generateQrCode(url),
        };
    }

    // TODO: dynaic host resolver
    private getClientAppAddress(): string {
        const isDev = this.configService.get<boolean>("IS_DEV", false);
        const isLocalDeploy = this.configService.get<boolean>("IS_LOCAL_NETWORK_DEPLOY", false);

        if (isDev && isLocalDeploy) {
            return this.configService.get<string>("CLIENT_APP_LOCAL_NETWORK_URL")!;
        }

        const clientUrl = this.configService.get<string>("CLIENT_APP_URL");

        if (!clientUrl) {
            throw new Error("CLIENT_APP_URL is not defined.");
        }

        return clientUrl;
    }
}
