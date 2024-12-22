import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { CustomerOrderService } from './customer.order.service';
import { CustomerController } from './customer.controller';
import { AccessTokenGuard } from '../customer-auth/guards/accessToken.guard';
import { CustomerAuthModule } from '../customer-auth/customer-auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order]),
        CustomerAuthModule,
    ],
    controllers: [CustomerController],
    providers: [
        CustomerOrderService,
        AccessTokenGuard,
    ],
})
export class CustomersModule { }
