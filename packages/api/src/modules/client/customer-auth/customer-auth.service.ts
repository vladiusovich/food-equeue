// jwt.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';

interface Token {
    accessToken: string;
    // refreshToken: string;
};

@Injectable()
export class CustomerAuthService {
    constructor(
        private readonly jwtService: NestJwtService,
        @Inject(ConfigService)
        private readonly configService: ConfigService,
    ) { }

    async generateToken(payload: any): Promise<Token> {

        console.log( this.configService.get<string>("JWT_EXPIRES_IN"));
        const [accessToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>("JWT_SECRET"),
                expiresIn: this.configService.get<string>("JWT_EXPIRES_IN"),
            }),
            /*
                * I'm not sure we have to implement refresh tokens for the project

                this.jwtService.signAsync(payload, {
                    secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
                    expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRES_IN"),
                })
            */
        ]);

        return { accessToken };
    }

    async validateAccessToken(token: string): Promise<any> {
        return this.jwtService.verifyAsync(token);
    }

    async validateRefreshToken(token: string): Promise<any> {
        return this.jwtService.verifyAsync(token, {
            secret: this.configService.get<string>("JWT_REFRESH_EXPIRES_IN")
        });
    }
}
