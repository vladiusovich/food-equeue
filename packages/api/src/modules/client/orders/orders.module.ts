import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from 'src/modules/client/orders/orders.service';
import { Order } from './entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderCreatedListener } from './listeners/order-created.listener';
import { OrderUpdatedListener } from './listeners/order-updated.listener';
import { CustomerAuthModule } from '../customer-auth/customer-auth.module';
import { EventsGateway } from 'src/modules/events.gateway/events.gateway';

@Module({
    imports: [
        // EventsGatewayModule,
        TypeOrmModule.forFeature([Order]),
        CustomerAuthModule,
    ],
    controllers: [OrdersController],
    providers: [
        OrdersService, EventsGateway,
        OrderCreatedListener, OrderUpdatedListener,
    ],
    exports: [TypeOrmModule],
})

export class OrdersModule { }