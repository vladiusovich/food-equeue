// jwt.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CustomerAuthService } from './customer-auth.service';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { CustomerAuthController } from './customer.auth.controller';
import { AccessTokenGuard } from './guards/accessToken.guard';

@Module({
    imports: [
        JwtModule.register({}),
    ],
    controllers: [CustomerAuthController],
    providers: [
        CustomerAuthService,
        AccessTokenStrategy,
        AccessTokenGuard,
    ],
    exports: [CustomerAuthService, AccessTokenGuard, JwtModule],
})

export class CustomerAuthModule { }
