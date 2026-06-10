---
name: dependency-injection
description: NestJS dependency injection fundamentals, custom providers, factory providers, async providers, and injection tokens. Use when working with useValue, useClass, useFactory, useExisting, or customizing provider registration and injection scopes.
---

# NestJS Dependency Injection

## When to Use This Skill

Use this skill when:
- Working with custom providers beyond standard class providers
- Using factory providers for dynamic or async initialization
- Implementing value providers for configuration or constants
- Creating alias providers with useExisting
- Working with non-class-based injection tokens (strings or symbols)
- Implementing async providers that require initialization
- Understanding the three-step provider registration process
- Configuring provider scopes beyond singleton

## What is Dependency Injection?

Dependency Injection (DI) is an inversion of control pattern where dependencies are provided to a class rather than the class creating them itself. NestJS has a built-in IoC (Inversion of Control) container that manages the entire DI system.

## Three-Step Provider Registration

1. **Mark as Injectable** - Use `@Injectable()` decorator
2. **Declare Dependencies** - Specify in constructor
3. **Register in Module** - Add to module's `providers` array

```typescript
// Step 1: Mark as injectable
@Injectable()
export class CatsService {
  // Step 2: Declare dependencies in constructor
  constructor(private configService: ConfigService) {}
}

// Step 3: Register in module
@Module({
  providers: [CatsService, ConfigService],
})
export class CatsModule {}
```

## Standard Provider

The shorthand syntax:

```typescript
@Module({
  providers: [CatsService],
})
```

Is equivalent to:

```typescript
@Module({
  providers: [
    {
      provide: CatsService,
      useClass: CatsService,
    },
  ],
})
```

**Key Points:**
- `provide` - The token used for injection (can be class, string, or symbol)
- `useClass` - The class to instantiate when the token is requested

## Value Providers (useValue)

Inject a constant value, mock object, or external library:

```typescript
const mockCatsService = {
  findAll: () => ['cat1', 'cat2'],
  create: (cat: Cat) => cat,
};

@Module({
  providers: [
    {
      provide: CatsService,
      useValue: mockCatsService,
    },
  ],
})
export class CatsModule {}
```

### Configuration Values

```typescript
const configValues = {
  port: 3000,
  host: 'localhost',
  database: {
    url: 'mongodb://localhost/nest',
  },
};

@Module({
  providers: [
    {
      provide: 'CONFIG',
      useValue: configValues,
    },
  ],
})
export class AppModule {}

// Inject using @Inject()
@Injectable()
export class AppService {
  constructor(@Inject('CONFIG') private config: any) {
    console.log(config.port); // 3000
  }
}
```

**Use Cases:**
- Testing (mocking dependencies)
- Injecting configuration objects
- External libraries that don't use DI
- Constants and static values

## Non-Class-Based Provider Tokens

### String Tokens

```typescript
@Module({
  providers: [
    {
      provide: 'CONNECTION',
      useValue: connection,
    },
  ],
})
export class AppModule {}

// Injection requires @Inject()
@Injectable()
export class CatsRepository {
  constructor(@Inject('CONNECTION') private connection: Connection) {}
}
```

### Symbol Tokens

More robust than strings, prevents naming collisions:

```typescript
export const CONNECTION = Symbol('CONNECTION');

@Module({
  providers: [
    {
      provide: CONNECTION,
      useValue: connection,
    },
  ],
})
export class DatabaseModule {}

// Inject using the symbol
@Injectable()
export class CatsRepository {
  constructor(@Inject(CONNECTION) private connection: Connection) {}
}
```

**Best Practice:** Use symbols for token uniqueness

## Class Providers (useClass)

Provide an alternative implementation based on environment or configuration:

```typescript
abstract class ConfigService {
  abstract get(key: string): any;
}

class DevelopmentConfigService extends ConfigService {
  get(key: string) {
    return devConfig[key];
  }
}

class ProductionConfigService extends ConfigService {
  get(key: string) {
    return prodConfig[key];
  }
}

@Module({
  providers: [
    {
      provide: ConfigService,
      useClass:
        process.env.NODE_ENV === 'production'
          ? ProductionConfigService
          : DevelopmentConfigService,
    },
  ],
})
export class AppModule {}
```

**Use Cases:**
- Environment-specific implementations
- Strategy pattern implementations
- Feature flag-based class selection
- Testing with alternative implementations

## Factory Providers (useFactory)

Create providers dynamically with custom logic:

```typescript
@Module({
  providers: [
    {
      provide: 'CONNECTION',
      useFactory: (configService: ConfigService) => {
        const options = configService.get('database');
        return createConnection(options);
      },
      inject: [ConfigService],
    },
  ],
})
export class DatabaseModule {}
```

**Key Points:**
- `useFactory` - Function that returns the provider value
- `inject` - Array of dependencies to inject into the factory
- Factory function can be synchronous or asynchronous

### Async Factory Providers

Factory providers can return Promises:

```typescript
@Module({
  providers: [
    {
      provide: 'ASYNC_CONNECTION',
      useFactory: async (configService: ConfigService) => {
        const config = configService.get('database');
        const connection = await createConnection(config);
        await connection.connect();
        return connection;
      },
      inject: [ConfigService],
    },
  ],
})
export class DatabaseModule {}
```

### Factory with Multiple Dependencies

```typescript
@Module({
  providers: [
    {
      provide: 'REPOSITORY',
      useFactory: (connection: Connection, logger: Logger) => {
        logger.log('Creating repository');
        return new Repository(connection);
      },
      inject: ['CONNECTION', Logger],
    },
  ],
})
```

### Optional Dependencies in Factories

```typescript
@Module({
  providers: [
    {
      provide: 'CACHE',
      useFactory: (redis?: RedisClient) => {
        if (redis) {
          return new RedisCache(redis);
        }
        return new InMemoryCache();
      },
      inject: [{ token: 'REDIS_CLIENT', optional: true }],
    },
  ],
})
```

**Use Cases:**
- Async initialization (database connections, API clients)
- Conditional provider creation
- Complex initialization logic
- Dynamic configuration

## Alias Providers (useExisting)

Create an alias for an existing provider (shares the same instance):

```typescript
@Module({
  providers: [
    CatsService,
    {
      provide: 'AliasedCatsService',
      useExisting: CatsService,
    },
  ],
})
export class CatsModule {}
```

**Difference from useClass:**
- `useExisting` - Returns the same instance (alias)
- `useClass` - Creates a new instance

### Interface-Based Injection

```typescript
abstract class LoggerService {
  abstract log(message: string): void;
}

@Injectable()
class ConsoleLogger implements LoggerService {
  log(message: string) {
    console.log(message);
  }
}

@Module({
  providers: [
    ConsoleLogger,
    {
      provide: LoggerService,
      useExisting: ConsoleLogger,
    },
  ],
})
export class LoggerModule {}

// Inject using abstract class
@Injectable()
export class CatsService {
  constructor(private logger: LoggerService) {}
}
```

**Use Cases:**
- Creating multiple tokens for the same provider
- Interface-based dependency injection
- Backward compatibility when refactoring

## Exporting Custom Providers

Custom providers can be exported using their token:

```typescript
const connectionFactory = {
  provide: 'CONNECTION',
  useFactory: (configService: ConfigService) => {
    return createConnection(configService.get('database'));
  },
  inject: [ConfigService],
};

@Module({
  providers: [connectionFactory],
  exports: ['CONNECTION'], // Export by token
})
export class DatabaseModule {}
```

Export the entire provider object:

```typescript
@Module({
  providers: [connectionFactory],
  exports: [connectionFactory],
})
export class DatabaseModule {}
```

## Complete Example: Database Connection

```typescript
// database.providers.ts
import { ConfigService } from '@nestjs/config';
import { Connection, createConnection } from './connection';

export const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION');

export const databaseProviders = [
  {
    provide: DATABASE_CONNECTION,
    useFactory: async (configService: ConfigService): Promise<Connection> => {
      const connection = await createConnection({
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
      });

      await connection.initialize();
      return connection;
    },
    inject: [ConfigService],
  },
];

// database.module.ts
import { Module } from '@nestjs/common';
import { databaseProviders, DATABASE_CONNECTION } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}

// cats.repository.ts
import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from './database.providers';
import { Connection } from './connection';

@Injectable()
export class CatsRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private connection: Connection,
  ) {}

  async findAll(): Promise<Cat[]> {
    return this.connection.query('SELECT * FROM cats');
  }
}

// cats.module.ts
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { CatsRepository } from './cats.repository';
import { CatsService } from './cats.service';
import { CatsController } from './cats.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [CatsController],
  providers: [CatsService, CatsRepository],
})
export class CatsModule {}
```

## Provider Scope and Injection

### Injection Tokens Summary

| Token Type | Example | Injection Syntax |
|-----------|---------|------------------|
| Class | `CatsService` | `constructor(private catsService: CatsService)` |
| String | `'CONNECTION'` | `constructor(@Inject('CONNECTION') private connection)` |
| Symbol | `CONNECTION` | `constructor(@Inject(CONNECTION) private connection)` |

### When to Use @Inject()

**Required:**
- Non-class tokens (strings, symbols)
- Circular dependencies with `forwardRef()`
- Optional dependencies with `@Optional()`

**Not Required:**
- Class-based tokens (TypeScript handles this)

## Multi-Provider Pattern

Register multiple providers under the same token:

```typescript
const loggerProviders = [
  {
    provide: 'LOGGER',
    useClass: ConsoleLogger,
    multi: true,
  },
  {
    provide: 'LOGGER',
    useClass: FileLogger,
    multi: true,
  },
];

@Module({
  providers: loggerProviders,
})
export class LoggerModule {}

// Inject all providers as an array
@Injectable()
export class AppService {
  constructor(@Inject('LOGGER') private loggers: Logger[]) {
    // loggers is an array of [ConsoleLogger, FileLogger]
  }
}
```

## Dynamic Providers

Create providers at runtime:

```typescript
function createDatabaseProviders(): Provider[] {
  const providers: Provider[] = [];

  for (const tenant of tenants) {
    providers.push({
      provide: `${tenant.name}_CONNECTION`,
      useFactory: async () => {
        return createConnection(tenant.config);
      },
    });
  }

  return providers;
}

@Module({
  providers: [...createDatabaseProviders()],
})
export class MultiTenantModule {}
```

## Best Practices

1. **Use symbols for custom tokens** - Prevents naming collisions
2. **Prefer constructor injection** - More explicit than property injection
3. **Use factories for async initialization** - Database connections, API clients
4. **Export only what's needed** - Minimize coupling between modules
5. **Use abstract classes for interfaces** - Better than TypeScript interfaces for DI
6. **Document your providers** - Especially custom tokens and factories
7. **Use useExisting for aliases** - When you need multiple names for same instance
8. **Keep factories simple** - Move complex logic to separate services
9. **Use proper typing** - Type your factory return values and injected dependencies
10. **Organize providers** - Group related providers in separate files

## Testing Custom Providers

```typescript
describe('CatsService', () => {
  let service: CatsService;
  let connection: Connection;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatsService,
        {
          provide: 'CONNECTION',
          useValue: {
            query: jest.fn(),
            insert: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CatsService>(CatsService);
    connection = module.get('CONNECTION');
  });

  it('should query the database', async () => {
    await service.findAll();
    expect(connection.query).toHaveBeenCalled();
  });
});
```

## Common Patterns

### Repository Factory Pattern

```typescript
export function createRepositoryProvider<T>(
  entity: Type<T>,
): Provider {
  return {
    provide: `${entity.name}Repository`,
    useFactory: (connection: Connection) => {
      return connection.getRepository(entity);
    },
    inject: ['CONNECTION'],
  };
}

@Module({
  providers: [
    createRepositoryProvider(Cat),
    createRepositoryProvider(Dog),
  ],
})
export class RepositoriesModule {}
```

### Environment-Based Configuration

```typescript
const configProvider = {
  provide: 'CONFIG',
  useFactory: () => {
    const env = process.env.NODE_ENV;
    return env === 'production' ? productionConfig : developmentConfig;
  },
};

@Module({
  providers: [configProvider],
  exports: ['CONFIG'],
})
export class ConfigModule {}
```

### Lazy Initialization

```typescript
const lazyServiceProvider = {
  provide: 'LAZY_SERVICE',
  useFactory: () => {
    let service: HeavyService | null = null;
    return {
      get: () => {
        if (!service) {
          service = new HeavyService();
        }
        return service;
      },
    };
  },
};
```
