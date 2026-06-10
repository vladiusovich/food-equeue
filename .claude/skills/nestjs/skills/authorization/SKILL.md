---
name: authorization
description: NestJS authorization with role-based access control (RBAC), permission-based authorization, custom guards, and CASL integration. Use when implementing access control, permissions, roles, or complex authorization logic.
---

# NestJS Authorization

## When to Use This Skill

Use this skill when:
- Implementing role-based access control (RBAC)
- Setting up permission-based authorization
- Creating custom authorization guards
- Restricting access based on user roles or permissions
- Implementing attribute-based access control (ABAC)
- Integrating CASL for complex authorization
- Enforcing resource ownership rules
- Building multi-tenant authorization systems

## What is Authorization?

Authorization determines what an authenticated user is allowed to do. It answers the question: "Does this user have permission to perform this action?"

**Authentication vs Authorization:**
- **Authentication:** Who are you? (Identity verification)
- **Authorization:** What can you do? (Permission checking)

Authorization happens **after** authentication in the request lifecycle.

## Role-Based Access Control (RBAC)

### Define Roles

```typescript
// roles/role.enum.ts
export enum Role {
  User = 'user',
  Admin = 'admin',
  Moderator = 'moderator',
  SuperAdmin = 'super_admin',
}
```

### Create Roles Decorator

```typescript
// decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/core';
import { Role } from '../roles/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

### Create Roles Guard

```typescript
// guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../roles/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

### Apply Roles to Routes

```typescript
import { Controller, Get, Post, Delete, UseGuards } from '@nestjs/common';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { Role } from './roles/role.enum';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  @Get()
  @Roles(Role.Admin, Role.Moderator)
  findAll() {
    return 'This route is restricted to admins and moderators';
  }

  @Post()
  @Roles(Role.Admin)
  create() {
    return 'Only admins can create users';
  }

  @Delete(':id')
  @Roles(Role.SuperAdmin)
  remove() {
    return 'Only super admins can delete users';
  }
}
```

### Global Roles Guard

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/roles.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

## Permission-Based Authorization

### Define Permissions

```typescript
// permissions/permission.enum.ts
export enum Permission {
  CreateUser = 'create:user',
  ReadUser = 'read:user',
  UpdateUser = 'update:user',
  DeleteUser = 'delete:user',
  CreatePost = 'create:post',
  ReadPost = 'read:post',
  UpdatePost = 'update:post',
  DeletePost = 'delete:post',
  ManageRoles = 'manage:roles',
  ViewAnalytics = 'view:analytics',
}
```

### Create Permissions Decorator

```typescript
// decorators/permissions.decorator.ts
import { SetMetadata } from '@nestjs/core';
import { Permission } from '../permissions/permission.enum';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
```

### Create Permissions Guard

```typescript
// guards/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission } from '../permissions/permission.enum';

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
```

### Usage

```typescript
@Controller('posts')
export class PostsController {
  @Get()
  @RequirePermissions(Permission.ReadPost)
  findAll() {
    return 'Requires read permission';
  }

  @Post()
  @RequirePermissions(Permission.CreatePost)
  create() {
    return 'Requires create permission';
  }

  @Delete(':id')
  @RequirePermissions(Permission.DeletePost)
  remove() {
    return 'Requires delete permission';
  }
}
```

## Resource Ownership Authorization

### Create Ownership Guard

```typescript
// guards/ownership.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class PostOwnershipGuard implements CanActivate {
  constructor(private postsService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const postId = request.params.id;

    const post = await this.postsService.findOne(postId);

    if (post.authorId !== user.id && !user.roles.includes('admin')) {
      throw new ForbiddenException('You can only modify your own posts');
    }

    return true;
  }
}
```

### Usage

```typescript
@Controller('posts')
export class PostsController {
  @Put(':id')
  @UseGuards(AuthGuard, PostOwnershipGuard)
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PostOwnershipGuard)
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
```

## CASL Integration (Advanced Authorization)

### Install CASL

```bash
npm install @casl/ability
```

### Define Abilities

```typescript
// casl/ability.factory.ts
import { Injectable } from '@nestjs/common';
import { AbilityBuilder, Ability, AbilityClass } from '@casl/ability';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects = 'Post' | 'User' | 'Comment' | 'all';
export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class AbilityFactory {
  defineAbility(user: any) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>,
    );

    if (user.role === 'admin') {
      can(Action.Manage, 'all');
    } else if (user.role === 'moderator') {
      can(Action.Read, 'all');
      can(Action.Update, 'Post');
      can(Action.Delete, 'Comment');
    } else {
      can(Action.Read, 'Post');
      can(Action.Create, 'Post');
      can(Action.Update, 'Post', { authorId: user.id });
      can(Action.Delete, 'Post', { authorId: user.id });
    }

    return build();
  }
}
```

### Create CASL Guard

```typescript
// guards/abilities.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityFactory } from '../casl/ability.factory';

export const CHECK_ABILITY = 'check_ability';

export interface RequiredRule {
  action: string;
  subject: string;
}

export const CheckAbilities = (...requirements: RequiredRule[]) =>
  SetMetadata(CHECK_ABILITY, requirements);

@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: AbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rules = this.reflector.get<RequiredRule[]>(
      CHECK_ABILITY,
      context.getHandler(),
    );

    if (!rules) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const ability = this.abilityFactory.defineAbility(user);

    for (const rule of rules) {
      if (ability.cannot(rule.action, rule.subject)) {
        throw new ForbiddenException(
          `You are not allowed to ${rule.action} ${rule.subject}`,
        );
      }
    }

    return true;
  }
}
```

### Usage with CASL

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CheckAbilities } from './guards/abilities.guard';
import { Action } from './casl/ability.factory';

@Controller('posts')
export class PostsController {
  @Get()
  @CheckAbilities({ action: Action.Read, subject: 'Post' })
  findAll() {
    return 'Can read posts';
  }

  @Post()
  @CheckAbilities({ action: Action.Create, subject: 'Post' })
  create() {
    return 'Can create posts';
  }
}
```

## Policy-Based Authorization

### Create Policy Service

```typescript
// policies/policy.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class PolicyService {
  canUpdatePost(user: any, post: any): boolean {
    if (user.role === 'admin') return true;
    if (post.authorId === user.id) return true;
    return false;
  }

  canDeletePost(user: any, post: any): boolean {
    if (user.role === 'admin') return true;
    if (user.role === 'moderator' && post.status === 'flagged') return true;
    if (post.authorId === user.id && post.createdAt > Date.now() - 3600000) return true;
    return false;
  }

  canViewAnalytics(user: any): boolean {
    return ['admin', 'analyst'].includes(user.role);
  }
}
```

### Create Policy Guard

```typescript
// guards/policy.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PolicyService } from '../policies/policy.service';

export const POLICY_KEY = 'policy';

export const CheckPolicy = (policyHandler: string) =>
  SetMetadata(POLICY_KEY, policyHandler);

@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private policyService: PolicyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandler = this.reflector.get<string>(
      POLICY_KEY,
      context.getHandler(),
    );

    if (!policyHandler) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    const allowed = await this.policyService[policyHandler](user, request);

    if (!allowed) {
      throw new ForbiddenException('Access denied by policy');
    }

    return true;
  }
}
```

## Combining Multiple Authorization Strategies

```typescript
// guards/combined-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CombinedAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();

    const requiredRoles = this.reflector.get('roles', context.getHandler());
    const requiredPermissions = this.reflector.get('permissions', context.getHandler());

    let hasRole = true;
    let hasPermission = true;

    if (requiredRoles) {
      hasRole = requiredRoles.some(role => user.roles?.includes(role));
    }

    if (requiredPermissions) {
      hasPermission = requiredPermissions.every(permission =>
        user.permissions?.includes(permission)
      );
    }

    return hasRole && hasPermission;
  }
}
```

## Multi-Tenant Authorization

```typescript
// guards/tenant.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceTenantId = request.params.tenantId || request.body.tenantId;

    if (!resourceTenantId) {
      return true;
    }

    if (user.tenantId !== resourceTenantId && !user.roles.includes('super_admin')) {
      throw new ForbiddenException('Access denied: different tenant');
    }

    return true;
  }
}
```

## Attribute-Based Access Control (ABAC)

```typescript
// guards/abac.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

interface AccessRule {
  resource: string;
  action: string;
  conditions?: (user: any, resource: any) => boolean;
}

@Injectable()
export class AbacGuard implements CanActivate {
  private rules: AccessRule[] = [
    {
      resource: 'post',
      action: 'update',
      conditions: (user, post) =>
        user.id === post.authorId || user.department === post.department,
    },
    {
      resource: 'document',
      action: 'view',
      conditions: (user, doc) =>
        doc.classification <= user.clearanceLevel,
    },
  ];

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user, params, body } = request;

    const rule = this.findMatchingRule(request);
    if (!rule) return true;

    if (rule.conditions) {
      const resource = await this.loadResource(params, body);
      return rule.conditions(user, resource);
    }

    return true;
  }

  private findMatchingRule(request: any): AccessRule | undefined {
    // Implementation to find matching rule
    return undefined;
  }

  private async loadResource(params: any, body: any): Promise<any> {
    // Implementation to load resource
    return {};
  }
}
```

## Complete Authorization Example

```typescript
// roles/role.enum.ts
export enum Role {
  User = 'user',
  Admin = 'admin',
  Moderator = 'moderator',
}

// permissions/permission.enum.ts
export enum Permission {
  CreatePost = 'create:post',
  UpdatePost = 'update:post',
  DeletePost = 'delete:post',
  ManageUsers = 'manage:users',
}

// decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/core';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// decorators/permissions.decorator.ts
import { SetMetadata } from '@nestjs/core';
export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

// guards/authorization.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    const hasRole = requiredRoles
      ? requiredRoles.some(role => user.roles?.includes(role))
      : true;

    const hasPermission = requiredPermissions
      ? requiredPermissions.every(permission =>
          user.permissions?.includes(permission)
        )
      : true;

    return hasRole && hasPermission;
  }
}

// posts/posts.controller.ts
@Controller('posts')
@UseGuards(AuthGuard, AuthorizationGuard)
export class PostsController {
  @Get()
  @RequirePermissions(Permission.ReadPost)
  findAll() {
    return 'All posts';
  }

  @Post()
  @Roles(Role.User, Role.Admin)
  @RequirePermissions(Permission.CreatePost)
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Put(':id')
  @Roles(Role.Admin)
  @RequirePermissions(Permission.UpdatePost)
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.Moderator)
  @RequirePermissions(Permission.DeletePost)
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}

// app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { AuthorizationGuard } from './guards/authorization.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
  ],
})
export class AppModule {}
```

## Best Practices

1. **Separation of concerns** - Authentication and authorization are separate
2. **Default deny** - Deny access by default, explicitly grant permissions
3. **Principle of least privilege** - Give users minimum required permissions
4. **Use enums for roles/permissions** - Type safety and maintainability
5. **Combine strategies** - Use roles for broad access, permissions for granular control
6. **Check ownership** - Verify resource ownership before allowing modifications
7. **Audit authorization decisions** - Log who accessed what
8. **Use guards consistently** - Apply globally or consistently across routes
9. **Test authorization thoroughly** - Test all permission combinations
10. **Document authorization rules** - Clear documentation of who can do what

## Common Authorization Patterns

### Hierarchical Roles
```typescript
const roleHierarchy = {
  super_admin: ['admin', 'moderator', 'user'],
  admin: ['moderator', 'user'],
  moderator: ['user'],
  user: [],
};

function hasRequiredRole(userRole: string, requiredRole: string): boolean {
  if (userRole === requiredRole) return true;
  return roleHierarchy[userRole]?.includes(requiredRole) || false;
}
```

### Dynamic Permissions
```typescript
async getUserPermissions(userId: string): Promise<Permission[]> {
  const user = await this.usersService.findOne(userId);
  const rolePermissions = await this.rolesService.getPermissions(user.role);
  const userPermissions = await this.userPermissionsService.find(userId);
  return [...rolePermissions, ...userPermissions];
}
```

### Conditional Authorization
```typescript
canActivate(context: ExecutionContext): boolean {
  const { user, body } = context.switchToHttp().getRequest();

  if (user.role === 'admin') return true;

  if (body.priority === 'high' && user.level < 5) return false;

  if (body.departmentId !== user.departmentId) return false;

  return true;
}
```

## Testing Authorization

```typescript
describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access when user has required role', () => {
    const context = createMockExecutionContext({
      user: { roles: ['admin'] },
    });

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user lacks required role', () => {
    const context = createMockExecutionContext({
      user: { roles: ['user'] },
    });

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

    expect(guard.canActivate(context)).toBe(false);
  });
});
```

Authorization is critical for security. Always validate user permissions, follow the principle of least privilege, and thoroughly test authorization rules.
