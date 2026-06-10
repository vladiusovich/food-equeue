---
name: testing
description: NestJS unit and E2E testing with Test.createTestingModule(), mocking dependencies, testing best practices, and integration testing strategies. Use when writing tests for controllers, services, or full application flows.
---

# NestJS Testing

## When to Use This Skill

Use this skill when:
- Writing unit tests for services, controllers, or providers
- Testing modules with `Test.createTestingModule()`
- Mocking dependencies for isolated testing
- Writing end-to-end (E2E) tests for API endpoints
- Testing guards, interceptors, pipes, or filters
- Setting up test fixtures and test data
- Testing async operations and database interactions
- Implementing test coverage for NestJS applications
- Testing error handling and edge cases

## What is Testing in NestJS?

NestJS provides built-in testing utilities that make it easy to write both unit and integration tests. The framework uses Jest as the default testing framework and provides specialized utilities for creating isolated testing modules.

## Testing Setup

NestJS CLI automatically sets up Jest configuration when creating a new project:

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

**Test Commands:**
```bash
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage
npm run test:e2e       # Run E2E tests
```

## Unit Testing Basics

### Testing a Service

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CatsService } from './cats.service';

describe('CatsService', () => {
  let service: CatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatsService],
    }).compile();

    service = module.get<CatsService>(CatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of cats', () => {
      const result = ['test'];
      expect(service.findAll()).toEqual(result);
    });
  });
});
```

### Test.createTestingModule()

Creates an isolated module for testing with all dependencies:

```typescript
const module: TestingModule = await Test.createTestingModule({
  imports: [ConfigModule],
  controllers: [CatsController],
  providers: [CatsService, CatsRepository],
}).compile();
```

**Key Methods:**
- `compile()` - Instantiates the module and all its dependencies
- `get<T>(token)` - Retrieves an instance from the module
- `overrideProvider()` - Replace a provider with a mock
- `overrideGuard()` - Replace a guard with a mock
- `overrideInterceptor()` - Replace an interceptor with a mock
- `overridePipe()` - Replace a pipe with a mock

## Mocking Dependencies

### Using useValue

Replace a provider with a mock object:

```typescript
describe('CatsService', () => {
  let service: CatsService;
  let repository: CatsRepository;

  beforeEach(async () => {
    const mockRepository = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatsService,
        {
          provide: CatsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CatsService>(CatsService);
    repository = module.get<CatsRepository>(CatsRepository);
  });

  it('should return all cats', async () => {
    const cats = [{ id: 1, name: 'Tom' }];
    jest.spyOn(repository, 'findAll').mockResolvedValue(cats);

    expect(await service.findAll()).toEqual(cats);
    expect(repository.findAll).toHaveBeenCalled();
  });
});
```

### Using useFactory

Create dynamic mocks:

```typescript
const module: TestingModule = await Test.createTestingModule({
  providers: [
    CatsService,
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: () => ({
        query: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
      }),
    },
  ],
}).compile();
```

### Using overrideProvider()

Override a provider after module creation:

```typescript
const module: TestingModule = await Test.createTestingModule({
  providers: [CatsService, CatsRepository],
})
  .overrideProvider(CatsRepository)
  .useValue(mockRepository)
  .compile();
```

## Testing Controllers

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';

describe('CatsController', () => {
  let controller: CatsController;
  let service: CatsService;

  const mockCatsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatsController],
      providers: [
        {
          provide: CatsService,
          useValue: mockCatsService,
        },
      ],
    }).compile();

    controller = module.get<CatsController>(CatsController);
    service = module.get<CatsService>(CatsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const result = [{ id: 1, name: 'Tom', age: 3, breed: 'Persian' }];
      mockCatsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a cat', async () => {
      const dto: CreateCatDto = { name: 'Tom', age: 3, breed: 'Persian' };
      const result = { id: 1, ...dto };

      mockCatsService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('should return a single cat', async () => {
      const result = { id: 1, name: 'Tom', age: 3, breed: 'Persian' };
      mockCatsService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('1')).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });
});
```

## Testing with Dependencies

### Testing Service with Repository

```typescript
describe('CatsService', () => {
  let service: CatsService;
  let repository: Repository<Cat>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatsService,
        {
          provide: getRepositoryToken(Cat),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CatsService>(CatsService);
    repository = module.get<Repository<Cat>>(getRepositoryToken(Cat));
  });

  it('should create a cat', async () => {
    const dto = { name: 'Tom', age: 3, breed: 'Persian' };
    const cat = { id: 1, ...dto };

    mockRepository.create.mockReturnValue(cat);
    mockRepository.save.mockResolvedValue(cat);

    const result = await service.create(dto);

    expect(result).toEqual(cat);
    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalledWith(cat);
  });
});
```

### Testing with Multiple Dependencies

```typescript
describe('CatsService', () => {
  let service: CatsService;
  let repository: CatsRepository;
  let logger: Logger;
  let eventEmitter: EventEmitter2;

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
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CatsService>(CatsService);
    repository = module.get<CatsRepository>(CatsRepository);
    logger = module.get<Logger>(Logger);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should emit event after creating cat', async () => {
    const dto = { name: 'Tom', age: 3, breed: 'Persian' };
    const cat = { id: 1, ...dto };

    jest.spyOn(repository, 'create').mockResolvedValue(cat);

    await service.create(dto);

    expect(logger.log).toHaveBeenCalledWith('Creating cat: Tom');
    expect(eventEmitter.emit).toHaveBeenCalledWith('cat.created', cat);
  });
});
```

## Testing Guards

```typescript
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true when no roles are required', () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { roles: ['user'] },
          }),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should return true when user has required role', () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { roles: ['admin'] },
          }),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should return false when user lacks required role', () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { roles: ['user'] },
          }),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      expect(guard.canActivate(context)).toBe(false);
    });
  });
});
```

## Testing Interceptors

```typescript
import { of } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let logger: Logger;

  beforeEach(() => {
    logger = { log: jest.fn() } as any;
    interceptor = new LoggingInterceptor(logger);
  });

  it('should log before and after', (done) => {
    const context = {
      getClass: () => ({ name: 'TestClass' }),
      getHandler: () => ({ name: 'testMethod' }),
    } as any;

    const next = {
      handle: () => of('test result'),
    };

    interceptor.intercept(context, next).subscribe({
      next: (value) => {
        expect(value).toBe('test result');
        expect(logger.log).toHaveBeenCalledTimes(2);
        done();
      },
    });
  });
});
```

## Testing Pipes

```typescript
import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ParseIntPipe } from './parse-int.pipe';

describe('ParseIntPipe', () => {
  let pipe: ParseIntPipe;

  beforeEach(() => {
    pipe = new ParseIntPipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('transform', () => {
    it('should convert string to number', () => {
      const metadata: ArgumentMetadata = {
        type: 'param',
        metatype: Number,
        data: 'id',
      };

      expect(pipe.transform('123', metadata)).toBe(123);
    });

    it('should throw error for invalid number', () => {
      const metadata: ArgumentMetadata = {
        type: 'param',
        metatype: Number,
        data: 'id',
      };

      expect(() => pipe.transform('abc', metadata)).toThrow(BadRequestException);
    });
  });
});
```

## E2E Testing

End-to-end tests verify the entire application flow:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('CatsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/cats (GET)', () => {
    return request(app.getHttpServer())
      .get('/cats')
      .expect(200)
      .expect([]);
  });

  it('/cats (POST)', () => {
    return request(app.getHttpServer())
      .post('/cats')
      .send({ name: 'Tom', age: 3, breed: 'Persian' })
      .expect(201)
      .expect((res) => {
        expect(res.body.name).toBe('Tom');
        expect(res.body.id).toBeDefined();
      });
  });

  it('/cats/:id (GET)', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/cats')
      .send({ name: 'Tom', age: 3, breed: 'Persian' });

    const catId = createResponse.body.id;

    return request(app.getHttpServer())
      .get(`/cats/${catId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(catId);
        expect(res.body.name).toBe('Tom');
      });
  });
});
```

## Testing with Database

### Using In-Memory Database

```typescript
describe('CatsService (Integration)', () => {
  let service: CatsService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Cat],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Cat]),
      ],
      providers: [CatsService],
    }).compile();

    service = module.get<CatsService>(CatsService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should create and retrieve a cat', async () => {
    const dto = { name: 'Tom', age: 3, breed: 'Persian' };
    const created = await service.create(dto);

    expect(created.id).toBeDefined();

    const found = await service.findOne(created.id);
    expect(found.name).toBe(dto.name);
  });
});
```

### Cleaning Up Database Between Tests

```typescript
beforeEach(async () => {
  await repository.clear();
});

afterEach(async () => {
  await repository.clear();
});
```

## Testing Async Operations

```typescript
describe('CatsService', () => {
  it('should handle async operations', async () => {
    const result = await service.findAll();
    expect(result).toEqual(expectedResult);
  });

  it('should handle promises', () => {
    return service.findOne('1').then((result) => {
      expect(result).toBeDefined();
    });
  });

  it('should handle errors', async () => {
    jest.spyOn(repository, 'findOne').mockRejectedValue(new Error('Not found'));

    await expect(service.findOne('999')).rejects.toThrow('Not found');
  });
});
```

## Testing Error Handling

```typescript
describe('CatsService error handling', () => {
  it('should throw NotFoundException when cat not found', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(null);

    await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for invalid data', async () => {
    const dto = { name: '', age: -1, breed: '' };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('should handle database errors', async () => {
    jest.spyOn(repository, 'save').mockRejectedValue(new Error('DB Error'));

    await expect(service.create(validDto)).rejects.toThrow('DB Error');
  });
});
```

## Testing Best Practices

1. **Arrange-Act-Assert (AAA) Pattern**
   ```typescript
   it('should create a cat', async () => {
     // Arrange
     const dto = { name: 'Tom', age: 3, breed: 'Persian' };
     jest.spyOn(repository, 'create').mockReturnValue(dto);

     // Act
     const result = await service.create(dto);

     // Assert
     expect(result).toEqual(dto);
     expect(repository.create).toHaveBeenCalledWith(dto);
   });
   ```

2. **Clear Mocks Between Tests**
   ```typescript
   afterEach(() => {
     jest.clearAllMocks();
   });
   ```

3. **Test One Thing Per Test**
   ```typescript
   // Good
   it('should create a cat', async () => {
     const result = await service.create(dto);
     expect(result).toBeDefined();
   });

   it('should emit event after creating cat', async () => {
     await service.create(dto);
     expect(eventEmitter.emit).toHaveBeenCalled();
   });

   // Bad - testing multiple things
   it('should create a cat and emit event', async () => {
     const result = await service.create(dto);
     expect(result).toBeDefined();
     expect(eventEmitter.emit).toHaveBeenCalled();
   });
   ```

4. **Use Descriptive Test Names**
   ```typescript
   // Good
   it('should throw NotFoundException when cat does not exist', () => {});

   // Bad
   it('should throw error', () => {});
   ```

5. **Mock External Dependencies**
   ```typescript
   const mockHttpService = {
     get: jest.fn(),
     post: jest.fn(),
   };
   ```

6. **Use Test Fixtures**
   ```typescript
   const createMockCat = (overrides = {}): Cat => ({
     id: 1,
     name: 'Tom',
     age: 3,
     breed: 'Persian',
     ...overrides,
   });
   ```

7. **Test Edge Cases**
   ```typescript
   it('should handle empty array', () => {});
   it('should handle null values', () => {});
   it('should handle undefined', () => {});
   it('should handle large datasets', () => {});
   ```

8. **Keep Tests Independent**
   ```typescript
   // Each test should be able to run independently
   beforeEach(async () => {
     // Reset state for each test
   });
   ```

9. **Use Coverage as a Guide**
   ```bash
   npm run test:cov
   ```

10. **Test Public APIs Only**
    ```typescript
    // Test public methods, not private implementation details
    it('should return all cats', () => {
      // Test public findAll() method
    });
    ```

## Common Testing Patterns

### Factory Functions

```typescript
const createMockService = () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});
```

### Shared Test Setup

```typescript
const setupTestModule = async () => {
  const module = await Test.createTestingModule({
    providers: [CatsService, mockRepository],
  }).compile();

  return {
    service: module.get<CatsService>(CatsService),
    repository: module.get(CatsRepository),
  };
};
```

### Custom Matchers

```typescript
expect.extend({
  toBeCat(received) {
    const pass = received.hasOwnProperty('name') &&
                 received.hasOwnProperty('age');
    return { pass, message: () => 'Expected object to be a Cat' };
  },
});
```
