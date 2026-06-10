---
name: custom-decorators
description: NestJS custom decorators for extracting request data, setting metadata, composing decorators, and creating reusable parameter/method decorators. Use when you need to simplify controller code or create domain-specific abstractions.
---

# NestJS Custom Decorators

## When to Use This Skill

Use this skill when:
- Extracting specific properties from request objects
- Creating shortcuts for common parameter patterns
- Setting metadata for guards, interceptors, or filters
- Composing multiple decorators into one
- Implementing role-based access control
- Creating domain-specific abstractions
- Reducing boilerplate in controllers
- Building reusable decorator libraries

## What are Custom Decorators?

Decorators are TypeScript/ES2016 features that allow you to add metadata and modify classes, methods, or parameters. NestJS extensively uses decorators and provides utilities to create your own.

## Types of Custom Decorators

1. **Parameter decorators** - Extract data from request/context
2. **Method decorators** - Add metadata to route handlers
3. **Class decorators** - Add metadata to controllers
4. **Composed decorators** - Combine multiple decorators

## Built-in Parameter Decorators

NestJS provides these built-in decorators:

```typescript
@Request(), @Req()          // req
@Response(), @Res()         // res
@Next()                     // next
@Session()                  // req.session
@Param(key?: string)        // req.params / req.params[key]
@Body(key?: string)         // req.body / req.body[key]
@Query(key?: string)        // req.query / req.query[key]
@Headers(key?: string)      // req.headers / req.headers[key]
@Ip()                       // req.ip
@HostParam()                // req.hosts
```

## Creating Parameter Decorators

### Basic User Decorator

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

**Usage:**
```typescript
@Controller('users')
export class UsersController {
  @Get('profile')
  getProfile(@User() user: UserEntity) {
    return user;
  }
}
```

### Decorator with Data Parameter

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
```

**Usage:**
```typescript
@Get('profile')
getProfile(@User('id') userId: string) {
  return `User ID: ${userId}`;
}

@Get('email')
getEmail(@User('email') email: string) {
  return `Email: ${email}`;
}
```

### Current User ID Decorator

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id;
  },
);
```

**Usage:**
```typescript
@Get('posts')
getUserPosts(@CurrentUserId() userId: string) {
  return this.postsService.findByUser(userId);
}
```

### IP Address Decorator

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const IpAddress = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.ip || request.connection.remoteAddress;
  },
);
```

**Usage:**
```typescript
@Post('login')
login(@IpAddress() ip: string) {
  return `Login from IP: ${ip}`;
}
```

## Working with Pipes

Custom decorators work seamlessly with pipes:

```typescript
@Get()
findOne(@User(ValidationPipe) user: UserEntity) {
  return user;
}

@Get()
findOne(@User('id', ParseIntPipe) userId: number) {
  return userId;
}
```

## Setting Metadata with Decorators

### Roles Decorator

```typescript
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

**Usage:**
```typescript
@Controller('cats')
export class CatsController {
  @Post()
  @Roles('admin')
  create(@Body() createCatDto: CreateCatDto) {
    return 'Only admins can create cats';
  }
}
```

### Public Route Decorator

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**Usage:**
```typescript
@Controller('auth')
export class AuthController {
  @Public()
  @Post('login')
  login() {
    return 'This route is public';
  }
}
```

### Permissions Decorator

```typescript
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
```

**Usage:**
```typescript
@Controller('posts')
export class PostsController {
  @Get()
  @RequirePermissions('posts:read')
  findAll() {
    return [];
  }

  @Delete(':id')
  @RequirePermissions('posts:delete', 'posts:admin')
  remove(@Param('id') id: string) {
    return `Deleted post ${id}`;
  }
}
```

## Decorator Composition

Combine multiple decorators into a single decorator:

```typescript
import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiOperation } from '@nestjs/swagger';

export function ApiStandardResponse(description: string) {
  return applyDecorators(
    ApiOperation({ summary: description }),
    ApiResponse({ status: 200, description: 'Success' }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 500, description: 'Internal Server Error' }),
  );
}
```

**Usage:**
```typescript
@Get()
@ApiStandardResponse('Get all cats')
findAll() {
  return [];
}
```

### Auth Decorator Composition

```typescript
import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

export function Auth(...roles: string[]) {
  return applyDecorators(
    UseGuards(AuthGuard, RolesGuard),
    Roles(...roles),
  );
}
```

**Usage:**
```typescript
@Controller('admin')
export class AdminController {
  @Get('dashboard')
  @Auth('admin', 'superadmin')
  getDashboard() {
    return 'Admin dashboard';
  }
}
```

### API Documentation Decorator

```typescript
import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';

export const ApiController = (tag: string) => {
  return applyDecorators(ApiTags(tag));
};

export const ApiCreate = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiCreatedResponse({ type: model }),
    ApiBadRequestResponse({ description: 'Invalid input' }),
  );
};

export const ApiFindOne = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiOkResponse({ type: model }),
    ApiNotFoundResponse({ description: 'Not found' }),
  );
};
```

**Usage:**
```typescript
@Controller('cats')
@ApiController('cats')
export class CatsController {
  @Post()
  @ApiCreate(Cat)
  create(@Body() createCatDto: CreateCatDto) {
    return this.catsService.create(createCatDto);
  }

  @Get(':id')
  @ApiFindOne(Cat)
  findOne(@Param('id') id: string) {
    return this.catsService.findOne(id);
  }
}
```

## Request Headers Decorator

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Headers = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.headers[data.toLowerCase()] : request.headers;
  },
);
```

**Usage:**
```typescript
@Get()
findAll(@Headers('authorization') auth: string) {
  return `Auth header: ${auth}`;
}
```

## Cookies Decorator

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.cookies?.[data] : request.cookies;
  },
);
```

**Usage:**
```typescript
@Get()
findAll(@Cookies('sessionId') sessionId: string) {
  return `Session ID: ${sessionId}`;
}
```

## Protocol Decorator

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Protocol = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.protocol;
  },
);
```

**Usage:**
```typescript
@Get()
findAll(@Protocol() protocol: string) {
  return `Protocol: ${protocol}`;
}
```

## Hostname Decorator

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Hostname = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.hostname;
  },
);
```

**Usage:**
```typescript
@Get()
findAll(@Hostname() hostname: string) {
  return `Hostname: ${hostname}`;
}
```

## Request Context Decorator

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface RequestContext {
  user: any;
  ip: string;
  userAgent: string;
  timestamp: Date;
}

export const ReqContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestContext => {
    const request = ctx.switchToHttp().getRequest();
    return {
      user: request.user,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      timestamp: new Date(),
    };
  },
);
```

**Usage:**
```typescript
@Get()
findAll(@ReqContext() context: RequestContext) {
  console.log('Request from:', context.ip, 'at', context.timestamp);
  return context.user;
}
```

## Pagination Decorator

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationParams => {
    const request = ctx.switchToHttp().getRequest();
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;

    return {
      page,
      limit,
      offset: (page - 1) * limit,
    };
  },
);
```

**Usage:**
```typescript
@Get()
findAll(@Pagination() pagination: PaginationParams) {
  return this.catsService.findAll(pagination.limit, pagination.offset);
}
```

## Combining Parameter Decorators

```typescript
@Get('profile')
getProfile(
  @User('id') userId: string,
  @IpAddress() ip: string,
  @Headers('user-agent') userAgent: string,
) {
  return {
    userId,
    ip,
    userAgent,
  };
}
```

## Timeout Decorator

```typescript
import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';

export function Timeout(milliseconds: number) {
  return applyDecorators(UseInterceptors(new TimeoutInterceptor(milliseconds)));
}
```

**Usage:**
```typescript
@Get()
@Timeout(5000)
findAll() {
  return this.catsService.findAll();
}
```

## Cache Decorator

```typescript
import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

export function Cache(ttl?: number) {
  const decorators = [UseInterceptors(CacheInterceptor)];

  if (ttl) {
    decorators.push(CacheTTL(ttl));
  }

  return applyDecorators(...decorators);
}
```

**Usage:**
```typescript
@Get()
@Cache(60000) // Cache for 60 seconds
findAll() {
  return this.catsService.findAll();
}
```

## Complete Example

```typescript
// decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);

// decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// decorators/auth.decorator.ts
import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

export function Auth(...roles: string[]) {
  return applyDecorators(
    UseGuards(AuthGuard, RolesGuard),
    Roles(...roles),
  );
}

// decorators/api-response.decorator.ts
import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

export function ApiStandardResponses() {
  return applyDecorators(
    ApiBadRequestResponse({ description: 'Bad Request' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

export function ApiCreateResponse<TModel extends Type<any>>(model: TModel) {
  return applyDecorators(
    ApiStandardResponses(),
    ApiCreatedResponse({ type: model }),
  );
}

export function ApiFindOneResponse<TModel extends Type<any>>(model: TModel) {
  return applyDecorators(
    ApiStandardResponses(),
    ApiOkResponse({ type: model }),
    ApiNotFoundResponse({ description: 'Not Found' }),
  );
}

// Usage in controller
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from './decorators/user.decorator';
import { Public } from './decorators/public.decorator';
import { Auth } from './decorators/auth.decorator';
import { ApiCreateResponse, ApiFindOneResponse } from './decorators/api-response.decorator';
import { Cat } from './entities/cat.entity';
import { CreateCatDto } from './dto/create-cat.dto';

@Controller('cats')
@ApiTags('cats')
export class CatsController {
  @Get()
  @Public()
  findAll() {
    return this.catsService.findAll();
  }

  @Get(':id')
  @ApiFindOneResponse(Cat)
  findOne(@Param('id') id: string) {
    return this.catsService.findOne(id);
  }

  @Post()
  @Auth('admin')
  @ApiCreateResponse(Cat)
  create(
    @Body() createCatDto: CreateCatDto,
    @User('id') userId: string,
  ) {
    return this.catsService.create(createCatDto, userId);
  }

  @Get('my-cats')
  @Auth('user')
  getMyCats(@User('id') userId: string) {
    return this.catsService.findByUser(userId);
  }
}
```

## Best Practices

1. **Keep decorators simple** - Each decorator should have a single purpose
2. **Use descriptive names** - Make decorator purpose clear from the name
3. **Document decorators** - Provide JSDoc comments explaining usage
4. **Type decorators properly** - Use TypeScript generics for type safety
5. **Compose when appropriate** - Combine related decorators
6. **Extract reusable logic** - Create decorators for common patterns
7. **Use metadata constants** - Export metadata keys for consistency
8. **Validate decorator inputs** - Check parameters before setting metadata
9. **Consider backwards compatibility** - Don't break existing decorator usage
10. **Test decorators** - Unit test custom decorator behavior

## Decorator Naming Conventions

- **Parameter decorators:** Nouns (User, IpAddress, Pagination)
- **Metadata decorators:** Verbs or adjectives (Roles, Public, RequirePermissions)
- **Composed decorators:** Descriptive combinations (Auth, ApiStandardResponse)

## TypeScript Decorator Types

```typescript
// Parameter decorator
function paramDecorator(
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number
): void {}

// Method decorator
function methodDecorator(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {}

// Class decorator
function classDecorator<T extends { new(...args: any[]): {} }>(
  constructor: T
): T {}

// Property decorator
function propertyDecorator(
  target: Object,
  propertyKey: string | symbol
): void {}
```

## Advanced Patterns

### Conditional Decorator

```typescript
export function ConditionalAuth(condition: boolean) {
  if (condition) {
    return Auth('admin');
  }
  return () => {};
}
```

### Dynamic Metadata

```typescript
export function DynamicRoles(getRoles: () => string[]) {
  const roles = getRoles();
  return Roles(...roles);
}
```

## Common Use Cases

1. **Authentication** - Extract user from request
2. **Authorization** - Set roles and permissions
3. **API Documentation** - Compose Swagger decorators
4. **Request Context** - Extract IP, user agent, headers
5. **Pagination** - Parse page and limit parameters
6. **Logging** - Add metadata for logging interceptors
7. **Caching** - Control cache behavior
8. **Rate Limiting** - Set rate limit metadata

Custom decorators are powerful tools for creating clean, reusable, and maintainable NestJS applications. They help reduce boilerplate and create domain-specific abstractions that make your code more expressive and easier to understand.
