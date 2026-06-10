---
name: cli
description: NestJS CLI for generating resources, managing workspaces, building applications, and development commands. Use when scaffolding NestJS projects, generating boilerplate code, or managing monorepo structures.
---

# NestJS CLI

## When to Use This Skill

Use this skill when:
- Creating new NestJS projects
- Generating controllers, services, modules, and other components
- Building and bundling applications
- Working with monorepo/workspace structures
- Running development servers
- Managing project configuration
- Creating libraries for shared code

## What is the NestJS CLI?

The NestJS CLI is a command-line interface tool that helps you initialize, develop, and maintain NestJS applications. It provides generators for components, supports workspaces, and handles build configurations.

## Installation

### Global Installation

```bash
npm install -g @nestjs/cli
```

### Using npx

```bash
npx @nestjs/cli new my-project
```

## Basic Commands

### Create New Project

```bash
nest new project-name
```

**Options:**
- `--strict` - TypeScript strict mode
- `--package-manager [npm|yarn|pnpm]` - Package manager to use
- `--language [TS|JS]` - Programming language
- `--skip-git` - Skip git repository initialization
- `--skip-install` - Skip package installation

**Example:**
```bash
nest new my-app --strict --package-manager pnpm
```

### Generate Resources

```bash
nest generate <schematic> <name> [options]
```

**Aliases:**
```bash
nest g <schematic> <name>
```

## Schematics (Generators)

### Application

```bash
nest generate application <name>
```

Creates a new application in a monorepo structure.

### Module

```bash
nest generate module users
nest g mo users
```

Creates:
- `users/users.module.ts`

### Controller

```bash
nest generate controller users
nest g co users
```

Creates:
- `users/users.controller.ts`
- `users/users.controller.spec.ts`

**Options:**
- `--no-spec` - Skip test file
- `--flat` - Don't create a folder

### Service

```bash
nest generate service users
nest g s users
```

Creates:
- `users/users.service.ts`
- `users/users.service.spec.ts`

### Resource (Complete CRUD)

```bash
nest generate resource users
nest g res users
```

**Prompts:**
- Transport layer (REST API, GraphQL, Microservice, WebSockets)
- Generate CRUD entry points?

Creates:
- Module
- Controller
- Service
- Entity
- DTOs (create, update)
- Test files

**Example output for REST API:**
```
users/
├── dto/
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
├── entities/
│   └── user.entity.ts
├── users.controller.ts
├── users.controller.spec.ts
├── users.module.ts
├── users.service.ts
└── users.service.spec.ts
```

### Other Schematics

```bash
# Class
nest g class users/dto/create-user

# Interface
nest g interface users/interfaces/user

# Guard
nest g guard auth/guards/jwt

# Interceptor
nest g interceptor common/interceptors/logging

# Pipe
nest g pipe common/pipes/validation

# Filter
nest g filter common/filters/http-exception

# Middleware
nest g middleware common/middleware/logger

# Decorator
nest g decorator auth/decorators/user

# Gateway (WebSocket)
nest g gateway events

# Resolver (GraphQL)
nest g resolver users

# Library
nest g library shared
```

## Schematic Options

### Common Options

```bash
# Skip test files
nest g service users --no-spec

# Flat structure (no folder)
nest g controller users --flat

# Dry run (preview changes)
nest g module users --dry-run

# Specific path
nest g service users/services/user

# Skip import into module
nest g service users --no-import
```

**Example:**
```bash
nest g resource products --no-spec --flat
```

## Build Commands

### Development Build

```bash
nest build
```

Compiles TypeScript to JavaScript in `dist/` folder.

### Production Build

```bash
nest build --webpack
```

**Options:**
- `--watch` - Watch mode for development
- `--webpack` - Use webpack for bundling
- `--path [path]` - Path to tsconfig file
- `--config [path]` - Path to nest-cli.json

### Watch Mode

```bash
nest build --watch
```

Automatically rebuilds on file changes.

## Development Commands

### Start Application

```bash
nest start
```

Builds and runs the application.

### Development Mode (Watch)

```bash
nest start --watch
```

Watches for changes and restarts automatically.

**Alias:**
```bash
npm run start:dev
```

### Debug Mode

```bash
nest start --debug
```

Starts with Node.js inspector for debugging.

**Options:**
- `--debug [port]` - Debug on specific port (default: 9229)
- `--watch` - Watch mode with debugging

**Example:**
```bash
nest start --debug --watch
```

## Workspaces and Monorepo

### Create Workspace

```bash
nest new my-workspace
cd my-workspace
nest generate app api
nest generate app admin
```

**Structure:**
```
my-workspace/
├── apps/
│   ├── api/
│   └── admin/
├── libs/
├── nest-cli.json
└── package.json
```

### Generate Library

```bash
nest generate library shared
nest g lib common
```

Creates a shared library in `libs/` folder.

**Usage in apps:**
```typescript
import { SharedModule } from '@app/shared';
```

### Build Specific Application

```bash
nest build api
nest build admin
```

### Start Specific Application

```bash
nest start api
nest start admin --watch
```

## Project Configuration

### nest-cli.json

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "webpack": true,
    "tsConfigPath": "tsconfig.build.json"
  },
  "generateOptions": {
    "spec": false,
    "flat": true
  }
}
```

**Options:**
- `sourceRoot` - Source code root directory
- `compilerOptions.deleteOutDir` - Delete output directory before build
- `compilerOptions.webpack` - Use webpack
- `generateOptions.spec` - Generate test files by default
- `generateOptions.flat` - Generate without folder

### Monorepo Configuration

```json
{
  "projects": {
    "api": {
      "type": "application",
      "root": "apps/api",
      "entryFile": "main",
      "sourceRoot": "apps/api/src",
      "compilerOptions": {
        "tsConfigPath": "apps/api/tsconfig.app.json"
      }
    },
    "shared": {
      "type": "library",
      "root": "libs/shared",
      "entryFile": "index",
      "sourceRoot": "libs/shared/src",
      "compilerOptions": {
        "tsConfigPath": "libs/shared/tsconfig.lib.json"
      }
    }
  }
}
```

## Additional Commands

### Info

```bash
nest info
```

Displays information about:
- Installed packages
- Node.js version
- Operating system
- NestJS CLI version

**Example output:**
```
 _   _             _      ___  _____  _____  _     _____
| \ | |           | |    |_  |/  ___|/  __ \| |   |_   _|
|  \| |  ___  ___ | |_     | |\ `--. | /  \/| |     | |
| . ` | / _ \/ __|| __|    | | `--. \| |    | |     | |
| |\  ||  __/\__ \| |_ /\__/ //\__/ /| \__/\| |_____| |_
\_| \_/ \___||___/ \__|\____/ \____/  \____/\_____/\___/

[System Information]
OS Version     : macOS
NodeJS Version : v18.12.0
NPM Version    : 8.19.2

[Nest CLI]
Nest CLI Version : 9.1.5

[Nest Platform Information]
platform-express version : 9.2.0
schematics version       : 9.0.3
common version           : 9.2.0
core version            : 9.2.0
```

### Add

```bash
nest add @nestjs/swagger
```

Adds a library with its schematic installation script.

**Common libraries:**
```bash
nest add @nestjs/swagger
nest add @nestjs/graphql
nest add @nestjs/mongoose
nest add @nestjs/typeorm
```

## Complete Workflow Examples

### New REST API Project

```bash
# Create project
nest new my-api --strict

# Navigate to project
cd my-api

# Generate a complete resource
nest g resource users

# Generate authentication module
nest g module auth
nest g service auth
nest g controller auth
nest g guard auth/guards/jwt

# Start development server
npm run start:dev
```

### Monorepo Setup

```bash
# Create workspace
nest new my-workspace

# Add applications
cd my-workspace
nest g app api
nest g app admin

# Add shared library
nest g lib database
nest g lib common

# Generate resources in specific app
nest g resource users --project api
nest g resource products --project admin

# Start specific app
nest start api --watch
```

### GraphQL Project

```bash
# Create project
nest new graphql-api

# Add GraphQL
cd graphql-api
nest add @nestjs/graphql @nestjs/apollo

# Generate GraphQL resources
nest g resource users --type graphql-code-first
nest g resource posts --type graphql-code-first

# Start development
npm run start:dev
```

### Microservices Project

```bash
# Create workspace
nest new microservices-app

# Generate microservices
cd microservices-app
nest g app auth-service
nest g app user-service
nest g app api-gateway

# Generate shared library
nest g lib shared

# Start services
nest start auth-service --watch
nest start user-service --watch
nest start api-gateway --watch
```

## Best Practices

1. **Use generators** - Don't create files manually, use CLI generators
2. **Consistent structure** - Let CLI maintain project structure
3. **Use workspaces** - For microservices or multiple related apps
4. **Shared libraries** - Extract common code into libraries
5. **Configure defaults** - Set `generateOptions` in nest-cli.json
6. **Skip specs when needed** - Use `--no-spec` for DTOs and entities
7. **Use resource generator** - For complete CRUD modules
8. **Dry run first** - Test generators with `--dry-run`
9. **Version control** - Commit nest-cli.json for team consistency
10. **Use absolute imports** - Configure path aliases for clean imports

## CLI Shortcuts

```bash
# Shorten commands with aliases
nest g mo users          # module
nest g co users          # controller
nest g s users           # service
nest g res users         # resource
nest g gu auth/jwt       # guard
nest g in logging        # interceptor
nest g pi validation     # pipe
nest g fi http-exception # filter
nest g mi logger         # middleware
nest g d current-user    # decorator
nest g ga events         # gateway
nest g r users           # resolver
```

## Common Scripts

Add these to `package.json`:

```json
{
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\"",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

## Troubleshooting

### CLI Not Found

```bash
# Reinstall globally
npm uninstall -g @nestjs/cli
npm install -g @nestjs/cli

# Or use npx
npx @nestjs/cli new my-project
```

### Import Errors in Monorepo

Check `tsconfig.json` paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@app/shared": ["libs/shared/src"],
      "@app/common": ["libs/common/src"]
    }
  }
}
```

### Build Errors

```bash
# Clean build
rm -rf dist
nest build

# Check TypeScript version
npm list typescript
```
