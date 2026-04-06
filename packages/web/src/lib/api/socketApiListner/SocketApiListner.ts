import type { CustomerEventType } from "$lib/types/events/CustomerEventType";
import { Socket } from "socket.io-client";

type EventHandlerType = (data: any) => void;

export type SocketEventHandlersType = Partial<Record<CustomerEventType, EventHandlerType>>;

class SocketApiListner {
    constructor(
        private socket: Socket,
        private handlers: SocketEventHandlersType,
    ) {
        this.initSocket();
    }

    private initSocket() {
        this.socket.on("connect", this.handleConnect);
        this.socket.on("disconnect", this.handleDisconnect);
        this.initEventHandlers();
    }

    private initEventHandlers() {
        const keys = Object.keys(this.handlers) as CustomerEventType[];

        keys.forEach((event) => {
            this.socket.on(event, (data: any) => this.handlers[event]?.(data));
        });
    }

    public get isConnected() {
        return this.socket.connected;
    }

    private handleConnect = () => {
        console.debug("Connected");
    };

    private handleDisconnect = () => {
        this.socket.offAny();
        console.debug("Disconnected");
    };
}

export default SocketApiListner;
