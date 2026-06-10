---
name: providers
description: NestJS providers, services, dependency injection, and the IoC container. Use when creating business logic, services, repositories, or working with dependency injection patterns.
---

# NestJS Providers

## When to Use This Skill

Use this skill when:
- Creating services for business logic
- Implementing dependency injection
- Working with repositories or data access layers
- Creating custom providers with factories or values
- Understanding provider scopes and lifecycles
- Injecting dependencies into controllers or other providers

## What are Providers?

Providers are classes that can be injected as dependencies. They handle business logic, data access, and can be shared across the application through NestJS's IoC (Inversion of Control) container.

## Basic Service

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }

  findOne(id: string): Cat {
    return this.cats.find(cat => cat.id === id);
  }
}
```

**Key Points:**
- `@Injectable()` decorator marks class as provider
- Enables dependency injection
- Contains business logic separate from controllers
- Can be injected into other classes

## Dependency Injection

### Constructor Injection (Recommended)

```typescript
import { Controller } from '@nestjs/common';
import { CatsService } from './cats.service';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  findAll() {
    return this.catsService.findAll();
  }
}
```

### Property Injection

```typescript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class CatsService {
  @Inject('CONNECTION')
  private connection: Connection;
}
```

**Use property injection only when:**
- The class extends another class with constructor params
- You need to inject into a base class

## Registering Providers

Providers must be registered in a module:

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

## Provider Patterns

### Standard Provider (Class)

```typescript
@Module({
  providers: [CatsService], // Shorthand
})

// Equivalent to:
@Module({
  providers: [
    {
      provide: CatsService,
      useClass: CatsService,
    },
  ],
})
```

### Value Provider

Inject a constant value or mock object:

```typescript
const mockCatsService = {
  findAll: () => [],
};

@Module({
  providers: [
    {
      provide: CatsService,
      useValue: mockCatsService,
    },
  ],
})
```

**Use cases:**
- Testing (mocking dependencies)
- Injecting configuration objects
- External libraries

### Class Provider (Alternative Implementation)

```typescript
class ConfigService {
  // Base implementation
}

class DevelopmentConfigService extends ConfigService {
  // Development-specific logic
}

@Module({
  providers: [
    {
      provide: ConfigService,
      useClass: DevelopmentConfigService,
    },
  ],
})
```

### Factory Provider

Create provider dynamically based on other dependencies:

```typescript
@Module({
  providers: [
    {
      provide: 'CONNECTION',
      useFactory: async (config: ConfigService) => {
        const connection = await createConnection(config.getDatabaseConfig());
        return connection;
      },
      inject: [ConfigService],
    },
  ],
})
```

**Key Points:**
- `useFactory` - Function that returns the provider value
- `inject` - Array of dependencies to inject into factory
- Can be async
- Perfect for conditional logic or async initialization

### Alias Provider (Existing)

Create an alias for an existing provider:

```typescript
@Module({
  providers: [
    ConfigService,
    {
      provide: 'AliasedConfigService',
      useExisting: ConfigService,
    },
  ],
})
```

## Custom Provider Tokens

### String Tokens

```typescript
@Module({
  providers: [
    {
      provide: 'API_KEY',
      useValue: 'my-secret-key',
    },
  ],
})

// Inject with @Inject()
@Injectable()
export class ApiService {
  constructor(@Inject('API_KEY') private apiKey: string) {}
}
```

### Symbol Tokens

```typescript
export const API_KEY = Symbol('API_KEY');

@Module({
  providers: [
    {
      provide: API_KEY,
      useValue: 'my-secret-key',
    },
  ],
})

@Injectable()
export class ApiService {
  constructor(@Inject(API_KEY) private apiKey: string) {}
}
```

## Optional Dependencies

```typescript
import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class HttpService {
  constructor(
    @Optional()
    @Inject('HTTP_OPTIONS')
    private httpOptions: HttpOptions
  ) {
    if (!httpOptions) {
      this.httpOptions = defaultOptions;
    }
  }
}
```

## Provider Scopes

### Default (Singleton)

Provider instance shared across entire application:

```typescript
@Injectable()
export class CatsService {}
```

### Request Scope

New instance created for each request:

```typescript
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {}
```

**Use when:**
- Need request-specific data
- Multi-tenancy per request
- Request tracking

**Performance note:** Request-scoped providers have performance implications

### Transient Scope

New instance created each time it's injected:

```typescript
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class CatsService {}
```

## Exporting Providers

Make providers available to other modules:

```typescript
@Module({
  providers: [CatsService],
  exports: [CatsService], // Now available to importing modules
})
export class CatsModule {}

// In another module
@Module({
  imports: [CatsModule],
  controllers: [DogsController], // Can inject CatsService
})
export class DogsModule {}
```

## Async Providers

For providers requiring async initialization:

```typescript
@Module({
  providers: [
    {
      provide: 'ASYNC_CONNECTION',
      useFactory: async () => {
        const connection = await createConnection();
        return connection;
      },
    },
  ],
})
```

## Complete Example

```typescript
// database.providers.ts
export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (config: ConfigService) => {
      const connection = await createConnection({
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
      });
      return connection;
    },
    inject: [ConfigService],
  },
];

// cats.repository.ts
@Injectable()
export class CatsRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private connection: Connection,
  ) {}

  async findAll(): Promise<Cat[]> {
    return this.connection.query('SELECT * FROM cats');
  }

  async create(cat: CreateCatDto): Promise<Cat> {
    return this.connection.insert('cats', cat);
  }
}

// cats.service.ts
@Injectable()
export class CatsService {
  constructor(
    private readonly catsRepository: CatsRepository,
    private readonly logger: Logger,
  ) {}

  async findAll(): Promise<Cat[]> {
    this.logger.log('Finding all cats');
    return this.catsRepository.findAll();
  }

  async create(createCatDto: CreateCatDto): Promise<Cat> {
    this.logger.log('Creating a cat');
    return this.catsRepository.create(createCatDto);
  }
}

// cats.module.ts
@Module({
  providers: [
    ...databaseProviders,
    CatsRepository,
    CatsService,
    Logger,
  ],
  controllers: [CatsController],
  exports: [CatsService], // Available to other modules
})
export class CatsModule {}
```

## Circular Dependencies

Use `forwardRef()` to resolve circular dependencies:

```typescript
// cats.service.ts
@Injectable()
export class CatsService {
  constructor(
    @Inject(forwardRef(() => DogsService))
    private dogsService: DogsService,
  ) {}
}

// dogs.service.ts
@Injectable()
export class DogsService {
  constructor(
    @Inject(forwardRef(() => CatsService))
    private catsService: CatsService,
  ) {}
}
```

## Best Practices

1. **Single Responsibility** - Each service should have one clear purpose
2. **Use constructor injection** - Cleaner than property injection
3. **Prefer singleton scope** - Unless you specifically need request/transient
4. **Export selectively** - Only export what other modules need
5. **Use interfaces** - Define contracts for better testing
6. **Avoid circular dependencies** - Refactor to a shared service if needed
7. **Use factories for complex initialization** - Especially with async operations
8. **Type your providers** - Leverage TypeScript for type safety
9. **Keep services testable** - Inject all dependencies
10. **Use descriptive names** - `UserService`, `AuthService`, not `Service1`

## Common Patterns

### Repository Pattern

```typescript
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }
}
```

### Service Layer Pattern

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.create(dto);
    await this.emailService.sendWelcomeEmail(user.email);
    return user;
  }
}
```

### Factory Pattern

```typescript
@Injectable()
export class CatFactory {
  create(type: string): Cat {
    switch (type) {
      case 'persian':
        return new PersianCat();
      case 'siamese':
        return new SiameseCat();
      default:
        return new Cat();
    }
  }
}
```

## Testing Providers

```typescript
describe('CatsService', () => {
  let service: CatsService;
  let repository: CatsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatsService,
        {
          provide: CatsRepository,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CatsService>(CatsService);
    repository = module.get<CatsRepository>(CatsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```
