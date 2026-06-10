---
name: guards
description: NestJS guards for authentication, authorization, and route protection. Use when implementing role-based access control, JWT validation, or conditional route access based on execution context.
---

# NestJS Guards

## When to Use This Skill

Use this skill when:
- Implementing authentication (verifying user identity)
- Implementing authorization (checking user permissions/roles)
- Protecting routes based on user roles or permissions
- Validating JWT tokens or API keys
- Implementing custom access control logic
- Restricting access based on request context
- Building role-based access control (RBAC) systems
- Implementing feature flags or conditional route access

## What are Guards?

Guards determine whether a request will be handled by the route handler. They implement the `CanActivate` interface and return a boolean value (or Promise/Observable) indicating whether access is allowed.

Guards execute **after middleware** but **before interceptors and pipes** in the request lifecycle.

## Basic Guard

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return validateRequest(request);
  }
}

function validateRequest(request: any): boolean {
  return true; // Replace with actual validation logic
}
```

**Key Points:**
- Decorated with `@Injectable()`
- Implements `CanActivate` interface
- `canActivate()` returns boolean (true = allow, false = deny)
- Has access to `ExecutionContext` for detailed request information
- Throws `ForbiddenException` when returning false

## Execution Context

`ExecutionContext` extends `ArgumentsHost` and provides additional context about the current execution:

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Get HTTP-specific context
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Get handler and class references
    const handler = context.getHandler();
    const controller = context.getClass();

    return true;
  }
}
```

## Binding Guards

### Method-scoped Guard

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

@Controller('cats')
export class CatsController {
  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return 'This route is protected';
  }
}
```

### Controller-scoped Guard

```typescript
import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

@Controller('cats')
@UseGuards(AuthGuard)
export class CatsController {
  // All routes in this controller are protected
  @Get()
  findAll() {
    return 'Protected route';
  }
}
```

### Global Guard

```typescript
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
```

**Alternative (in main.ts):**
```typescript
const app = await NestFactory.create(AppModule);
app.useGlobalGuards(new AuthGuard());
```

## Role-based Authorization Guard

### Setting Roles with Custom Decorator

```typescript
// roles.decorator.ts
import { SetMetadata } from '@nestjs/core';

export enum Role {
  User = 'user',
  Admin = 'admin',
  Moderator = 'moderator',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

### Using Roles Decorator

```typescript
import { Controller, Get } from '@nestjs/common';
import { Roles, Role } from './roles.decorator';

@Controller('cats')
export class CatsController {
  @Get()
  @Roles(Role.Admin)
  findAll() {
    return 'Only admins can access this';
  }
}
```

### Roles Guard Implementation

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required, allow access
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

## JWT Authentication Guard

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

## API Key Guard

```typescript
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

## Combining Multiple Guards

```typescript
@Controller('cats')
@UseGuards(AuthGuard, RolesGuard)
export class CatsController {
  @Get()
  @Roles(Role.Admin)
  findAll() {
    return 'Protected by both guards';
  }
}
```

Guards execute in the order they are applied (left to right).

## Public Routes (Skipping Guards)

### Public Decorator

```typescript
// public.decorator.ts
import { SetMetadata } from '@nestjs/core';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

### Modified Auth Guard

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Perform authentication check
    const request = context.switchToHttp().getRequest();
    return validateRequest(request);
  }
}
```

### Using Public Decorator

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

## Permission-based Guard

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export enum Permission {
  CreateCat = 'create:cat',
  ReadCat = 'read:cat',
  UpdateCat = 'update:cat',
  DeleteCat = 'delete:cat',
}

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredPermissions.every((permission) =>
      user.permissions?.includes(permission),
    );
  }
}

// Usage
@Controller('cats')
export class CatsController {
  @Get()
  @RequirePermissions(Permission.ReadCat)
  findAll() {
    return 'Requires read permission';
  }

  @Delete(':id')
  @RequirePermissions(Permission.DeleteCat)
  remove() {
    return 'Requires delete permission';
  }
}
```

## Reflector Service

The `Reflector` class is used to retrieve metadata set by decorators:

```typescript
constructor(private reflector: Reflector) {}

// Get metadata from handler only
const roles = this.reflector.get<string[]>('roles', context.getHandler());

// Get metadata from class only
const roles = this.reflector.get<string[]>('roles', context.getClass());

// Get metadata from both (handler overrides class)
const roles = this.reflector.getAllAndOverride<string[]>('roles', [
  context.getHandler(),
  context.getClass(),
]);

// Get metadata from both (merge arrays)
const roles = this.reflector.getAllAndMerge<string[]>('roles', [
  context.getHandler(),
  context.getClass(),
]);
```

## Feature Flag Guard

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

export const FEATURE_FLAG_KEY = 'featureFlag';
export const RequireFeature = (flag: string) =>
  SetMetadata(FEATURE_FLAG_KEY, flag);

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredFeature = this.reflector.get<string>(
      FEATURE_FLAG_KEY,
      context.getHandler(),
    );

    if (!requiredFeature) {
      return true;
    }

    const isEnabled = this.configService.get(`features.${requiredFeature}`);
    return isEnabled === true;
  }
}

// Usage
@Controller('beta')
export class BetaController {
  @Get('feature')
  @RequireFeature('newFeature')
  getBetaFeature() {
    return 'Beta feature';
  }
}
```

## Complete Example

```typescript
// auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

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

// roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

// app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

// Usage in controller
@Controller('cats')
export class CatsController {
  @Get()
  @Roles(Role.Admin)
  findAll() {
    return 'Admin only';
  }

  @Post('login')
  @Public()
  login() {
    return 'Public route';
  }
}
```

## Best Practices

1. **Single responsibility** - Each guard should check one thing
2. **Use dependency injection** - Inject services for complex validation
3. **Throw appropriate exceptions** - Use `UnauthorizedException` or `ForbiddenException`
4. **Leverage Reflector** - Use custom decorators for metadata
5. **Order matters** - Apply guards in the correct order (auth before roles)
6. **Make routes public explicitly** - Use `@Public()` decorator for clarity
7. **Return early** - Check for public routes first to avoid unnecessary processing
8. **Use global guards** - For application-wide authentication
9. **Cache metadata** - Use `getAllAndOverride` for better performance
10. **Document guard behavior** - Clear comments on what each guard protects

## Guards vs Middleware

**Guards:**
- Execute after middleware
- Have access to `ExecutionContext`
- Know which handler will execute
- Better for authentication/authorization
- Can use dependency injection easily
- Work across all transport layers (HTTP, WebSockets, Microservices)

**Middleware:**
- Execute before guards
- No access to execution context
- Don't know which handler will execute
- Better for general request processing
- Simpler for basic operations

## Request Lifecycle Position

```
Incoming Request
    ↓
Middleware
    ↓
Guards ← (You are here)
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

Guards are the gatekeepers that decide if a request should proceed to the handler based on the execution context.
