import {
    Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


@Injectable()
export class RefreshTokenGuard extends AuthGuard("jwt-refresh") { };


// @Injectable()
// export class RefreshTokenGuard implements CanActivate {
//     constructor(
//         @Inject(JwtService)
//         private jwtService: JwtService,
//         @Inject(ConfigService)
//         private readonly configService: ConfigService,
//     ) { }

//     async canActivate(context: ExecutionContext): Promise<boolean> {
//         const request = context.switchToHttp().getRequest();
//         const token = this.extractTokenFromHeader(request);
//         const secret = this.configService.get<string>("JWT_SECRET");

//         if (!token) {
//             throw new UnauthorizedException();
//         }
//         try {
//             const payload = await this.jwtService.verifyAsync(
//                 token,
//                 {
//                     secret,
//                 }
//             );
//             // 💡 We're assigning the payload to the request object here
//             // so that we can access it in our route handlers
//             request['user'] = payload;
//         } catch (e) {
//             console.trace("Token expired:", e);
//             throw new UnauthorizedException();
//         }
//         return true;
//     }

//     private extractTokenFromHeader(request: Request): string | undefined {
//         const [type, token] = request.headers.authorization?.split(' ') ?? [];

//         return type === 'Bearer' ? token : undefined;
//     }
// }