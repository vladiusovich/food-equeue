---
name: caching
description: NestJS caching with cache module, in-memory caching, Redis integration, cache interceptor, and TTL management. Use when implementing performance optimization, reducing database queries, or storing temporary data.
---

# NestJS Caching

## When to Use This Skill

Use this skill when:
- Improving application performance
- Reducing database load
- Caching API responses
- Storing frequently accessed data
- Implementing Redis caching
- Setting up cache invalidation
- Using cache interceptors for automatic caching
- Managing cache TTL (Time To Live)

## What is Caching?

Caching stores frequently accessed data in memory to reduce expensive operations like database queries or external API calls. NestJS provides a built-in cache module that supports in-memory caching and Redis.

## Installation

For in-memory caching:
```bash
npm install @nestjs/cache-manager cache-manager
```

For Redis caching:
```bash
npm install @nestjs/cache-manager cache-manager
npm install cache-manager-redis-yet redis
```

## Basic In-Memory Caching

### Setup Cache Module

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 5000, // milliseconds
      max: 100, // maximum number of items in cache
    }),
  ],
})
export class AppModule {}
```

### Using Cache Service

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getUser(id: string) {
    // Check cache first
    const cachedUser = await this.cacheManager.get(`user:${id}`);
    if (cachedUser) {
      return cachedUser;
    }

    // If not in cache, fetch from database
    const user = await this.usersRepository.findOne(id);

    // Store in cache
    await this.cacheManager.set(`user:${id}`, user, 60000); // 60 seconds

    return user;
  }

  async updateUser(id: string, data: any) {
    const user = await this.usersRepository.update(id, data);

    // Invalidate cache
    await this.cacheManager.del(`user:${id}`);

    return user;
  }

  async clearAllUsers() {
    // Clear entire cache
    await this.cacheManager.reset();
  }
}
```

## Cache Interceptor

Use `CacheInterceptor` to automatically cache responses:

```typescript
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('users')
@UseInterceptors(CacheInterceptor)
export class UsersController {
  // This response will be cached automatically
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Cache specific endpoint
  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
```

### Global Cache Interceptor

```typescript
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule.register({ isGlobal: true })],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
```

## Custom Cache Key

Create custom cache keys:

```typescript
import { Controller, Get, CacheKey } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('users')
@UseInterceptors(CacheInterceptor)
export class UsersController {
  @Get()
  @CacheKey('all_users')
  findAll() {
    return this.usersService.findAll();
  }
}
```

## Custom TTL per Endpoint

```typescript
import { Controller, Get, CacheTTL } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('users')
@UseInterceptors(CacheInterceptor)
export class UsersController {
  @Get()
  @CacheTTL(60000) // 60 seconds
  findAll() {
    return this.usersService.findAll();
  }

  @Get('popular')
  @CacheTTL(300000) // 5 minutes
  getPopular() {
    return this.usersService.getPopular();
  }
}
```

## Redis Caching

### Setup Redis Cache

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: 'localhost',
            port: 6379,
          },
          ttl: 5000,
        }),
      }),
    }),
  ],
})
export class AppModule {}
```

### Redis with ConfigService

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
          },
          password: configService.get('REDIS_PASSWORD'),
          ttl: configService.get('CACHE_TTL', 5000),
        }),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## Cache Methods

### Set Cache

```typescript
// Set with default TTL
await this.cacheManager.set('key', 'value');

// Set with custom TTL (milliseconds)
await this.cacheManager.set('key', 'value', 60000);

// Set without TTL (never expires)
await this.cacheManager.set('key', 'value', 0);
```

### Get Cache

```typescript
const value = await this.cacheManager.get('key');

if (!value) {
  // Key doesn't exist or expired
}
```

### Delete Cache

```typescript
// Delete specific key
await this.cacheManager.del('key');

// Delete multiple keys
await this.cacheManager.del(['key1', 'key2', 'key3']);
```

### Reset Cache

```typescript
// Clear all cache
await this.cacheManager.reset();
```

### Wrap Function

Cache result of async function:

```typescript
const value = await this.cacheManager.wrap('key', async () => {
  // This function only runs if key is not in cache
  return await this.expensiveOperation();
});
```

## Cache Patterns

### Cache-Aside (Lazy Loading)

```typescript
async getProduct(id: string) {
  const cacheKey = `product:${id}`;

  // Try to get from cache
  let product = await this.cacheManager.get(cacheKey);

  if (!product) {
    // Not in cache, fetch from database
    product = await this.productsRepository.findOne(id);

    if (product) {
      // Store in cache
      await this.cacheManager.set(cacheKey, product, 300000);
    }
  }

  return product;
}
```

### Write-Through

```typescript
async updateProduct(id: string, data: any) {
  const cacheKey = `product:${id}`;

  // Update database
  const product = await this.productsRepository.update(id, data);

  // Update cache immediately
  await this.cacheManager.set(cacheKey, product, 300000);

  return product;
}
```

### Write-Behind (Write-Back)

```typescript
async updateProduct(id: string, data: any) {
  const cacheKey = `product:${id}`;

  // Update cache immediately
  await this.cacheManager.set(cacheKey, data, 300000);

  // Queue database update (async)
  this.eventEmitter.emit('product.update', { id, data });

  return data;
}
```

### Cache Invalidation

```typescript
async deleteProduct(id: string) {
  const cacheKey = `product:${id}`;

  // Delete from database
  await this.productsRepository.delete(id);

  // Invalidate cache
  await this.cacheManager.del(cacheKey);

  // Invalidate related caches
  await this.cacheManager.del([
    `product:${id}`,
    `products:all`,
    `products:category:${product.categoryId}`,
  ]);
}
```

## Custom Cache Interceptor

Create a custom interceptor with advanced logic:

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CustomCacheInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = this.generateCacheKey(request);

    // Check cache
    const cachedResponse = await this.cacheManager.get(cacheKey);
    if (cachedResponse) {
      return of(cachedResponse);
    }

    // Execute handler and cache response
    return next.handle().pipe(
      tap(async (response) => {
        await this.cacheManager.set(cacheKey, response, 60000);
      }),
    );
  }

  private generateCacheKey(request: any): string {
    const { url, query, user } = request;
    return `${url}:${JSON.stringify(query)}:${user?.id || 'anonymous'}`;
  }
}
```

## Conditional Caching

Cache only successful responses:

```typescript
@Injectable()
export class ConditionalCacheInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const cacheKey = this.getCacheKey(context);
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return of(cached);
    }

    return next.handle().pipe(
      tap(async (response) => {
        // Only cache if response is successful
        if (response && !response.error) {
          await this.cacheManager.set(cacheKey, response, 60000);
        }
      }),
    );
  }

  private getCacheKey(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    return `${request.method}:${request.url}`;
  }
}
```

## Cache Warming

Pre-populate cache with frequently accessed data:

```typescript
import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheWarmingService implements OnModuleInit {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private productsService: ProductsService,
  ) {}

  async onModuleInit() {
    await this.warmCache();
  }

  async warmCache() {
    // Load popular products
    const popularProducts = await this.productsService.getPopular();
    await this.cacheManager.set('products:popular', popularProducts, 3600000);

    // Load categories
    const categories = await this.productsService.getCategories();
    await this.cacheManager.set('categories:all', categories, 3600000);
  }
}
```

## Testing with Cache

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('UsersService', () => {
  let service: UsersService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            reset: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should get user from cache', async () => {
    const user = { id: '1', name: 'John' };
    jest.spyOn(cacheManager, 'get').mockResolvedValue(user);

    const result = await service.getUser('1');

    expect(cacheManager.get).toHaveBeenCalledWith('user:1');
    expect(result).toEqual(user);
  });

  it('should set user in cache', async () => {
    const user = { id: '1', name: 'John' };

    await service.cacheUser(user);

    expect(cacheManager.set).toHaveBeenCalledWith('user:1', user, 60000);
  });
});
```

## Cache Configuration Options

```typescript
CacheModule.register({
  // Global module
  isGlobal: true,

  // Default TTL in milliseconds
  ttl: 5000,

  // Maximum number of items
  max: 100,

  // Store type
  store: 'memory', // or custom store

  // Custom store options
  isCacheableValue: (value) => value !== null && value !== undefined,
})
```

## Best Practices

1. **Set appropriate TTL** - Balance between freshness and performance
2. **Use cache keys wisely** - Create unique, meaningful keys
3. **Invalidate on updates** - Clear cache when data changes
4. **Monitor cache hit rate** - Track cache effectiveness
5. **Handle cache failures** - Gracefully handle Redis disconnections
6. **Use Redis for production** - In-memory only for development
7. **Cache immutable data** - Prefer caching data that doesn't change often
8. **Avoid caching user-specific data globally** - Use session or request-scoped caching
9. **Implement cache warming** - Pre-load frequently accessed data
10. **Set cache size limits** - Prevent memory issues

## Common Use Cases

### API Response Caching
```typescript
@Get('products')
@UseInterceptors(CacheInterceptor)
@CacheTTL(300000) // 5 minutes
getProducts() {
  return this.productsService.findAll();
}
```

### Database Query Caching
```typescript
async findAll() {
  return this.cacheManager.wrap('products:all', async () => {
    return this.productsRepository.find();
  });
}
```

### Third-Party API Caching
```typescript
async getExchangeRate(currency: string) {
  const cacheKey = `exchange:${currency}`;

  return this.cacheManager.wrap(cacheKey, async () => {
    const response = await this.httpService.get(`/rates/${currency}`);
    return response.data;
  }, 3600000); // 1 hour
}
```

### Session Caching
```typescript
async getUserSession(sessionId: string) {
  return this.cacheManager.get(`session:${sessionId}`);
}

async setUserSession(sessionId: string, data: any) {
  await this.cacheManager.set(`session:${sessionId}`, data, 1800000); // 30 min
}
```

## Cache Eviction Strategies

### LRU (Least Recently Used)
Most common strategy - removes least recently used items when cache is full.

### TTL-based
Items expire after specified time.

### Manual Invalidation
Explicitly remove items when data changes.

### Pattern-based Invalidation
```typescript
async invalidateProductCaches(productId: string) {
  const keys = [
    `product:${productId}`,
    'products:all',
    'products:featured',
  ];

  await Promise.all(keys.map(key => this.cacheManager.del(key)));
}
```
