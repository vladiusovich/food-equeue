---
name: modules
description: NestJS modules for organizing application structure, feature modules, shared modules, global modules, and dynamic modules. Use when structuring your application, organizing features, or creating reusable modules.
---

# NestJS Modules

## When to Use This Skill

Use this skill when:
- Organizing application structure into features
- Creating reusable modules
- Configuring module imports and exports
- Creating dynamic modules with runtime configuration
- Setting up global modules
- Understanding module dependency graph

## What are Modules?

Modules are classes decorated with `@Module()` that organize the application structure. Every application has at least one root module, and feature modules organize related functionality.

## Basic Module

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

## Module Decorator Properties

```typescript
@Module({
  imports: [],      // Other modules whose providers are needed
  controllers: [],  // Controllers to instantiate
  providers: [],    // Providers to instantiate and make available
  exports: [],      // Providers to make available to other modules
})
```

## Root Module

Every application has a root module:

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';
import { DogsModule } from './dogs/dogs.module';

@Module({
  imports: [CatsModule, DogsModule],
})
export class AppModule {}

// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

## Feature Modules

Organize related features:

```typescript
// users/users.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService], // Available to other modules
})
export class UsersModule {}

// app.module.ts
@Module({
  imports: [UsersModule, AuthModule, ProductsModule],
})
export class AppModule {}
```

## Shared Modules

Modules are singletons by default - providers are shared:

```typescript
// database/database.module.ts
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}

// Multiple modules can import it
@Module({
  imports: [DatabaseModule],
})
export class UsersModule {}

@Module({
  imports: [DatabaseModule],
})
export class ProductsModule {}
```

**Both modules share the same `DatabaseService` instance.**

## Module Re-exporting

Re-export imported modules:

```typescript
// common.module.ts
@Module({
  imports: [LoggerModule, ConfigModule],
  exports: [LoggerModule, ConfigModule], // Re-export
})
export class CommonModule {}

// app.module.ts
@Module({
  imports: [CommonModule], // Gets Logger and Config
})
export class AppModule {}
```

## Global Modules

Make a module available everywhere without importing:

```typescript
import { Module, Global } from '@nestjs/common';

@Global()
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
```

**Usage:**
```typescript
// No need to import ConfigModule
@Injectable()
export class AnyService {
  constructor(private config: ConfigService) {}
}
```

**Best Practices:**
- Use sparingly (only for truly global services)
- Prefer explicit imports for better clarity
- Good for: config, logging, caching services

## Dynamic Modules

Create modules with runtime configuration:

```typescript
// database.module.ts
import { Module, DynamicModule } from '@nestjs/common';

@Module({})
export class DatabaseModule {
  static forRoot(options: DatabaseOptions): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: 'DATABASE_OPTIONS',
          useValue: options,
        },
        DatabaseService,
      ],
      exports: [DatabaseService],
    };
  }
}

// Usage
@Module({
  imports: [
    DatabaseModule.forRoot({
      host: 'localhost',
      port: 5432,
    }),
  ],
})
export class AppModule {}
```

## Dynamic Module Patterns

### forRoot Pattern

For root-level configuration (singleton):

```typescript
@Module({})
export class ConfigModule {
  static forRoot(options: ConfigOptions): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
        ConfigService,
      ],
      exports: [ConfigService],
      global: true, // Optional: make it global
    };
  }
}
```

### forFeature Pattern

For feature-specific configuration:

```typescript
@Module({})
export class TypeOrmModule {
  static forFeature(entities: Entity[]): DynamicModule {
    const providers = entities.map(entity => ({
      provide: getRepositoryToken(entity),
      useFactory: (connection) => connection.getRepository(entity),
      inject: ['DATABASE_CONNECTION'],
    }));

    return {
      module: TypeOrmModule,
      providers,
      exports: providers,
    };
  }
}

// Usage
@Module({
  imports: [TypeOrmModule.forFeature([User, Product])],
})
export class AppModule {}
```

### forRootAsync Pattern

For async configuration with dependency injection:

```typescript
@Module({})
export class ConfigModule {
  static forRootAsync(options: ConfigAsyncOptions): DynamicModule {
    return {
      module: ConfigModule,
      imports: options.imports || [],
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        ConfigService,
      ],
      exports: [ConfigService],
    };
  }
}

// Usage
@Module({
  imports: [
    ConfigModule.forRootAsync({
      imports: [EnvModule],
      useFactory: (env: EnvService) => ({
        apiKey: env.get('API_KEY'),
      }),
      inject: [EnvService],
    }),
  ],
})
export class AppModule {}
```

## ConfigurableModuleBuilder

Simplify dynamic module creation:

```typescript
import { ConfigurableModuleBuilder } from '@nestjs/common';

interface ConfigOptions {
  apiKey: string;
  timeout: number;
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ConfigOptions>()
    .setClassMethodName('forRoot')
    .build();

@Module({})
export class ConfigModule extends ConfigurableModuleClass {}

// Automatically creates forRoot() and forRootAsync()
// Usage
@Module({
  imports: [
    ConfigModule.forRoot({
      apiKey: 'key',
      timeout: 5000,
    }),
  ],
})
export class AppModule {}
```

## Module Dependency Injection

Inject providers from imported modules:

```typescript
// database.module.ts
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}

// users.module.ts
@Module({
  imports: [DatabaseModule],
  providers: [UsersService],
})
export class UsersModule {}

// users.service.ts
@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {} // Injected from DatabaseModule
}
```

## Circular Dependencies Between Modules

Use `forwardRef()`:

```typescript
// cats.module.ts
@Module({
  imports: [forwardRef(() => DogsModule)],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}

// dogs.module.ts
@Module({
  imports: [forwardRef(() => CatsModule)],
  providers: [DogsService],
  exports: [DogsService],
})
export class DogsModule {}
```

## Module Organization Patterns

### By Feature

```
src/
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── dto/
├── products/
│   ├── products.module.ts
│   ├── products.controller.ts
│   └── products.service.ts
└── app.module.ts
```

### By Layer

```
src/
├── controllers/
├── services/
├── repositories/
├── modules/
└── app.module.ts
```

### Hybrid (Recommended)

```
src/
├── modules/
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   └── products/
├── common/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
└── app.module.ts
```

## Complete Example

```typescript
// config/config.module.ts
@Global()
@Module({})
export class ConfigModule {
  static forRoot(options: ConfigOptions): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
        ConfigService,
      ],
      exports: [ConfigService],
    };
  }
}

// database/database.module.ts
@Module({})
export class DatabaseModule {
  static forRootAsync(): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: 'DATABASE_CONNECTION',
          useFactory: async (config: ConfigService) => {
            return createConnection(config.database);
          },
          inject: [ConfigService],
        },
        DatabaseService,
      ],
      exports: [DatabaseService],
    };
  }
}

// users/users.module.ts
@Module({
  imports: [
    DatabaseModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}

// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      envPath: '.env',
    }),
    DatabaseModule.forRootAsync(),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
```

## Best Practices

1. **One module per feature** - Keep related code together
2. **Export selectively** - Only export what's needed by other modules
3. **Use feature modules** - Don't put everything in AppModule
4. **Shared modules** - Create common modules for shared functionality
5. **Global sparingly** - Only for truly global services
6. **Dynamic for configuration** - Use for libraries and configurable modules
7. **Avoid circular dependencies** - Refactor to shared module if needed
8. **Clear naming** - `UsersModule`, `AuthModule`, not `Module1`
9. **Keep modules focused** - Single responsibility per module
10. **Document dependencies** - Make imports explicit

## CLI Commands

```bash
# Generate a module
nest generate module users

# Generate a complete resource (module + controller + service)
nest generate resource users

# Generate module with CRUD
nest generate resource users --no-spec
```
