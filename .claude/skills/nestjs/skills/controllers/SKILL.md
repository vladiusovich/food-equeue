---
name: controllers
description: NestJS controllers for handling HTTP requests, routing, route parameters, query parameters, request payloads, and responses. Use when creating API endpoints, handling HTTP methods, or working with request/response objects.
---

# NestJS Controllers

## When to Use This Skill

Use this skill when:
- Creating REST API endpoints
- Handling HTTP requests (GET, POST, PUT, DELETE, PATCH)
- Working with route parameters, query parameters, or request bodies
- Setting up routing and path prefixes
- Handling redirects, headers, or status codes
- Working with async/await in route handlers

## What are Controllers?

Controllers are responsible for handling incoming requests and returning responses to the client. They use decorators to map routes to handler methods.

## Basic Controller

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
```

**Key Points:**
- `@Controller('cats')` - Sets route prefix `/cats`
- `@Get()` - Maps GET requests to this method
- Returns value automatically serialized to JSON (objects/arrays)
- Must register controller in module's `controllers` array

## HTTP Method Decorators

```typescript
import { Controller, Get, Post, Put, Delete, Patch } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll() {
    return [];
  }

  @Post()
  create() {
    return 'Created';
  }

  @Put(':id')
  update() {
    return 'Updated';
  }

  @Delete(':id')
  remove() {
    return 'Deleted';
  }

  @Patch(':id')
  patch() {
    return 'Patched';
  }
}
```

## Route Parameters

```typescript
import { Controller, Get, Param } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action returns cat #${id}`;
  }

  // Multiple parameters
  @Get(':category/:id')
  findByCategory(
    @Param('category') category: string,
    @Param('id') id: string
  ) {
    return `Category: ${category}, ID: ${id}`;
  }

  // All params as object
  @Get(':id')
  findOneAlt(@Param() params: { id: string }) {
    return `Cat #${params.id}`;
  }
}
```

## Query Parameters

```typescript
import { Controller, Get, Query } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  // /cats?limit=10&offset=0
  @Get()
  findAll(
    @Query('limit') limit: string,
    @Query('offset') offset: string
  ) {
    return `Limit: ${limit}, Offset: ${offset}`;
  }

  // All query params as object
  @Get()
  findAllAlt(@Query() query: { limit: string; offset: string }) {
    return query;
  }
}
```

## Request Body

```typescript
import { Controller, Post, Body } from '@nestjs/common';

export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}

@Controller('cats')
export class CatsController {
  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    return `Creating cat: ${createCatDto.name}`;
  }

  // Specific property
  @Post()
  createAlt(@Body('name') name: string) {
    return `Creating cat: ${name}`;
  }
}
```

## Request Object

```typescript
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(@Req() request: Request) {
    return request.headers;
  }
}
```

**Available Request Decorators:**
- `@Request(), @Req()` - Full request object
- `@Response(), @Res()` - Full response object (use with caution)
- `@Next()` - Next function
- `@Session()` - Session object
- `@Param(key?)` - Route parameters
- `@Body(key?)` - Request body
- `@Query(key?)` - Query parameters
- `@Headers(key?)` - Request headers
- `@Ip()` - Client IP address
- `@HostParam()` - Host parameters

## Status Codes

```typescript
import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  // Default: 200 for GET, 201 for POST
  @Post()
  create() {
    return 'Created';
  }

  // Custom status code
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  createNoContent() {
    // Returns 204
  }

  @Post()
  @HttpCode(204)
  createAlt() {
    // Also returns 204
  }
}
```

## Response Headers

```typescript
import { Controller, Post, Header } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Post()
  @Header('Cache-Control', 'no-store')
  @Header('X-Custom-Header', 'value')
  create() {
    return 'Created with custom headers';
  }
}
```

## Redirection

```typescript
import { Controller, Get, Redirect } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get('docs')
  @Redirect('https://docs.nestjs.com', 301)
  getDocs() {
    // Redirects to docs
  }

  // Dynamic redirect
  @Get('search')
  @Redirect()
  search(@Query('term') term: string) {
    return {
      url: `https://google.com/search?q=${term}`,
      statusCode: 302
    };
  }
}
```

## Route Wildcards

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  // Matches: /cats/profile, /cats/p, /cats/prxfile
  @Get('ab*cd')
  findWildcard() {
    return 'Wildcard route';
  }
}
```

**Supported wildcards:** `*`, `?`, `+`, `()`

## Sub-Domain Routing

```typescript
import { Controller, Get, HostParam } from '@nestjs/common';

@Controller({ host: ':account.example.com' })
export class AccountController {
  @Get()
  getInfo(@HostParam('account') account: string) {
    return `Account: ${account}`;
  }
}
```

## Async Handlers

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  async findAll(): Promise<Cat[]> {
    return await this.catsService.findAll();
  }

  // Using Observables (RxJS)
  @Get()
  findAllRx(): Observable<Cat[]> {
    return of([]);
  }
}
```

## DTOs (Data Transfer Objects)

```typescript
// create-cat.dto.ts
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}

// cats.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    return createCatDto;
  }
}
```

**Why use classes instead of interfaces?**
- Classes are preserved at runtime (interfaces are not)
- Enables validation with `class-validator`
- Works with Pipes for transformation

## Complete Controller Example

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { CatsService } from './cats.service';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  findAll(@Query('limit') limit = 10) {
    return this.catsService.findAll(limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCatDto: CreateCatDto) {
    return this.catsService.create(createCatDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCatDto: UpdateCatDto
  ) {
    return this.catsService.update(id, updateCatDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.catsService.remove(id);
  }
}
```

## Registering Controllers

Controllers must be registered in a module:

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

## Best Practices

1. **Keep controllers thin** - Delegate business logic to services
2. **Use DTOs** - Define classes for request/response data
3. **Validate input** - Use `ValidationPipe` with `class-validator`
4. **Use dependency injection** - Inject services via constructor
5. **Handle errors properly** - Throw appropriate HTTP exceptions
6. **Use async/await** - For asynchronous operations
7. **Document APIs** - Use `@nestjs/swagger` for OpenAPI docs
8. **Consistent naming** - Use standard REST conventions

## Common Patterns

### Resource Controller Pattern
```bash
nest generate resource cats
```

This generates:
- Module
- Controller with CRUD routes
- Service
- DTOs (create, update)
- Entity

### Nested Routes
```typescript
@Controller('users/:userId/posts')
export class PostsController {
  @Get()
  findUserPosts(@Param('userId') userId: string) {
    return this.postsService.findByUser(userId);
  }
}
```

### Versioning
```typescript
import { Controller, Version } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Version('1')
  @Get()
  findAllV1() {
    return 'V1';
  }

  @Version('2')
  @Get()
  findAllV2() {
    return 'V2';
  }
}
```
