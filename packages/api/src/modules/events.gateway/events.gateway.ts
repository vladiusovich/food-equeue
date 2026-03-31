import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { Inject } from "@nestjs/common";
import CustomerEventType from "./events/customer.events";
import StaffEventType from "./events/staff.events";

@WebSocketGateway({
    cors: {
        origin: "*",
    },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor (
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
    ) {}

    afterInit (server: Server) {
        this.logger.verbose("WS Gateway initialized:", server);
    }

    handleConnection (client: Socket): void {
        this.logger.verbose(`Client connected: ${client.id}`);
    }

    handleDisconnect (client: Socket): void {
        this.logger.verbose(`Client disconnected: ${client.id}`);
    }

    public emitCustomer (event: CustomerEventType, data: any) {
        this.server.emit(event, data);
    }

    public emitStaff (event: StaffEventType, data: any) {
        this.server.emit(event, data);
    }
}

//   client.emit('event', data);

//     // ─── Всем в комнате (включая отправителя) ──────
//     this.server.to('room-name').emit('event', data);

//     // ─── Всем в комнате (кроме отправителя) ────────
//     client.to('room-name').emit('event', data);

//     // ─── Всем подключённым (весь namespace) ────────
//     this.server.emit('event', data);

//     // ─── Всем кроме отправителя (весь namespace) ───
//     client.broadcast.emit('event', data);

//     // ─── В несколько комнат сразу ──────────────────
//     this.server.to('room-a').to('room-b').emit('event', data);
//     // Если сокет в обеих комнатах — получит ОДНО сообщение, не два

//     // ─── Всем кроме определённой комнаты ───────────
//     this.server.except('room-muted').emit('event', data);

//     // ─── Комбинация: в room-a, но не в room-b ─────
//     this.server.to('room-a').except('room-b').emit('event', data);

//     // ─── Конкретному юзеру (через персональную room)
//     this.server.to(`user:${userId}`).emit('event', data);

//     // ─── Конкретному сокету по id ──────────────────
//     this.server.to(socketId).emit('event', data);
