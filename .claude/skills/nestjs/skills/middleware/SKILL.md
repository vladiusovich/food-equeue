---
name: middleware
description: NestJS middleware for request/response preprocessing, logging, authentication, and cross-cutting concerns. Use when you need to execute code before route handlers or modify request/response objects.
---

# NestJS Middleware

## When to Use This Skill

Use this skill when:
- Logging requests and responses
- Authenticating users before reaching route handlers
- Parsing request bodies or headers
- Adding headers to responses
- Implementing CORS manually
- Rate limiting or throttling requests
- Validating request data before it reaches controllers
- Modifying request or response objects globally

## What is Middleware?

Middleware functions execute before the route handler. They have access to the request and response objects and the `next()` function. Middleware can:
- Execute any code
- Make changes to request/response objects
- End the request-response cycle
- Call the next middleware in the stack

Middleware executes in the request processing pipeline **before guards, interceptors, and pipes**.

## Basic Class-based Middleware

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    next();
  }
}
```

**Key Points:**
- Decorated with `@Injectable()`
- Implements `NestMiddleware` interface
- `use()` method receives `req`, `res`, and `next`
- Must call `next()` to pass control to the next middleware/handler

## Functional Middleware

```typescript
import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`Request...`);
  next();
}
```

**When to use functional middleware:**
- Simple middleware with no dependencies
- No need for dependency injection
- Lightweight and stateless operations

## Applying Middleware

### In Module

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './logger.middleware';
import { CatsController } from './cats.controller';

@Module({
  controllers: [CatsController],
})
export class CatsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats');
  }
}
```

### With Specific HTTP Methods

```typescript
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';

@Module({})
export class CatsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'cats', method: RequestMethod.GET });
  }
}
```

### With Controller Class

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { CatsController } from './cats.controller';

@Module({})
export class CatsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(CatsController);
  }
}
```

## Route Wildcards

```typescript
configure(consumer: MiddlewareConsumer) {
  consumer
    .apply(LoggerMiddleware)
    .forRoutes('ab*cd'); // Matches abcd, ab_cd, abecd, etc.
}
```

**Supported wildcards:** `*`, `?`, `+`, `()`

## Excluding Routes

```typescript
configure(consumer: MiddlewareConsumer) {
  consumer
    .apply(LoggerMiddleware)
    .exclude(
      { path: 'cats', method: RequestMethod.GET },
      { path: 'cats', method: RequestMethod.POST },
      'cats/(.*)', // Wildcard exclusion
    )
    .forRoutes(CatsController);
}
```

## Multiple Middleware

```typescript
configure(consumer: MiddlewareConsumer) {
  consumer
    .apply(cors(), helmet(), logger)
    .forRoutes(CatsController);
}
```

Middleware executes in the order they are applied.

## Global Middleware

Applied in `main.ts` (functional middleware only):

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger } from './common/middleware/logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(logger);
  await app.listen(3000);
}
bootstrap();
```

**Note:** Global middleware can only be functional middleware (not class-based).

## Middleware with Dependency Injection

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const apiKey = this.configService.get('API_KEY');
    if (req.headers['x-api-key'] === apiKey) {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden' });
    }
  }
}
```

## Common Middleware Examples

### Logger Middleware

```typescript
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;

      this.logger.log(
        `${method} ${originalUrl} ${statusCode} - ${responseTime}ms`
      );
    });

    next();
  }
}
```

### Authentication Middleware

```typescript
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = this.jwtService.verify(token);
      req['user'] = payload;
      next();
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

### CORS Middleware

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  }
}
```

### Request Validation Middleware

```typescript
import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ValidateRequestMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (!req.headers['content-type']?.includes('application/json')) {
      throw new BadRequestException('Content-Type must be application/json');
    }
    next();
  }
}
```

### Rate Limiting Middleware

```typescript
import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private requests = new Map<string, number[]>();
  private readonly limit = 100;
  private readonly windowMs = 60000; // 1 minute

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip;
    const now = Date.now();

    if (!this.requests.has(ip)) {
      this.requests.set(ip, []);
    }

    const timestamps = this.requests.get(ip)!;
    const validTimestamps = timestamps.filter(t => now - t < this.windowMs);

    if (validTimestamps.length >= this.limit) {
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    validTimestamps.push(now);
    this.requests.set(ip, validTimestamps);

    next();
  }
}
```

## Complete Example

```typescript
// logger.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    this.logger.log(`${method} ${originalUrl}`);
    next();
  }
}

// app.module.ts
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude(
        { path: 'health', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
```

## Middleware vs Guards vs Interceptors

**Middleware:**
- Executes before route handler binding
- No access to execution context
- Cannot determine which handler will be executed
- Use for general request processing

**Guards:**
- Execute after middleware but before interceptors
- Have access to execution context
- Can determine exact handler to be executed
- Use for authentication/authorization

**Interceptors:**
- Execute before and after route handler
- Can transform results and exceptions
- Have access to execution context
- Use for logging, caching, transformations

## Best Practices

1. **Keep middleware focused** - Each middleware should have a single responsibility
2. **Always call next()** - Unless you want to end the request-response cycle
3. **Use functional middleware for simple cases** - No need for classes when DI isn't required
4. **Handle errors properly** - Throw appropriate HTTP exceptions
5. **Be mindful of order** - Middleware executes in the order it's applied
6. **Use global middleware sparingly** - Apply middleware only where needed
7. **Leverage DI** - Inject services when needed for more complex operations
8. **Document middleware behavior** - Clear comments on what each middleware does

## Common Use Cases

### Pre-processing Requests
```typescript
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req['id'] = Math.random().toString(36).substring(7);
    next();
  }
}
```

### Response Compression
```typescript
import * as compression from 'compression';

// In main.ts
app.use(compression());
```

### Body Parsing
```typescript
import * as bodyParser from 'body-parser';

// In main.ts
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
```

### Security Headers
```typescript
import * as helmet from 'helmet';

// In main.ts
app.use(helmet());
```

## Request Lifecycle Position

```
Incoming Request
    ↓
Middleware
    ↓
Guards
    ↓
Interceptors (before)
    ↓
Pipes
    ↓
Route Handler
    ↓
Interceptors (after)
    ↓
Exception Filters
    ↓
Response
```

Middleware is the first custom code to execute in the request lifecycle, making it ideal for early request processing, logging, and authentication checks.
