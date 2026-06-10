---
name: security
description: NestJS security best practices including CORS, CSRF protection, Helmet for HTTP headers, rate limiting, encryption, and hashing. Use when implementing security features, hardening applications, or protecting against common vulnerabilities.
---

# NestJS Security Best Practices

## When to Use This Skill

Use this skill when:
- Implementing CORS (Cross-Origin Resource Sharing)
- Setting up CSRF protection
- Configuring secure HTTP headers with Helmet
- Implementing rate limiting and throttling
- Encrypting and hashing sensitive data
- Protecting against common web vulnerabilities
- Securing API endpoints
- Implementing input validation and sanitization
- Setting up security middleware

## CORS Configuration

### Basic CORS Setup

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  await app.listen(3000);
}
bootstrap();
```

### Advanced CORS Configuration

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['https://example.com', 'https://app.example.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'],
    credentials: true,
    maxAge: 3600,
  });

  await app.listen(3000);
}
```

### Dynamic CORS Configuration

```typescript
app.enableCors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
});
```

### CORS with ConfigService

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
  ],
})
export class AppModule {}

// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get('CORS_ORIGIN'),
    credentials: true,
  });

  await app.listen(3000);
}
```

## CSRF Protection

### Install Dependencies

```bash
npm install csurf cookie-parser
npm install -D @types/cookie-parser
```

### Setup CSRF Protection

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.use(csurf());

  await app.listen(3000);
}
bootstrap();
```

### Custom CSRF Configuration

```typescript
app.use(
  csurf({
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    },
  }),
);
```

### CSRF Token Endpoint

```typescript
// app.controller.ts
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller()
export class AppController {
  @Get('csrf-token')
  getCsrfToken(@Req() req: Request) {
    return { csrfToken: req.csrfToken() };
  }
}
```

## Helmet - Security Headers

### Install Helmet

```bash
npm install helmet
```

### Basic Helmet Setup

```typescript
// main.ts
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  await app.listen(3000);
}
```

### Custom Helmet Configuration

```typescript
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: 'deny',
    },
    noSniff: true,
    xssFilter: true,
  }),
);
```

### Helmet for GraphQL

```typescript
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
  }),
);
```

## Rate Limiting

### Install Throttler

```bash
npm install @nestjs/throttler
```

### Basic Rate Limiting

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,    // Time window in seconds
      limit: 10,  // Max requests per ttl
    }),
  ],
})
export class AppModule {}
```

### Global Rate Limiting

```typescript
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [ThrottlerModule.forRoot({ ttl: 60, limit: 10 })],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

### Custom Rate Limits per Route

```typescript
import { Controller, Get } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

@Controller('api')
export class ApiController {
  @Throttle(5, 60)  // 5 requests per 60 seconds
  @Get('sensitive')
  sensitiveEndpoint() {
    return 'Rate limited endpoint';
  }

  @Throttle(100, 60)  // 100 requests per 60 seconds
  @Get('public')
  publicEndpoint() {
    return 'Less restrictive endpoint';
  }
}
```

### Skip Rate Limiting

```typescript
import { SkipThrottle } from '@nestjs/throttler';

@Controller('health')
export class HealthController {
  @SkipThrottle()
  @Get()
  check() {
    return { status: 'ok' };
  }
}
```

### Custom Throttler Storage

```typescript
import { ThrottlerModule, ThrottlerStorage } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
      storage: new CustomThrottlerStorage(),
    }),
  ],
})
export class AppModule {}
```

### Rate Limiting with Redis

```bash
npm install @nestjs/throttler-storage-redis ioredis
```

```typescript
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nestjs/throttler-storage-redis';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
      storage: new ThrottlerStorageRedisService({
        host: 'localhost',
        port: 6379,
      }),
    }),
  ],
})
export class AppModule {}
```

## Encryption and Hashing

### Password Hashing with Bcrypt

```bash
npm install bcrypt
npm install -D @types/bcrypt
```

```typescript
// users/users.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async createUser(username: string, password: string) {
    const hashedPassword = await this.hashPassword(password);
    return this.userRepository.create({
      username,
      password: hashedPassword,
    });
  }

  async validateUser(username: string, password: string) {
    const user = await this.userRepository.findOne({ username });
    if (user && await this.comparePassword(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
```

### Encryption with Crypto

```typescript
// encryption/encryption.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get('ENCRYPTION_KEY');
    this.key = crypto.scryptSync(secretKey, 'salt', 32);
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedText: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

### Hashing with Crypto (for tokens)

```typescript
import * as crypto from 'crypto';

function hashToken(token: string): string {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}
```

## Input Validation and Sanitization

### Class Validator

```typescript
// dto/create-user.dto.ts
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  username: string;
}
```

### Enable Validation Globally

```typescript
// main.ts
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true,            // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(3000);
}
```

### Sanitization

```bash
npm install class-sanitizer
```

```typescript
import { Sanitize } from 'class-sanitizer';
import { IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @Sanitize((value) => value.trim())
  title: string;

  @IsString()
  @Sanitize((value) => sanitizeHtml(value))
  content: string;
}
```

## Security Middleware

### Request Logging Middleware

```typescript
// middleware/logger.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';

    res.on('finish', () => {
      const { statusCode } = res;
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} - ${userAgent} ${ip}`,
      );
    });

    next();
  }
}
```

### Security Headers Middleware

```typescript
// middleware/security-headers.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.removeHeader('X-Powered-By');
    next();
  }
}
```

## API Key Security

```typescript
// guards/api-key.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const validApiKey = this.configService.get('API_KEY');

    if (!apiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
```

## Environment Variables Security

### Use Config Module

```typescript
// app.module.ts
import { Module } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required().min(32),
        API_KEY: Joi.string().required(),
      }),
    }),
  ],
})
export class AppModule {}
```

### Never Commit Secrets

```bash
# .gitignore
.env
.env.local
.env.*.local
secrets/
```

## SQL Injection Prevention

### Use ORM/Query Builders

```typescript
// Bad - Vulnerable to SQL injection
async findUser(username: string) {
  return this.db.query(`SELECT * FROM users WHERE username = '${username}'`);
}

// Good - Using parameterized queries
async findUser(username: string) {
  return this.db.query('SELECT * FROM users WHERE username = $1', [username]);
}

// Good - Using TypeORM
async findUser(username: string) {
  return this.userRepository.findOne({ where: { username } });
}
```

## XSS Prevention

### Sanitize HTML Content

```bash
npm install sanitize-html
```

```typescript
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class PostsService {
  createPost(content: string) {
    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p'],
      allowedAttributes: {
        a: ['href'],
      },
    });

    return this.postRepository.create({ content: sanitizedContent });
  }
}
```

## Complete Security Setup Example

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

  // CSRF protection
  app.use(cookieParser());
  app.use(
    csurf({
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      },
    }),
  );

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Disable x-powered-by header
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  await app.listen(process.env.PORT || 3000);
}
bootstrap();

// app.module.ts
import { Module } from '@nestjs/core';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').required(),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required().min(32),
        ALLOWED_ORIGINS: Joi.string().required(),
      }),
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

## Security Checklist

### Authentication & Authorization
- [ ] Use JWT tokens with short expiration
- [ ] Hash passwords with bcrypt (10+ rounds)
- [ ] Implement role-based access control
- [ ] Use HTTPS in production
- [ ] Implement token refresh mechanism
- [ ] Add account lockout after failed attempts

### Input Validation
- [ ] Enable global ValidationPipe
- [ ] Whitelist allowed properties
- [ ] Sanitize HTML inputs
- [ ] Validate file uploads
- [ ] Limit request body size
- [ ] Validate query parameters

### Headers & CORS
- [ ] Use Helmet for security headers
- [ ] Configure CORS properly
- [ ] Set HSTS header
- [ ] Remove X-Powered-By header
- [ ] Set Content-Security-Policy
- [ ] Enable X-Frame-Options

### Rate Limiting
- [ ] Implement global rate limiting
- [ ] Add stricter limits for auth endpoints
- [ ] Use Redis for distributed rate limiting
- [ ] Monitor and log rate limit violations

### Data Protection
- [ ] Encrypt sensitive data at rest
- [ ] Use environment variables for secrets
- [ ] Never log sensitive information
- [ ] Implement CSRF protection
- [ ] Use parameterized queries
- [ ] Sanitize user inputs

### Error Handling
- [ ] Don't expose stack traces in production
- [ ] Use generic error messages
- [ ] Log errors securely
- [ ] Implement proper exception filters

## Best Practices

1. **Defense in depth** - Multiple layers of security
2. **Principle of least privilege** - Minimal permissions by default
3. **Fail securely** - Default to deny on errors
4. **Keep dependencies updated** - Regular security patches
5. **Use environment variables** - Never hardcode secrets
6. **Validate all inputs** - Never trust user input
7. **Sanitize outputs** - Prevent XSS attacks
8. **Use HTTPS** - Encrypt data in transit
9. **Implement logging** - Audit security events
10. **Regular security audits** - Test for vulnerabilities

## Security Testing

```typescript
describe('Security', () => {
  it('should reject requests without CSRF token', async () => {
    return request(app.getHttpServer())
      .post('/api/users')
      .send({ username: 'test', password: 'test' })
      .expect(403);
  });

  it('should rate limit excessive requests', async () => {
    for (let i = 0; i < 11; i++) {
      await request(app.getHttpServer()).get('/api/endpoint');
    }

    return request(app.getHttpServer())
      .get('/api/endpoint')
      .expect(429);
  });

  it('should reject weak passwords', async () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'test', password: '123' })
      .expect(400);
  });
});
```

Security is an ongoing process. Stay informed about new vulnerabilities, keep dependencies updated, and regularly review your security practices.
