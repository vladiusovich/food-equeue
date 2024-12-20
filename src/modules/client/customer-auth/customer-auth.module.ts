// jwt.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerAuthStrategy } from './customer-auth.strategy';
import { CustomerAuthController } from './customer.auth.controller';
import { CustomerAuthGuard } from './customer-auth-gurd';
import { getJwtConfig } from './getJvtCpnfig';

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: getJwtConfig,
        }),
    ],
    controllers: [CustomerAuthController],
    providers: [
        CustomerAuthGuard,
        CustomerAuthService,
        CustomerAuthStrategy,
    ],
    exports: [CustomerAuthService, CustomerAuthGuard, JwtModule],
})

export class CustomerAuthModule { }
