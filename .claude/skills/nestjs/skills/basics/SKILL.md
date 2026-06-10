---
name: basics
description: NestJS setup, installation, and first steps. Use when starting a new NestJS project, setting up the development environment, or explaining NestJS fundamentals.
---

# NestJS Basics

## When to Use This Skill

Use this skill when:
- Setting up a new NestJS project
- Installing and configuring NestJS CLI
- Understanding NestJS core concepts and architecture
- Bootstrapping an application
- Explaining NestJS to beginners

## Installation

### Install NestJS CLI Globally
```bash
npm i -g @nestjs/cli
```

### Create New Project
```bash
nest new project-name
```

The CLI will prompt you to choose a package manager (npm, yarn, or pnpm).

### Requirements
- Node.js version 20 or higher
- TypeScript 5.x recommended

## Core Concepts

### What is NestJS?

NestJS is a progressive Node.js framework for building efficient, scalable server-side applications. Key features:

- **TypeScript-first** - Full TypeScript support with strong typing
- **Platform-agnostic** - Works with Express (default) or Fastify
- **Modular architecture** - Inspired by Angular's module system
- **Dependency Injection** - Built-in IoC container
- **Decorator-based** - Uses decorators for clean, declarative code
- **Testing-friendly** - Built with testability in mind

### Project Structure

Generated projects include:
```
src/
├── app.controller.ts      # Basic controller with a single route
├── app.controller.spec.ts # Unit tests for the controller
├── app.module.ts          # Root module
├── app.service.ts         # Basic service
└── main.ts                # Entry point - bootstraps the application
```

### Bootstrap Pattern

The `main.ts` file is the entry point:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

**Key Points:**
- `NestFactory.create()` creates the application instance
- Accepts the root module as a parameter
- Returns a `NestApplication` instance
- Use `app.listen()` to start the HTTP server

### Platform Selection

NestJS supports two HTTP platforms:

**Express (default):**
```typescript
const app = await NestFactory.create(AppModule);
```

**Fastify (for better performance):**
```typescript
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter()
);
```

## Running the Application

### Development Mode (with watch)
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

## Core Building Blocks

Every NestJS application consists of:

1. **Modules** - Organize application structure (`@Module()`)
2. **Controllers** - Handle requests and responses (`@Controller()`)
3. **Providers** - Business logic and services (`@Injectable()`)
4. **Middleware** - Request preprocessing
5. **Guards** - Authorization and route protection
6. **Interceptors** - Transform requests/responses
7. **Pipes** - Validation and transformation
8. **Exception Filters** - Error handling

## Request Processing Pipeline

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
Route Handler (Controller)
    ↓
Interceptors (after)
    ↓
Exception Filters
    ↓
Response
```

## Architecture Philosophy

NestJS follows these principles:

- **Modularity** - Organize code into feature modules
- **Single Responsibility** - Each class has one clear purpose
- **Dependency Injection** - Loose coupling through DI
- **Separation of Concerns** - Controllers handle routing, services handle business logic
- **Testability** - Built to support unit and e2e testing

## Common CLI Commands

```bash
# Generate a module
nest generate module users

# Generate a controller
nest generate controller users

# Generate a service
nest generate service users

# Generate a complete resource (module, controller, service, DTO)
nest generate resource users

# View all available commands
nest --help
```

## Best Practices

1. **Use TypeScript** - Leverage strong typing for better DX
2. **Follow module structure** - One feature per module
3. **Use DTOs** - Define data transfer objects with validation
4. **Dependency injection** - Inject dependencies via constructors
5. **Error handling** - Use built-in exception classes
6. **Configuration** - Use `@nestjs/config` for environment variables
7. **Validation** - Use `class-validator` with `ValidationPipe`

## Next Steps

After setting up your project:
1. Learn about **Controllers** for handling routes
2. Learn about **Providers** for business logic
3. Learn about **Modules** for organizing your application
4. Set up **Validation** for request data
5. Implement **Authentication** and **Authorization**
