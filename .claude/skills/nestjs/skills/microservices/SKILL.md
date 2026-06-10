---
name: microservices
description: NestJS microservices with multiple transport layers (TCP, Redis, NATS, Kafka, gRPC), message patterns, request-response and event-based communication, and hybrid applications. Use when building distributed systems.
---

# NestJS Microservices

## When to Use This Skill

Use this skill when:
- Building distributed systems with multiple services
- Implementing microservices architecture
- Using message brokers (Redis, Kafka, NATS, RabbitMQ)
- Creating gRPC services
- Building event-driven architectures
- Scaling applications horizontally
- Separating concerns across multiple services

## What are Microservices in NestJS?

NestJS microservices use different transport layers than HTTP to communicate between services. They support TCP, Redis, NATS, MQTT, Kafka, gRPC, and RabbitMQ, with both request-response and event-based patterns.

## Installation

Base package:
```bash
npm i @nestjs/microservices
```

For specific transports:
```bash
# Redis
npm i redis

# NATS
npm i nats

# Kafka
npm i kafkajs

# gRPC
npm i @grpc/grpc-js @grpc/proto-loader

# RabbitMQ
npm i amqplib amqp-connection-manager

# MQTT
npm i mqtt
```

## Basic Microservice Setup

### Creating a Microservice

```typescript
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 3001,
      },
    },
  );
  await app.listen();
}
bootstrap();
```

### Message Patterns

```typescript
import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern } from '@nestjs/microservices';

@Controller()
export class MathController {
  @MessagePattern({ cmd: 'sum' })
  accumulate(data: number[]): number {
    return (data || []).reduce((a, b) => a + b);
  }

  @MessagePattern('multiply')
  multiply(data: { a: number; b: number }): number {
    return data.a * data.b;
  }

  @EventPattern('user_created')
  handleUserCreated(data: { userId: string; email: string }): void {
    console.log('User created:', data);
  }
}
```

**Key Points:**
- `@MessagePattern()` - Request-response (expects acknowledgment)
- `@EventPattern()` - Event-based (fire-and-forget)
- Pattern can be string or object

## Client Communication

### Request-Response

```typescript
import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class AppService {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 3001,
      },
    });
  }

  async calculate(): Promise<number> {
    const pattern = { cmd: 'sum' };
    const payload = [1, 2, 3];

    return this.client.send<number>(pattern, payload).toPromise();
  }
}
```

### Event-Based

```typescript
@Injectable()
export class AppService {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: { host: 'localhost', port: 3001 },
    });
  }

  async createUser(userData: any): Promise<void> {
    this.client.emit('user_created', userData);
  }
}
```

### Using @Client Decorator

```typescript
import { Injectable } from '@nestjs/common';
import { Client, ClientProxy, Transport } from '@nestjs/microservices';

@Injectable()
export class AppService {
  @Client({ transport: Transport.TCP, options: { port: 3001 } })
  private client: ClientProxy;

  async getData(): Promise<any> {
    return this.client.send({ cmd: 'get_data' }, {}).toPromise();
  }
}
```

## Transport Layers

### TCP

```typescript
// Microservice
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: 3001,
    },
  },
);

// Client
@Client({
  transport: Transport.TCP,
  options: { host: '127.0.0.1', port: 3001 },
})
client: ClientProxy;
```

### Redis

```typescript
// Microservice
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.REDIS,
    options: {
      host: 'localhost',
      port: 6379,
    },
  },
);

// Client
@Client({
  transport: Transport.REDIS,
  options: { host: 'localhost', port: 6379 },
})
client: ClientProxy;
```

### NATS

```typescript
// Microservice
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.NATS,
    options: {
      servers: ['nats://localhost:4222'],
    },
  },
);

// Client
@Client({
  transport: Transport.NATS,
  options: { servers: ['nats://localhost:4222'] },
})
client: ClientProxy;
```

### Kafka

```typescript
// Microservice
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'my-app',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'my-consumer-group',
      },
    },
  },
);

// Client
@Client({
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'my-app',
      brokers: ['localhost:9092'],
    },
  },
})
client: ClientProxy;
```

### gRPC

```typescript
// proto/hero.proto
syntax = "proto3";

package hero;

service HeroesService {
  rpc FindOne (HeroById) returns (Hero) {}
  rpc FindMany (Empty) returns (Heroes) {}
}

message HeroById {
  int32 id = 1;
}

message Hero {
  int32 id = 1;
  string name = 2;
}

message Heroes {
  repeated Hero heroes = 1;
}

message Empty {}
```

```typescript
// Microservice
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.GRPC,
    options: {
      package: 'hero',
      protoPath: join(__dirname, 'hero.proto'),
      url: 'localhost:5000',
    },
  },
);

// Controller
@Controller()
export class HeroesController {
  @GrpcMethod('HeroesService', 'FindOne')
  findOne(data: { id: number }): Hero {
    return { id: data.id, name: 'Hero #' + data.id };
  }
}

// Client
@Client({
  transport: Transport.GRPC,
  options: {
    package: 'hero',
    protoPath: join(__dirname, 'hero.proto'),
  },
})
client: ClientProxy;
```

### RabbitMQ

```typescript
// Microservice
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'cats_queue',
      queueOptions: {
        durable: false,
      },
    },
  },
);

// Client
@Client({
  transport: Transport.RMQ,
  options: {
    urls: ['amqp://localhost:5672'],
    queue: 'cats_queue',
    queueOptions: { durable: false },
  },
})
client: ClientProxy;
```

### MQTT

```typescript
// Microservice
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.MQTT,
    options: {
      url: 'mqtt://localhost:1883',
    },
  },
);

// Client
@Client({
  transport: Transport.MQTT,
  options: { url: 'mqtt://localhost:1883' },
})
client: ClientProxy;
```

## Hybrid Applications

Combine HTTP and Microservices in one application:

```typescript
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { port: 3001 },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: { host: 'localhost', port: 6379 },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
```

## Guards and Interceptors

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class MicroserviceAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const data = context.switchToRpc().getData();
    return this.validateToken(data.token);
  }

  private validateToken(token: string): boolean {
    return !!token;
  }
}
```

**Using the guard:**

```typescript
import { UseGuards } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  @UseGuards(MicroserviceAuthGuard)
  @MessagePattern({ cmd: 'protected' })
  getProtectedData(data: { token: string }) {
    return { message: 'Protected data' };
  }
}
```

## Exception Filters

```typescript
import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class ExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    return throwError(() => ({
      error: exception.getError(),
      timestamp: new Date().toISOString(),
    }));
  }
}
```

**Using the filter:**

```typescript
import { UseFilters } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';

@Controller()
export class AppController {
  @UseFilters(ExceptionFilter)
  @MessagePattern({ cmd: 'data' })
  getData(data: any) {
    if (!data) {
      throw new RpcException('Data is required');
    }
    return data;
  }
}
```

## Context and Metadata

```typescript
import { Controller } from '@nestjs/common';
import { MessagePattern, Ctx, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  @MessagePattern({ cmd: 'get_data' })
  getData(@Payload() data: any, @Ctx() context: any) {
    console.log('Message pattern:', context.getPattern());
    console.log('Data:', data);
    return { success: true };
  }
}
```

## Complete Microservice Example

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'order-service',
          brokers: ['localhost:9092'],
        },
        consumer: {
          groupId: 'order-consumer',
        },
      },
    },
  );

  await app.listen();
  console.log('Order microservice is listening');
}
bootstrap();

// order.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { OrderService } from './order.service';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern('create_order')
  async createOrder(@Payload() data: any) {
    const order = await this.orderService.create(data);
    return { success: true, orderId: order.id };
  }

  @MessagePattern('get_order')
  async getOrder(@Payload() data: { orderId: string }) {
    return this.orderService.findOne(data.orderId);
  }

  @EventPattern('payment_completed')
  async handlePaymentCompleted(@Payload() data: any) {
    await this.orderService.updateStatus(data.orderId, 'paid');
  }

  @EventPattern('payment_failed')
  async handlePaymentFailed(@Payload() data: any) {
    await this.orderService.updateStatus(data.orderId, 'failed');
  }
}

// API Gateway (HTTP service)
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientKafka, Transport } from '@nestjs/microservices';

@Injectable()
export class OrderGatewayService implements OnModuleInit {
  @Client({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'api-gateway',
        brokers: ['localhost:9092'],
      },
    },
  })
  private orderClient: ClientKafka;

  async onModuleInit() {
    this.orderClient.subscribeToResponseOf('create_order');
    this.orderClient.subscribeToResponseOf('get_order');
    await this.orderClient.connect();
  }

  async createOrder(orderData: any) {
    return this.orderClient
      .send('create_order', orderData)
      .toPromise();
  }

  async getOrder(orderId: string) {
    return this.orderClient
      .send('get_order', { orderId })
      .toPromise();
  }

  emitPaymentCompleted(orderId: string) {
    this.orderClient.emit('payment_completed', { orderId });
  }
}
```

## Best Practices

1. **Choose the right transport** - TCP for simple RPC, Kafka for event streaming, gRPC for performance
2. **Use patterns wisely** - Request-response for queries, events for notifications
3. **Handle errors properly** - Use RpcException for microservice errors
4. **Implement retries** - Use RxJS retry operators for resilience
5. **Use message validation** - Validate payloads with class-validator
6. **Monitor services** - Implement health checks and metrics
7. **Use circuit breakers** - Prevent cascading failures
8. **Version your APIs** - Include version in message patterns
9. **Use schema registry** - For Kafka and event-driven systems
10. **Test independently** - Use mocks for inter-service testing

## Common Patterns

### Service Discovery

```typescript
import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';

@Injectable()
export class ServiceRegistry {
  private services: Map<string, ClientProxy> = new Map();

  registerService(name: string, config: any) {
    const client = ClientProxyFactory.create(config);
    this.services.set(name, client);
  }

  getService(name: string): ClientProxy {
    return this.services.get(name);
  }
}
```

### Saga Pattern

```typescript
@Injectable()
export class OrderSagaService {
  constructor(
    @Inject('PAYMENT_SERVICE') private paymentClient: ClientProxy,
    @Inject('INVENTORY_SERVICE') private inventoryClient: ClientProxy,
  ) {}

  async createOrder(orderData: any) {
    let reservationId: string;

    try {
      reservationId = await this.inventoryClient
        .send('reserve_items', orderData.items)
        .toPromise();

      const payment = await this.paymentClient
        .send('process_payment', orderData.payment)
        .toPromise();

      return { success: true, payment };
    } catch (error) {
      if (reservationId) {
        await this.inventoryClient
          .send('cancel_reservation', { reservationId })
          .toPromise();
      }
      throw error;
    }
  }
}
```

### Request Timeout

```typescript
import { timeout, catchError } from 'rxjs/operators';
import { throwError, TimeoutError } from 'rxjs';

async getData() {
  return this.client
    .send({ cmd: 'get_data' }, {})
    .pipe(
      timeout(5000),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(() => new Error('Request timeout'));
        }
        return throwError(() => err);
      }),
    )
    .toPromise();
}
```
