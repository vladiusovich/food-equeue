---
name: interceptors
description: NestJS interceptors for transforming responses, handling exceptions, logging, caching, and adding cross-cutting concerns before/after route handlers. Use when you need to manipulate request/response streams using RxJS.
---

# NestJS Interceptors

## When to Use This Skill

Use this skill when:
- Logging request/response data and execution time
- Transforming response data before sending to client
- Transforming exceptions before they reach exception filters
- Caching responses for performance optimization
- Adding timeout logic to requests
- Binding extra logic before/after method execution
- Stripping null values from responses
- Wrapping responses in a standard format
- Implementing aspect-oriented programming (AOP) patterns

## What are Interceptors?

Interceptors are classes decorated with `@Injectable()` that implement the `NestInterceptor` interface. They bind extra logic before/after method execution and can:
- Transform the result returned from a function
- Transform the exception thrown from a function
- Extend basic function behavior
- Completely override a function based on conditions

Interceptors use RxJS and have access to the full request/response stream.

They execute **after guards** but **before and after pipes and route handlers**.

## Basic Interceptor

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');

    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => console.log(`After... ${Date.now() - now}ms`)));
  }
}
```

**Key Points:**
- Decorated with `@Injectable()`
- Implements `NestInterceptor` interface
- `intercept()` receives `ExecutionContext` and `CallHandler`
- `next.handle()` returns an RxJS `Observable`
- Use RxJS operators to manipulate the stream

## Execution Context

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const controller = context.getClass();

    console.log(`Calling ${controller.name}.${handler.name}`);

    return next.handle();
  }
}
```

## Call Handler

`CallHandler` implements the `handle()` method that returns an Observable. If you don't call `handle()`, the route handler won't be executed.

```typescript
intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
  // Logic before handler execution

  return next.handle().pipe(
    // Logic after handler execution using RxJS operators
  );
}
```

## Binding Interceptors

### Method-scoped Interceptor

```typescript
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { LoggingInterceptor } from './logging.interceptor';

@Controller('cats')
export class CatsController {
  @Get()
  @UseInterceptors(LoggingInterceptor)
  findAll() {
    return [];
  }
}
```

### Controller-scoped Interceptor

```typescript
@Controller('cats')
@UseInterceptors(LoggingInterceptor)
export class CatsController {
  // All routes in this controller use the interceptor
}
```

### Global Interceptor

```typescript
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './logging.interceptor';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
```

**Alternative (in main.ts):**
```typescript
const app = await NestFactory.create(AppModule);
app.useGlobalInterceptors(new LoggingInterceptor());
```

## Response Transformation

### Transform to Standard Format

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  statusCode: number;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        data,
        statusCode: context.switchToHttp().getResponse().statusCode,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

**Response Example:**
```json
{
  "data": { "id": 1, "name": "Cat" },
  "statusCode": 200,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Exclude Null Values

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ExcludeNullInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((value) => this.removeNulls(value)));
  }

  private removeNulls(obj: any): any {
    if (obj === null || obj === undefined) {
      return undefined;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.removeNulls(item)).filter((item) => item !== undefined);
    }

    if (typeof obj === 'object') {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        const cleanValue = this.removeNulls(value);
        if (cleanValue !== undefined) {
          acc[key] = cleanValue;
        }
        return acc;
      }, {});
    }

    return obj;
  }
}
```

## Logging Interceptor

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const responseTime = Date.now() - now;

          this.logger.log(
            `${method} ${url} ${statusCode} - ${responseTime}ms`,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `${method} ${url} ${error.status || 500} - ${responseTime}ms`,
            error.stack,
          );
        },
      }),
    );
  }
}
```

## Exception Mapping

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadGatewayException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) =>
        throwError(() => new BadGatewayException('Something went wrong')),
      ),
    );
  }
}
```

## Timeout Interceptor

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(5000),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  }
}
```

## Caching Interceptor

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache = new Map<string, any>();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const key = `${request.method}:${request.url}`;

    const cachedResponse = this.cache.get(key);
    if (cachedResponse) {
      console.log('Returning cached response');
      return of(cachedResponse);
    }

    return next.handle().pipe(
      tap((response) => {
        console.log('Caching response');
        this.cache.set(key, response);
      }),
    );
  }
}
```

## Custom Header Interceptor

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AddHeaderInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        response.header('X-Custom-Header', 'Custom Value');
        response.header('X-Response-Time', Date.now().toString());
      }),
    );
  }
}
```

## Conditional Override

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';

@Injectable()
export class CacheKeyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const isCached = request.query.cached === 'true';

    if (isCached) {
      return of({ message: 'Cached data', timestamp: new Date() });
    }

    return next.handle();
  }
}
```

## File Stream Interceptor

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class FileInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (Buffer.isBuffer(data)) {
          const response = context.switchToHttp().getResponse();
          response.header('Content-Type', 'application/octet-stream');
          response.header(
            'Content-Disposition',
            'attachment; filename="file.bin"',
          );
        }
        return data;
      }),
    );
  }
}
```

## Metrics Interceptor

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface Metrics {
  endpoint: string;
  method: string;
  count: number;
  totalTime: number;
  avgTime: number;
}

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private metrics = new Map<string, Metrics>();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const key = `${method}:${url}`;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        const existing = this.metrics.get(key);

        if (existing) {
          existing.count++;
          existing.totalTime += responseTime;
          existing.avgTime = existing.totalTime / existing.count;
        } else {
          this.metrics.set(key, {
            endpoint: url,
            method,
            count: 1,
            totalTime: responseTime,
            avgTime: responseTime,
          });
        }
      }),
    );
  }

  getMetrics(): Metrics[] {
    return Array.from(this.metrics.values());
  }
}
```

## Complete Example

```typescript
// transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  path: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }
}

// logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const now = Date.now();

    this.logger.log(`${method} ${url} - ${ip} ${userAgent}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const responseTime = Date.now() - now;

          this.logger.log(
            `${method} ${url} ${statusCode} - ${responseTime}ms`,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `${method} ${url} ${error.status || 500} - ${responseTime}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}

// app.module.ts
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
```

## RxJS Operators Reference

Common operators used with interceptors:

```typescript
import { map, tap, catchError, timeout, retry, switchMap } from 'rxjs/operators';

// map - Transform the response
next.handle().pipe(map(data => ({ result: data })))

// tap - Side effects (logging, metrics)
next.handle().pipe(tap(data => console.log(data)))

// catchError - Handle errors
next.handle().pipe(catchError(err => throwError(() => new Error())))

// timeout - Add timeout
next.handle().pipe(timeout(5000))

// retry - Retry on failure
next.handle().pipe(retry(3))

// switchMap - Switch to another observable
next.handle().pipe(switchMap(data => this.service.process(data)))
```

## Best Practices

1. **Keep interceptors focused** - Single responsibility per interceptor
2. **Use appropriate RxJS operators** - Choose the right operator for the task
3. **Handle errors properly** - Use `catchError` for error transformation
4. **Be mindful of order** - Interceptors execute in the order they're applied
5. **Avoid heavy computations** - Keep interceptor logic lightweight
6. **Use dependency injection** - Inject services for complex operations
7. **Return the Observable** - Always return the result of `next.handle()`
8. **Document side effects** - Clear comments on what each interceptor does
9. **Test thoroughly** - Interceptors can affect all routes
10. **Use global interceptors wisely** - Only for truly global concerns

## Interceptors vs Middleware vs Guards

**Interceptors:**
- Execute before and after handler
- Can transform results and exceptions
- Have access to `ExecutionContext`
- Use RxJS for stream manipulation
- Best for: transformations, logging, caching

**Guards:**
- Execute after middleware, before interceptors
- Return boolean for access control
- Have access to `ExecutionContext`
- Best for: authentication, authorization

**Middleware:**
- Execute before guards
- No access to execution context
- Don't know which handler will execute
- Best for: general request processing

## Request Lifecycle Position

```
Incoming Request
    ↓
Middleware
    ↓
Guards
    ↓
Interceptors (before) ← (You are here - BEFORE)
    ↓
Pipes
    ↓
Route Handler
    ↓
Interceptors (after) ← (You are here - AFTER)
    ↓
Exception Filters
    ↓
Response
```

Interceptors wrap the entire handler execution, allowing you to add logic both before and after the handler runs.
