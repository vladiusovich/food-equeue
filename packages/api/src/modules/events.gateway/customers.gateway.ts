import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { Inject } from "@nestjs/common";
import ROOMS from "./constants/rooms";
import { createRoute } from "./utils/rooms.routing";
import CUSTOMER_EVENTS from "./constants/customer.events";

@WebSocketGateway({
    cors: {
        origin: "*",
    },
    namespace: "customers",
})
export class CustomersGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    constructor (
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
    ) {}

    handleConnection (client: Socket): void {
        this.logger.info(`Client connected: ${client.id}`);
    }

    handleDisconnect (client: Socket): void {
        this.logger.info(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage(CUSTOMER_EVENTS.USER_JOIN)
    handleJoin (@MessageBody() data: { branchId: string }, @ConnectedSocket() client: Socket): string {
        this.logger.info(`Client try to join:  ${client.id}`);

        this.server.socketsJoin(createRoute([ROOMS.BRANCH, data.branchId]));

        // TODO
        return "ok";
    }
}
