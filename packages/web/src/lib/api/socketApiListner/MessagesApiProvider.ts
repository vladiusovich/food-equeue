import type { CustomerEventType } from "$lib/types/events/CustomerEventType";
import { Socket } from "socket.io-client";

type EventHandlerType = (data: any) => void;

export type SocketEventHandlersType = Partial<Record<CustomerEventType, EventHandlerType>>;

class MessagesApiProvider {
    constructor (private socket: Socket, private handlers: SocketEventHandlersType) {
        this.initSocket();
    }

    public async join<T> (payload: T) {
        const res = await this.sendMessage("customer.user.join", payload);
        return res;
    }

    public sendMessage<TPayload, TResponse = void> (event: CustomerEventType, payload: TPayload): Promise<TResponse> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Timeout: no response for event "${event}"`));
            }, 5000);

            this.socket.emit(event, payload, (response: TResponse | { error: string }) => {
                clearTimeout(timeout);

                if (response && typeof response === "object" && "error" in response) {
                    reject(new Error(response.error));
                } else {
                    resolve(response as TResponse);
                }
            });
        });
    }

    public get isConnected () {
        return this.socket.connected;
    }

    private initSocket () {
        this.socket.on("connect", this.handleConnect);
        this.socket.on("disconnect", this.handleDisconnect);
        this.initEventHandlers();
    }

    private initEventHandlers () {
        const keys = Object.keys(this.handlers) as CustomerEventType[];

        keys.forEach(event => {
            this.socket.on(event, (data: any) => this.handlers[event]?.(data));
        });
    }

    private handleConnect = () => {
        console.log("Connected");
    };

    private handleDisconnect = () => {
        this.socket.offAny();
        console.debug("Disconnected");
    };
}

export default MessagesApiProvider;
