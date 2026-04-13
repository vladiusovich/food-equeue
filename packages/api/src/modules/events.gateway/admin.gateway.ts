import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { Inject } from "@nestjs/common";

// TODO: add guerd
@WebSocketGateway({
    cors: {
        origin: "*",
    },
    namespace: "admin",
})
export class AdminGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    constructor (
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
    ) {}

    afterInit (server: Server) {
        this.logger.verbose("WS Gateway initialized:", server);
    }

    handleConnection (client: Socket): void {
        this.logger.verbose(`Admin connected: ${client.id}`);
    }

    handleDisconnect (client: Socket): void {
        this.logger.verbose(`Admin disconnected: ${client.id}`);
    }
}
