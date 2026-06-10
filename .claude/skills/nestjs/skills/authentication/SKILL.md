---
name: authentication
description: NestJS authentication with JWT, Passport, local/JWT strategies, and auth guards. Use when implementing user login, token generation, protected routes, or integrating authentication systems.
---

# NestJS Authentication

## When to Use This Skill

Use this skill when:
- Implementing user login and authentication
- Generating and validating JWT tokens
- Setting up Passport strategies (local, JWT, OAuth, etc.)
- Creating authentication guards
- Protecting routes with authentication
- Building sign-up and sign-in endpoints
- Implementing token refresh mechanisms
- Integrating third-party authentication (Google, Facebook, etc.)

## What is Authentication?

Authentication verifies the identity of a user. In NestJS, authentication typically involves:
1. User submits credentials (username/password)
2. Server validates credentials and issues a JWT token
3. Client includes token in subsequent requests
4. Guards validate the token and attach user to request

## Basic Authentication Flow

### Step 1: Install Dependencies

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-local passport-jwt
npm install -D @types/passport-local @types/passport-jwt
```

### Step 2: Create Users Service

```typescript
// users/users.service.ts
import { Injectable } from '@nestjs/common';

export type User = {
  userId: number;
  username: string;
  password: string;
};

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
}
```

**Production Note:** Never store plain text passwords. Use bcrypt for hashing:

```typescript
import * as bcrypt from 'bcrypt';

async hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
}

async comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### Step 3: Create Auth Service

```typescript
// auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.userId, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
```

### Step 4: Create Auth Module

```typescript
// auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
```

### Step 5: Create Auth Controller

```typescript
// auth/auth.controller.ts
import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }
}
```

### Step 6: Create Auth Guard

```typescript
// auth/auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: process.env.JWT_SECRET
        }
      );
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

### Step 7: Protect Routes

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth/auth.guard';

@Controller('profile')
export class ProfileController {
  @UseGuards(AuthGuard)
  @Get()
  getProfile(@Request() req) {
    return req.user;
  }
}
```

## Passport Integration

### Local Strategy (Username/Password)

```typescript
// auth/local.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

### JWT Strategy

```typescript
// auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
```

### Using Passport Guards

```typescript
// With Local Strategy
import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}

// With JWT Strategy
@Controller('profile')
export class ProfileController {
  @UseGuards(AuthGuard('jwt'))
  @Get()
  getProfile(@Request() req) {
    return req.user;
  }
}
```

### Register Passport Strategies

```typescript
// auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
```

## Public Routes with Global Auth Guard

### Public Decorator

```typescript
// decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/core';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

### Modified Auth Guard

```typescript
// auth/auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // Rest of authentication logic
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

### Usage

```typescript
@Controller('auth')
export class AuthController {
  @Public()
  @Post('login')
  login() {
    return 'This route is public';
  }

  @Public()
  @Post('register')
  register() {
    return 'This route is public';
  }
}
```

## Token Refresh

```typescript
// auth/auth.service.ts
@Injectable()
export class AuthService {
  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const newAccessToken = await this.jwtService.signAsync(
        { sub: payload.sub, username: payload.username },
        { secret: process.env.JWT_SECRET, expiresIn: '15m' },
      );

      return { access_token: newAccessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      }),
      refresh_token: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    };
  }
}
```

## OAuth Integration (Google Example)

```typescript
// auth/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };
    done(null, user);
  }
}

// Controller
@Controller('auth')
export class AuthController {
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Request() req) {
    return this.authService.googleLogin(req.user);
  }
}
```

## Custom User Decorator

```typescript
// decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/core';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);

// Usage
@Controller('profile')
export class ProfileController {
  @UseGuards(AuthGuard)
  @Get()
  getProfile(@User() user: any) {
    return user;
  }

  @UseGuards(AuthGuard)
  @Get('email')
  getEmail(@User('email') email: string) {
    return { email };
  }
}
```

## Session-based Authentication

```typescript
// main.ts
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(3000);
}

// auth/session.serializer.ts
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: any, done: (err: Error, user: any) => void): any {
    done(null, user);
  }

  deserializeUser(payload: any, done: (err: Error, payload: string) => void): any {
    done(null, payload);
  }
}
```

## Complete Authentication Example

```typescript
// users/users.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private users = [];

  async create(username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: Date.now(),
      username,
      password: hashedPassword,
    };
    this.users.push(user);
    return user;
  }

  async findOne(username: string) {
    return this.users.find(user => user.username === username);
  }
}

// auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(username: string, password: string) {
    const user = await this.usersService.create(username, password);
    return this.login(user);
  }
}

// auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Public } from '../decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() body: { username: string; password: string }) {
    return this.authService.register(body.username, body.password);
  }

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}

// app.module.ts
import { Module } from '@nestjs/core';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuthGuard } from './auth/auth.guard';

@Module({
  imports: [AuthModule, UsersModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
```

## Best Practices

1. **Never store plain text passwords** - Use bcrypt or argon2
2. **Use environment variables** - Store secrets in .env files
3. **Short-lived access tokens** - 15 minutes to 1 hour
4. **Long-lived refresh tokens** - 7 days to 30 days
5. **Use HTTPS in production** - Prevent token interception
6. **Implement token rotation** - Refresh tokens should rotate on use
7. **Validate token expiration** - Check exp claim
8. **Use strong secrets** - At least 32 characters, random
9. **Implement rate limiting** - Prevent brute force attacks
10. **Log authentication events** - Track successful and failed attempts
11. **Use global auth guards** - Default to protected, explicitly mark public routes
12. **Implement logout** - Invalidate tokens (use blacklist or short expiration)

## Security Considerations

### Password Hashing
```typescript
import * as bcrypt from 'bcrypt';

const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);
const isMatch = await bcrypt.compare(password, hashedPassword);
```

### JWT Best Practices
```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET, // Use strong, random secret
  signOptions: {
    expiresIn: '15m',              // Short expiration
    issuer: 'your-app-name',       // Add issuer
    audience: 'your-app-users',    // Add audience
  },
})
```

### Rate Limiting
```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
})
```

## Testing Authentication

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should return access token on valid credentials', async () => {
    const user = { userId: 1, username: 'test', password: 'password' };
    jest.spyOn(usersService, 'findOne').mockResolvedValue(user);
    jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');

    const result = await service.signIn('test', 'password');
    expect(result).toEqual({ access_token: 'token' });
  });

  it('should throw UnauthorizedException on invalid credentials', async () => {
    jest.spyOn(usersService, 'findOne').mockResolvedValue(null);

    await expect(service.signIn('test', 'wrong')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
```

## Common Authentication Patterns

### Multi-tenant Authentication
```typescript
async validate(payload: any) {
  const user = await this.usersService.findOne(payload.sub);
  const tenant = await this.tenantService.findOne(payload.tenantId);
  return { ...user, tenant };
}
```

### API Key Authentication
```typescript
@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor(private apiKeyService: ApiKeyService) {
    super();
  }

  async validate(apiKey: string) {
    const isValid = await this.apiKeyService.validate(apiKey);
    if (!isValid) {
      throw new UnauthorizedException();
    }
    return { apiKey };
  }
}
```

### Two-Factor Authentication
```typescript
async verifyTwoFactorCode(userId: number, code: string) {
  const user = await this.usersService.findOne(userId);
  const isValid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: code,
  });
  if (!isValid) {
    throw new UnauthorizedException('Invalid 2FA code');
  }
  return this.login(user);
}
```

Authentication is a critical security feature. Always use established libraries, follow security best practices, and keep dependencies updated.
