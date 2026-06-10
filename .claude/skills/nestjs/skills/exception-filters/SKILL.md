---
name: exception-filters
description: NestJS exception filters for handling errors, customizing error responses, logging exceptions, and providing consistent error formatting across your application.
---

# NestJS Exception Filters

## When to Use This Skill

Use this skill when:
- Customizing error response format
- Logging exceptions for monitoring and debugging
- Handling specific exception types differently
- Converting third-party library errors to HTTP exceptions
- Implementing custom error handling logic
- Providing user-friendly error messages
- Adding metadata to error responses (request ID, timestamp)
- Catching all unhandled exceptions

## What are Exception Filters?

Exception filters handle exceptions thrown during request processing. They can catch specific exception types or all exceptions, and customize the error response sent to the client.

NestJS has a built-in global exception filter that handles all unhandled exceptions. Custom filters allow you to override or extend this behavior.

Exception filters execute **after interceptors (after)** in the request lifecycle, as the final step before sending the response.

## Built-in Exceptions

NestJS provides standard HTTP exceptions:

```typescript
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  NotAcceptableException,
  RequestTimeoutException,
  ConflictException,
  GoneException,
  HttpVersionNotSupportedException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
  UnprocessableEntityException,
  InternalServerErrorException,
  NotImplementedException,
  ImATeapotException,
  MethodNotAllowedException,
  BadGatewayException,
  ServiceUnavailableException,
  GatewayTimeoutException,
  PreconditionFailedException,
} from '@nestjs/common';
```

## Throwing Exceptions

### Basic Exception

```typescript
import { Controller, Get, NotFoundException } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get(':id')
  findOne(@Param('id') id: string) {
    const cat = this.catsService.findOne(id);
    if (!cat) {
      throw new NotFoundException('Cat not found');
    }
    return cat;
  }
}
```

### Exception with Custom Response

```typescript
throw new BadRequestException({
  statusCode: 400,
  message: 'Invalid input data',
  error: 'Bad Request',
  details: ['name must be a string', 'age must be a number'],
});
```

### Custom Exception Class

```typescript
import { HttpException, HttpStatus } from '@nestjs/common';

export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}

// With custom response
export class CustomException extends HttpException {
  constructor(message: string, details?: any) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
```

## Basic Exception Filter

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

**Key Points:**
- Decorated with `@Catch(ExceptionType)`
- Implements `ExceptionFilter` interface
- `catch()` receives exception and `ArgumentsHost`
- Must handle sending response to client

## Arguments Host

`ArgumentsHost` provides methods to retrieve request and response objects:

```typescript
catch(exception: HttpException, host: ArgumentsHost) {
  const ctx = host.switchToHttp();
  const response = ctx.getResponse<Response>();
  const request = ctx.getRequest<Request>();

  // Get execution context type
  const type = host.getType(); // 'http' | 'rpc' | 'ws'

  // Switch context based on type
  if (type === 'http') {
    // HTTP context
  } else if (type === 'rpc') {
    // Microservices context
  } else if (type === 'ws') {
    // WebSockets context
  }
}
```

## Binding Exception Filters

### Method-scoped Filter

```typescript
import { Controller, Get, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

@Controller('cats')
export class CatsController {
  @Get()
  @UseFilters(HttpExceptionFilter)
  findAll() {
    return [];
  }
}
```

### Controller-scoped Filter

```typescript
@Controller('cats')
@UseFilters(HttpExceptionFilter)
export class CatsController {
  // All routes use the filter
}
```

### Global Filter

```typescript
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './http-exception.filter';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
```

**Alternative (in main.ts):**
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
```

## Catch All Exceptions

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

## Logging Exception Filter

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class LoggingExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(LoggingExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: exceptionResponse,
    };

    this.logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
      exception.stack,
    );

    response.status(status).json(errorResponse);
  }
}
```

## Custom Error Response

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error:
        typeof exceptionResponse === 'object'
          ? exceptionResponse
          : { message: exceptionResponse },
    };

    response.status(status).json(errorResponse);
  }
}
```

**Example response:**
```json
{
  "success": false,
  "statusCode": 404,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/cats/999",
  "method": "GET",
  "error": {
    "message": "Cat not found"
  }
}
```

## Validation Exception Filter

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    const validationErrors = exceptionResponse.message;

    response.status(status).json({
      statusCode: status,
      message: 'Validation failed',
      errors: Array.isArray(validationErrors)
        ? validationErrors
        : [validationErrors],
    });
  }
}
```

## Multiple Exception Types

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

@Catch(NotFoundException, UnauthorizedException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    if (exception instanceof NotFoundException) {
      response.status(status).json({
        statusCode: status,
        message: 'Resource not found',
      });
    } else if (exception instanceof UnauthorizedException) {
      response.status(status).json({
        statusCode: status,
        message: 'Authentication required',
      });
    }
  }
}
```

## Database Exception Filter

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error occurred';

    // PostgreSQL error codes
    if ((exception as any).code === '23505') {
      status = HttpStatus.CONFLICT;
      message = 'Duplicate entry';
    } else if ((exception as any).code === '23503') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Foreign key constraint violation';
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

## Inheritance

You can extend built-in exception filters:

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Custom logging or processing
    console.error('Exception caught:', exception);

    // Call parent implementation
    super.catch(exception, host);
  }
}
```

## Exception Filter with Dependency Injection

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './logger.service';

@Catch(HttpException)
@Injectable()
export class CustomExceptionFilter implements ExceptionFilter {
  constructor(
    private configService: ConfigService,
    private logger: LoggerService,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    const showStackTrace = this.configService.get('SHOW_STACK_TRACE') === 'true';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
      ...(showStackTrace && { stack: exception.stack }),
    };

    this.logger.error(errorResponse);

    response.status(status).json(errorResponse);
  }
}
```

## Request ID Tracking

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Catch(HttpException)
export class RequestIdExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const requestId = request.headers['x-request-id'] || uuidv4();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
      message: exception.message,
    });
  }
}
```

## Complete Example

```typescript
// all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : 'Unknown error',
    );

    response.status(status).json(errorResponse);
  }
}

// http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error:
        typeof exceptionResponse === 'object'
          ? exceptionResponse
          : { message: exceptionResponse },
    };

    this.logger.error(
      `HTTP Exception: ${request.method} ${request.url} - ${status}`,
      exception.stack,
    );

    response.status(status).json(errorResponse);
  }
}

// app.module.ts
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { HttpExceptionFilter } from './filters/http-exception.filter';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
```

## Best Practices

1. **Use specific filters** - Catch specific exception types when possible
2. **Log exceptions** - Always log errors for debugging and monitoring
3. **Consistent format** - Use a standard error response structure
4. **Hide sensitive data** - Don't expose stack traces in production
5. **Use dependency injection** - Inject services for logging or configuration
6. **Order matters** - More specific filters before general ones
7. **Include context** - Add request ID, timestamp, path to error responses
8. **Extend BaseExceptionFilter** - For simple customizations
9. **Handle all exceptions** - Have a catch-all filter as fallback
10. **Environment-aware** - Different error details for dev vs production

## Error Response Format

Standard error response structure:

```typescript
interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method?: string;
  message: string | object;
  error?: string;
  requestId?: string;
  stack?: string; // Only in development
}
```

## Multiple Filters Order

When multiple filters are applied:

```typescript
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter, // Catches everything
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter, // More specific
    },
  ],
})
```

**Execution order:** Most specific to least specific. If `HttpExceptionFilter` catches it, `AllExceptionsFilter` won't run.

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
Exception Filters ← (You are here)
    ↓
Response
```

Exception filters are the last layer before the response is sent, catching any unhandled exceptions from the entire request processing pipeline.
