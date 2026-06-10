import { Controller, Get, ParseIntPipe, Query } from "@nestjs/common";
import { QrCodeOrderService } from "./qr-code.order.service";

@Controller("staff/orders/qr-code")
export class QrCodeOrderController {
    constructor(private readonly qrCodeOrderService: QrCodeOrderService) {}

    @Get("")
    async getQrCode(@Query("orderId", ParseIntPipe) orderId: number) {
        const qrInfo = await this.qrCodeOrderService.generateQrCode(orderId);

        return `
            <div>
                <img src="${qrInfo.qrCode}" alt="QR Code" />
                <p>Order ID: ${orderId}</p>
                ${(qrInfo.url && `<p>Url: ${qrInfo.url}</p>`) || ""}
            </div>
        `;
    }
}
