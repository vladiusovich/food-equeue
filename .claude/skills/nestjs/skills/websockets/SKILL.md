---
name: websockets
description: NestJS WebSockets integration with gateways, Socket.io, event handling, and WebSocket guards/interceptors. Use when building real-time bidirectional communication features.
---

# NestJS WebSockets

## When to Use This Skill

Use this skill when:
- Building real-time chat applications
- Implementing live notifications
- Creating collaborative tools (real-time editing, whiteboards)
- Building multiplayer games
- Implementing real-time dashboards
- Adding bidirectional communication to your app

## What are WebSockets in NestJS?

WebSockets provide full-duplex communication channels over a single TCP connection. NestJS supports WebSockets through gateways, which work with Socket.io (default) or ws library.

## Installation

For Socket.io:
```bash
npm i @nestjs/websockets @nestjs/platform-socket.io
```

For ws:
```bash
npm i @nestjs/websockets @nestjs/platform-ws
```

## Basic Gateway

```typescript
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string): string {
    return `Echo: ${data}`;
  }
}
```

**Key Points:**
- `@WebSocketGateway()` - Marks class as WebSocket gateway
- `@SubscribeMessage()` - Listens for specific event
- `@WebSocketServer()` - Injects Socket.io server instance
- Return value automatically sent back to client

## Gateway Configuration

```typescript
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/events',
  path: '/socket.io/',
})
export class EventsGateway {
  // ...
}
```

**Options:**
- `port` - WebSocket server port (default: same as HTTP)
- `namespace` - Socket.io namespace
- `cors` - CORS configuration
- `path` - Path to listen on
- `transports` - Transport mechanisms (websocket, polling)

## Event Handling

```typescript
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): void {
    this.server.emit('message', data);
  }

  @SubscribeMessage('privateMessage')
  handlePrivateMessage(
    @MessageBody() data: { to: string; message: string },
    @ConnectedSocket() client: Socket,
  ): void {
    client.to(data.to).emit('privateMessage', {
      from: client.id,
      message: data.message,
    });
  }
}
```

## Multiple Responses

```typescript
import { WsResponse } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@WebSocketGateway()
export class EventsGateway {
  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: string): Observable<WsResponse<number>> {
    return interval(1000).pipe(
      map((value) => ({ event: 'events', data: value }))
    );
  }
}
```

## Asynchronous Responses

```typescript
@WebSocketGateway()
export class EventsGateway {
  @SubscribeMessage('async')
  async handleAsyncEvent(@MessageBody() data: string): Promise<string> {
    const result = await this.someAsyncOperation(data);
    return result;
  }

  @SubscribeMessage('observable')
  handleObservable(@MessageBody() data: string): Observable<WsResponse<string>> {
    return from(this.someAsyncOperation(data)).pipe(
      map((result) => ({ event: 'observable', data: result }))
    );
  }
}
```

## Lifecycle Hooks

```typescript
import {
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  afterInit(server: Server) {
    console.log('WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
}
```

## Server and Namespace

```typescript
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Namespace } from 'socket.io';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway {
  @WebSocketServer()
  server: Namespace;

  broadcastMessage(message: string) {
    this.server.emit('message', message);
  }
}

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  broadcastToNamespace(namespace: string, event: string, data: any) {
    this.server.of(namespace).emit(event, data);
  }
}
```

## WebSocket Guards

```typescript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class WsAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();

    return this.validateClient(client, data);
  }

  private validateClient(client: any, data: any): boolean {
    const token = client.handshake?.auth?.token;
    return !!token;
  }
}
```

**Using the guard:**

```typescript
import { UseGuards } from '@nestjs/common';

@WebSocketGateway()
@UseGuards(WsAuthGuard)
export class EventsGateway {
  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string): string {
    return data;
  }
}
```

## WebSocket Interceptors

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class WsLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();

    console.log(`[${client.id}] Incoming:`, data);

    return next.handle().pipe(
      tap((response) => console.log(`[${client.id}] Outgoing:`, response))
    );
  }
}
```

**Using the interceptor:**

```typescript
import { UseInterceptors } from '@nestjs/common';

@WebSocketGateway()
@UseInterceptors(WsLoggingInterceptor)
export class EventsGateway {
  // ...
}
```

## Exception Filters

```typescript
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch(WsException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    const error = exception.getError();

    client.emit('error', {
      message: error,
      timestamp: new Date().toISOString(),
    });
  }
}
```

**Using the filter:**

```typescript
import { UseFilters } from '@nestjs/common';

@WebSocketGateway()
@UseFilters(WsExceptionFilter)
export class EventsGateway {
  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string): string {
    if (!data) {
      throw new WsException('Message cannot be empty');
    }
    return data;
  }
}
```

## Rooms

```typescript
@WebSocketGateway()
export class ChatGateway {
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(room);
    this.server.to(room).emit('userJoined', {
      userId: client.id,
      room,
    });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ): void {
    client.leave(room);
    this.server.to(room).emit('userLeft', {
      userId: client.id,
      room,
    });
  }

  @SubscribeMessage('messageToRoom')
  handleRoomMessage(
    @MessageBody() data: { room: string; message: string },
    @ConnectedSocket() client: Socket,
  ): void {
    this.server.to(data.room).emit('roomMessage', {
      from: client.id,
      message: data.message,
    });
  }
}
```

## Broadcasting

```typescript
@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  broadcastToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }

  broadcastToAllExcept(clientId: string, event: string, data: any) {
    this.server.except(clientId).emit(event, data);
  }
}
```

## Using ws Library

```typescript
import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { WebSocket } from 'ws';

@WebSocketGateway({ transports: ['websocket'] })
export class EventsGateway {
  @SubscribeMessage('message')
  handleMessage(client: WebSocket, data: string): void {
    client.send(JSON.stringify({ event: 'message', data }));
  }
}
```

## Client-Side Example (Socket.io)

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-auth-token',
  },
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('message', (data) => {
  console.log('Received:', data);
});

socket.emit('message', 'Hello, server!');

socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

## Complete Chat Example

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from './guards/ws-auth.guard';

interface ChatMessage {
  room: string;
  user: string;
  message: string;
  timestamp: Date;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'chat',
})
@UseGuards(WsAuthGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private users: Map<string, string> = new Map();

  handleConnection(client: Socket) {
    const username = client.handshake.auth.username;
    this.users.set(client.id, username);
    console.log(`User ${username} connected`);
  }

  handleDisconnect(client: Socket) {
    const username = this.users.get(client.id);
    this.users.delete(client.id);
    console.log(`User ${username} disconnected`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(room);
    const username = this.users.get(client.id);

    this.server.to(room).emit('notification', {
      message: `${username} joined the room`,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ): void {
    const username = this.users.get(client.id);
    client.leave(room);

    this.server.to(room).emit('notification', {
      message: `${username} left the room`,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('chatMessage')
  handleChatMessage(
    @MessageBody() data: { room: string; message: string },
    @ConnectedSocket() client: Socket,
  ): void {
    const username = this.users.get(client.id);

    const chatMessage: ChatMessage = {
      room: data.room,
      user: username,
      message: data.message,
      timestamp: new Date(),
    };

    this.server.to(data.room).emit('chatMessage', chatMessage);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { room: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ): void {
    const username = this.users.get(client.id);

    client.to(data.room).emit('typing', {
      user: username,
      isTyping: data.isTyping,
    });
  }
}
```

## Best Practices

1. **Use namespaces** - Organize different types of real-time features
2. **Implement authentication** - Validate connections with guards
3. **Handle disconnections** - Clean up resources properly
4. **Use rooms wisely** - Group related clients together
5. **Rate limiting** - Prevent abuse with message throttling
6. **Error handling** - Use exception filters for consistent error responses
7. **Heartbeat mechanism** - Detect stale connections
8. **State management** - Store connection state externally for scaling
9. **Binary data** - Use binary events for files/images
10. **Testing** - Use Socket.io client library for testing

## Common Patterns

### Acknowledgments

```typescript
@SubscribeMessage('messageWithAck')
async handleMessageWithAck(
  @MessageBody() data: string,
  @ConnectedSocket() client: Socket,
): Promise<{ status: string }> {
  await this.processMessage(data);
  return { status: 'processed' };
}
```

Client side:
```typescript
socket.emit('messageWithAck', 'data', (response) => {
  console.log('Server acknowledged:', response);
});
```

### Broadcasting from Service

```typescript
@Injectable()
export class NotificationService {
  constructor(private chatGateway: ChatGateway) {}

  sendNotification(userId: string, message: string) {
    this.chatGateway.server
      .to(userId)
      .emit('notification', message);
  }
}
```

### Custom Decorators

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const WsUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient();
    return client.handshake.auth.user;
  },
);
```

Usage:
```typescript
@SubscribeMessage('message')
handleMessage(
  @MessageBody() data: string,
  @WsUser() user: User,
): void {
  console.log(`Message from ${user.username}`);
}
```
