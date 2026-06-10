---
name: nestjs
description: Comprehensive NestJS framework skills covering controllers, providers, modules, middleware, guards, interceptors, pipes, validation, authentication, GraphQL, microservices, and more. Use when working with NestJS applications.
---

# NestJS Framework Skills

This skill collection provides comprehensive guidance for building applications with NestJS, a progressive Node.js framework for building efficient, scalable server-side applications.

## Available Skills

### Core Concepts

These skills cover the fundamental building blocks of every NestJS application:

- **[basics](skills/basics/SKILL.md)** - Project setup, installation, CLI usage, and core architecture concepts
- **[controllers](skills/controllers/SKILL.md)** - HTTP request handling, routing, route parameters, query parameters, and request payloads
- **[providers](skills/providers/SKILL.md)** - Services, dependency injection, and the IoC container
- **[modules](skills/modules/SKILL.md)** - Application organization, feature modules, shared modules, and dynamic modules
- **[middleware](skills/middleware/SKILL.md)** - Request/response preprocessing, logging, and authentication middleware
- **[guards](skills/guards/SKILL.md)** - Route protection, authorization, and role-based access control
- **[interceptors](skills/interceptors/SKILL.md)** - Response transformation, logging, caching, and timeout handling
- **[pipes](skills/pipes/SKILL.md)** - Data validation and transformation with class-validator
- **[exception-filters](skills/exception-filters/SKILL.md)** - Error handling and custom exception responses
- **[custom-decorators](skills/custom-decorators/SKILL.md)** - Creating reusable decorators for parameters, metadata, and composition

### Fundamentals

Advanced topics for mastering NestJS architecture:

- **[dependency-injection](skills/dependency-injection/SKILL.md)** - Custom providers, factory providers, async providers, and injection scopes
- **[testing](skills/testing/SKILL.md)** - Unit testing, integration testing, E2E testing, and mocking strategies
- **[lifecycle](skills/lifecycle/SKILL.md)** - Lifecycle hooks for modules, providers, and application bootstrapping

### Techniques

Practical techniques for common application requirements:

- **[configuration](skills/configuration/SKILL.md)** - Environment variables, configuration validation, and custom config files
- **[validation](skills/validation/SKILL.md)** - Request validation with class-validator and ValidationPipe
- **[database](skills/database/SKILL.md)** - SQL databases with TypeORM/Prisma and MongoDB with Mongoose
- **[caching](skills/caching/SKILL.md)** - In-memory and Redis caching strategies
- **[task-scheduling](skills/task-scheduling/SKILL.md)** - Cron jobs, intervals, and dynamic task scheduling
- **[queues](skills/queues/SKILL.md)** - Background job processing with Bull and Redis

### Security

Security best practices and authentication/authorization:

- **[authentication](skills/authentication/SKILL.md)** - JWT authentication, Passport integration, and auth strategies
- **[authorization](skills/authorization/SKILL.md)** - Role-based access control (RBAC) and permission-based authorization
- **[security](skills/security/SKILL.md)** - CORS, CSRF protection, Helmet, rate limiting, and encryption

### Advanced Topics

Advanced features for building complex applications:

- **[graphql](skills/graphql/SKILL.md)** - GraphQL integration, resolvers, queries, mutations, and subscriptions
- **[websockets](skills/websockets/SKILL.md)** - Real-time communication with WebSocket gateways
- **[microservices](skills/microservices/SKILL.md)** - Microservices architecture with various transport layers (TCP, Redis, NATS, Kafka, gRPC)
- **[cli](skills/cli/SKILL.md)** - NestJS CLI commands, code generation, and project scaffolding
- **[openapi](skills/openapi/SKILL.md)** - API documentation with Swagger/OpenAPI

## Quick Reference

### Request Processing Pipeline

```
Incoming Request
    ↓
Middleware ──────────── Global → Module → Route
    ↓
Guards ─────────────── Global → Controller → Route
    ↓
Interceptors (before) ── Global → Controller → Route
    ↓
Pipes ──────────────── Global → Controller → Route → Parameter
    ↓
Route Handler ───────── Controller Method
    ↓
Interceptors (after) ─── Route → Controller → Global
    ↓
Exception Filters ────── Route → Controller → Global
    ↓
Response
```

### Common CLI Commands

```bash
# Installation
npm i -g @nestjs/cli
nest new project-name

# Code Generation
nest generate module users
nest generate controller users
nest generate service users
nest generate resource users  # Generates module, controller, service, DTOs

# Running
npm run start:dev    # Development mode with watch
npm run start:debug  # Debug mode
npm run start:prod   # Production mode

# Testing
npm run test         # Unit tests
npm run test:watch   # Unit tests with watch
npm run test:cov     # Coverage
npm run test:e2e     # End-to-end tests

# Building
npm run build        # Production build
```

### Architecture Patterns

#### Feature Module Pattern
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
```

#### Service Layer Pattern
```typescript
@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = await this.repository.create(dto);
    await this.emailService.sendWelcome(user.email);
    return user;
  }
}
```

#### Controller Pattern
```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  findAll(@Query() query: QueryDto) {
    return this.service.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }
}
```

### Dependency Injection Patterns

```typescript
// Standard injection
constructor(private readonly service: MyService) {}

// Custom token injection
constructor(@Inject('CONFIG') private config: Config) {}

// Optional dependency
constructor(@Optional() private logger?: Logger) {}

// Multiple providers with same token
constructor(@Inject('FEATURES') private features: Feature[]) {}
```

### Validation Pattern

```typescript
import { IsString, IsInt, Min, Max, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(3, 50)
  name: string;

  @IsEmail()
  email: string;

  @IsInt()
  @Min(0)
  @Max(120)
  age: number;
}

// Use globally
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

### Authentication Pattern

```typescript
// JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}

// Protected Route
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  @Get()
  getProfile(@Request() req) {
    return req.user;
  }
}
```

## Best Practices

### General Architecture
1. **One feature per module** - Keep related code together
2. **Thin controllers** - Delegate business logic to services
3. **Use DTOs** - Define data transfer objects for validation
4. **Dependency injection** - Inject all dependencies via constructor
5. **Separation of concerns** - Controllers → Services → Repositories

### Code Organization
1. **Feature-based structure** - Organize by feature, not by layer
2. **Shared modules** - Create common modules for reusable functionality
3. **Clear naming** - Use descriptive names (UsersService, not Service1)
4. **Consistent patterns** - Follow the same patterns throughout

### Performance
1. **Use singleton scope** - Default scope for most providers
2. **Enable caching** - Cache frequently accessed data
3. **Use Fastify** - For better performance than Express
4. **Database optimization** - Use indexes, eager/lazy loading wisely
5. **Async operations** - Use async/await for I/O operations

### Security
1. **Validate all input** - Use ValidationPipe globally
2. **Sanitize data** - Prevent XSS and SQL injection
3. **Use HTTPS** - Enable SSL/TLS in production
4. **Rate limiting** - Prevent abuse
5. **Security headers** - Use Helmet middleware
6. **Authentication** - Implement proper auth (JWT, OAuth)
7. **Authorization** - Protect routes with guards

### Testing
1. **Write unit tests** - Test services and business logic
2. **Integration tests** - Test module interactions
3. **E2E tests** - Test complete user flows
4. **Mock dependencies** - Isolate units being tested
5. **Test coverage** - Aim for >80% coverage

### Error Handling
1. **Use built-in exceptions** - BadRequestException, NotFoundException, etc.
2. **Custom exception filters** - For consistent error responses
3. **Logging** - Log errors with context
4. **Graceful degradation** - Handle failures gracefully
5. **Validation errors** - Return clear validation messages

## Resources

- **Official Documentation**: https://docs.nestjs.com/
- **GitHub Repository**: https://github.com/nestjs/nest
- **Discord Community**: https://discord.gg/nestjs
- **Awesome NestJS**: https://github.com/nestjs/awesome-nestjs

## Getting Started

If you're new to NestJS, start with these skills in order:

1. **[basics](skills/basics/SKILL.md)** - Set up your first project
2. **[controllers](skills/controllers/SKILL.md)** - Create API endpoints
3. **[providers](skills/providers/SKILL.md)** - Add business logic
4. **[modules](skills/modules/SKILL.md)** - Organize your application
5. **[validation](skills/validation/SKILL.md)** - Validate request data
6. **[authentication](skills/authentication/SKILL.md)** - Secure your API
7. **[database](skills/database/SKILL.md)** - Connect to a database

Then explore the other skills based on your application's needs.
