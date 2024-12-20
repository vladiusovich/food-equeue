// jwt.strategy.ts
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class CustomerAuthStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject(ConfigService)
        configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>("JWT_SECRET")
        });
    }

    async validate(payload: any) {
        return { userId: payload.sub, username: payload.username };
    }
}
