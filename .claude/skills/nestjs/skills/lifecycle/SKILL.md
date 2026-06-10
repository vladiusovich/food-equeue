---
name: lifecycle
description: NestJS lifecycle events and hooks for modules and providers. Use when implementing OnModuleInit, OnModuleDestroy, OnApplicationBootstrap, OnApplicationShutdown, or managing application startup and shutdown logic.
---

# NestJS Lifecycle Events

## When to Use This Skill

Use this skill when:
- Implementing initialization logic for providers or modules
- Setting up database connections at startup
- Cleaning up resources at shutdown
- Running code after application bootstrap
- Gracefully shutting down services
- Managing connection pools, caches, or external services
- Implementing health checks on startup
- Registering event listeners or schedulers
- Pre-warming caches or performing initial data loads
- Handling application lifecycle in microservices

## What are Lifecycle Events?

Lifecycle events (hooks) are methods that are called at specific points during the application lifecycle. They allow you to run initialization, cleanup, and shutdown logic at the appropriate times.

## Application Lifecycle Order

```
Application Initialization
    ↓
1. onModuleInit()        - Module initialized
    ↓
2. onApplicationBootstrap() - Application fully started
    ↓
Application Running...
    ↓
3. onModuleDestroy()     - Module cleanup (on shutdown signal)
    ↓
4. beforeApplicationShutdown() - Before app shutdown
    ↓
5. onApplicationShutdown() - Application shutting down
    ↓
Application Terminated
```

## Lifecycle Hooks Overview

| Hook | Called When | Use For |
|------|-------------|---------|
| `onModuleInit()` | Module dependencies resolved | Initialize connections, setup |
| `onApplicationBootstrap()` | After all modules initialized | Final setup, pre-warming |
| `onModuleDestroy()` | Before module destroyed | Cleanup module resources |
| `beforeApplicationShutdown()` | Before shutdown signal | Critical cleanup operations |
| `onApplicationShutdown()` | After shutdown signal received | Final cleanup |

## OnModuleInit

Called after the module's dependencies have been resolved but before the application is fully bootstrapped.

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class CatsService implements OnModuleInit {
  onModuleInit() {
    console.log('CatsService initialized');
  }
}
```

### Async Initialization

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private connection: Connection;

  async onModuleInit() {
    this.connection = await createConnection({
      host: 'localhost',
      port: 5432,
    });
    console.log('Database connection established');
  }
}
```

### Use Cases

- Establishing database connections
- Initializing cache connections (Redis, Memcached)
- Setting up message queue connections
- Loading configuration
- Registering event listeners
- Validating environment variables

### Complete Example

```typescript
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: RedisClient;
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      this.client = await createRedisClient({
        host: this.configService.get('REDIS_HOST'),
        port: this.configService.get('REDIS_PORT'),
      });

      this.logger.log('Redis connection established');

      this.client.on('error', (err) => {
        this.logger.error('Redis error:', err);
      });
    } catch (error) {
      this.logger.error('Failed to connect to Redis', error);
      throw error;
    }
  }

  getClient(): RedisClient {
    return this.client;
  }
}
```

## OnApplicationBootstrap

Called after all modules have been initialized, right before the application starts listening for connections.

```typescript
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class CatsService implements OnApplicationBootstrap {
  onApplicationBootstrap() {
    console.log('Application has fully started');
  }
}
```

### Async Bootstrap

```typescript
import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';

@Injectable()
export class CacheWarmupService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CacheWarmupService.name);

  constructor(
    private cacheService: CacheService,
    private dataService: DataService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Warming up cache...');

    const data = await this.dataService.getFrequentlyAccessedData();
    await this.cacheService.set('popular_items', data);

    this.logger.log('Cache warmup completed');
  }
}
```

### Use Cases

- Pre-warming caches
- Running health checks
- Registering scheduled tasks
- Starting background workers
- Performing initial data synchronization
- Sending application startup notifications
- Initializing feature flags

### Complete Example

```typescript
import {
  Injectable,
  OnApplicationBootstrap,
  Logger,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class TaskSchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TaskSchedulerService.name);

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private taskService: TaskService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Initializing scheduled tasks...');

    const job = new CronJob('0 0 * * *', () => {
      this.taskService.runDailyCleanup();
    });

    this.schedulerRegistry.addCronJob('daily-cleanup', job);
    job.start();

    this.logger.log('Scheduled tasks initialized');
  }
}
```

## OnModuleDestroy

Called when the module is being destroyed (during application shutdown).

```typescript
import { Injectable, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class CatsService implements OnModuleDestroy {
  onModuleDestroy() {
    console.log('CatsService is being destroyed');
  }
}
```

### Async Cleanup

```typescript
import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private connection: Connection;

  async onModuleDestroy() {
    this.logger.log('Closing database connection...');
    await this.connection.close();
    this.logger.log('Database connection closed');
  }
}
```

### Use Cases

- Closing database connections
- Disconnecting from message queues
- Cleaning up file handles
- Stopping background tasks
- Unregistering event listeners
- Releasing resources

### Complete Example

```typescript
import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
  private connection: Connection;
  private channel: Channel;
  private readonly logger = new Logger(RabbitMQService.name);

  async onModuleDestroy() {
    this.logger.log('Shutting down RabbitMQ connection...');

    try {
      if (this.channel) {
        await this.channel.close();
        this.logger.log('RabbitMQ channel closed');
      }

      if (this.connection) {
        await this.connection.close();
        this.logger.log('RabbitMQ connection closed');
      }
    } catch (error) {
      this.logger.error('Error during RabbitMQ shutdown', error);
    }
  }
}
```

## OnApplicationShutdown

Called when the application receives a termination signal (SIGTERM, SIGINT).

```typescript
import { Injectable, OnApplicationShutdown } from '@nestjs/common';

@Injectable()
export class CatsService implements OnApplicationShutdown {
  onApplicationShutdown(signal?: string) {
    console.log(`Application shutting down with signal: ${signal}`);
  }
}
```

### Graceful Shutdown

```typescript
import { Injectable, OnApplicationShutdown, Logger } from '@nestjs/common';

@Injectable()
export class WorkerService implements OnApplicationShutdown {
  private readonly logger = new Logger(WorkerService.name);
  private isShuttingDown = false;
  private activeJobs = 0;

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Shutdown signal received: ${signal}`);
    this.isShuttingDown = true;

    while (this.activeJobs > 0) {
      this.logger.log(`Waiting for ${this.activeJobs} jobs to complete...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    this.logger.log('All jobs completed, safe to shutdown');
  }
}
```

### Use Cases

- Completing in-progress requests
- Flushing logs or metrics
- Saving application state
- Notifying external systems of shutdown
- Graceful worker termination
- Final cleanup operations

### Complete Example

```typescript
import {
  Injectable,
  OnApplicationShutdown,
  Logger,
} from '@nestjs/common';

@Injectable()
export class MetricsService implements OnApplicationShutdown {
  private readonly logger = new Logger(MetricsService.name);
  private metricsBuffer: Metric[] = [];

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Flushing metrics before shutdown (${signal})...`);

    if (this.metricsBuffer.length > 0) {
      try {
        await this.sendMetrics(this.metricsBuffer);
        this.logger.log(`${this.metricsBuffer.length} metrics flushed`);
      } catch (error) {
        this.logger.error('Failed to flush metrics', error);
      }
    }
  }

  private async sendMetrics(metrics: Metric[]): Promise<void> {
    // Send to monitoring service
  }
}
```

## BeforeApplicationShutdown

Called before `onApplicationShutdown`, useful for cleanup that must happen before shutdown handlers.

```typescript
import { Injectable, BeforeApplicationShutdown } from '@nestjs/common';

@Injectable()
export class CatsService implements BeforeApplicationShutdown {
  beforeApplicationShutdown(signal?: string) {
    console.log(`Preparing for shutdown: ${signal}`);
  }
}
```

## Enabling Shutdown Hooks

By default, shutdown hooks are disabled. Enable them in main.ts:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable shutdown hooks
  app.enableShutdownHooks();

  await app.listen(3000);
}
bootstrap();
```

**Important:** Enabling shutdown hooks consumes memory. Only enable if you need lifecycle hooks for shutdown.

## Multiple Lifecycle Hooks

A class can implement multiple lifecycle interfaces:

```typescript
import {
  Injectable,
  OnModuleInit,
  OnApplicationBootstrap,
  OnModuleDestroy,
  OnApplicationShutdown,
  Logger,
} from '@nestjs/common';

@Injectable()
export class LifecycleService
  implements
    OnModuleInit,
    OnApplicationBootstrap,
    OnModuleDestroy,
    OnApplicationShutdown
{
  private readonly logger = new Logger(LifecycleService.name);

  onModuleInit() {
    this.logger.log('Module initialized');
  }

  onApplicationBootstrap() {
    this.logger.log('Application bootstrapped');
  }

  onModuleDestroy() {
    this.logger.log('Module destroyed');
  }

  onApplicationShutdown(signal?: string) {
    this.logger.log(`Application shutdown (${signal})`);
  }
}
```

## Lifecycle in Modules

Modules can also implement lifecycle hooks:

```typescript
import { Module, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule implements OnModuleInit, OnModuleDestroy {
  constructor(private catsService: CatsService) {}

  onModuleInit() {
    console.log('CatsModule initialized');
  }

  onModuleDestroy() {
    console.log('CatsModule destroyed');
  }
}
```

## Practical Examples

### Database Connection Management

```typescript
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.logger.log('Initializing database connection pool...');

    this.pool = new Pool({
      host: this.configService.get('DB_HOST'),
      port: this.configService.get('DB_PORT'),
      user: this.configService.get('DB_USER'),
      password: this.configService.get('DB_PASSWORD'),
      database: this.configService.get('DB_NAME'),
      max: 20,
      idleTimeoutMillis: 30000,
    });

    await this.pool.connect();
    this.logger.log('Database connection pool ready');
  }

  async onModuleDestroy() {
    this.logger.log('Closing database connection pool...');
    await this.pool.end();
    this.logger.log('Database connection pool closed');
  }

  getPool(): Pool {
    return this.pool;
  }
}
```

### Cache Pre-warming

```typescript
import {
  Injectable,
  OnApplicationBootstrap,
  Logger,
} from '@nestjs/common';

@Injectable()
export class CachePrewarmService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CachePrewarmService.name);

  constructor(
    private cacheService: CacheService,
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Starting cache pre-warming...');

    const startTime = Date.now();

    await Promise.all([
      this.warmPopularProducts(),
      this.warmCategories(),
      this.warmFeaturedItems(),
    ]);

    const duration = Date.now() - startTime;
    this.logger.log(`Cache pre-warming completed in ${duration}ms`);
  }

  private async warmPopularProducts() {
    const products = await this.productsService.getPopular(100);
    await this.cacheService.set('popular_products', products, 3600);
  }

  private async warmCategories() {
    const categories = await this.categoriesService.findAll();
    await this.cacheService.set('categories', categories, 7200);
  }

  private async warmFeaturedItems() {
    const featured = await this.productsService.getFeatured();
    await this.cacheService.set('featured_items', featured, 1800);
  }
}
```

### Graceful Shutdown with Queue Processing

```typescript
import {
  Injectable,
  OnApplicationShutdown,
  Logger,
} from '@nestjs/common';

@Injectable()
export class QueueService implements OnApplicationShutdown {
  private readonly logger = new Logger(QueueService.name);
  private isShuttingDown = false;
  private processingCount = 0;

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Shutdown initiated (${signal})`);
    this.isShuttingDown = true;

    if (this.processingCount > 0) {
      this.logger.log(
        `Waiting for ${this.processingCount} items to complete...`,
      );

      await this.waitForCompletion(30000);
    }

    this.logger.log('Queue processing stopped');
  }

  private async waitForCompletion(timeout: number): Promise<void> {
    const startTime = Date.now();

    while (this.processingCount > 0) {
      if (Date.now() - startTime > timeout) {
        this.logger.warn(
          `Shutdown timeout reached, ${this.processingCount} items still processing`,
        );
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  async processItem(item: any) {
    if (this.isShuttingDown) {
      throw new Error('Service is shutting down');
    }

    this.processingCount++;
    try {
      // Process item
    } finally {
      this.processingCount--;
    }
  }
}
```

### Health Check on Startup

```typescript
import {
  Injectable,
  OnApplicationBootstrap,
  Logger,
} from '@nestjs/common';

@Injectable()
export class HealthCheckService implements OnApplicationBootstrap {
  private readonly logger = new Logger(HealthCheckService.name);

  constructor(
    private databaseService: DatabaseService,
    private redisService: RedisService,
    private externalApiService: ExternalApiService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Running startup health checks...');

    const checks = [
      this.checkDatabase(),
      this.checkRedis(),
      this.checkExternalApi(),
    ];

    const results = await Promise.allSettled(checks);

    results.forEach((result, index) => {
      const checkName = ['Database', 'Redis', 'External API'][index];

      if (result.status === 'fulfilled') {
        this.logger.log(`✓ ${checkName} check passed`);
      } else {
        this.logger.error(`✗ ${checkName} check failed: ${result.reason}`);
      }
    });

    const failedChecks = results.filter((r) => r.status === 'rejected');

    if (failedChecks.length > 0) {
      throw new Error('Startup health checks failed');
    }

    this.logger.log('All health checks passed');
  }

  private async checkDatabase(): Promise<void> {
    await this.databaseService.query('SELECT 1');
  }

  private async checkRedis(): Promise<void> {
    await this.redisService.ping();
  }

  private async checkExternalApi(): Promise<void> {
    await this.externalApiService.healthCheck();
  }
}
```

## Best Practices

1. **Use async/await** - Lifecycle hooks support async operations
   ```typescript
   async onModuleInit() {
     await this.initialize();
   }
   ```

2. **Log lifecycle events** - Aid in debugging and monitoring
   ```typescript
   private readonly logger = new Logger(ServiceName.name);

   onModuleInit() {
     this.logger.log('Service initialized');
   }
   ```

3. **Handle errors gracefully** - Don't let lifecycle hooks crash the app
   ```typescript
   async onModuleInit() {
     try {
       await this.connect();
     } catch (error) {
       this.logger.error('Initialization failed', error);
       throw error;
     }
   }
   ```

4. **Clean up resources** - Always implement cleanup hooks
   ```typescript
   async onModuleDestroy() {
     await this.connection.close();
   }
   ```

5. **Set timeouts for shutdown** - Don't wait forever
   ```typescript
   async onApplicationShutdown() {
     await Promise.race([
       this.cleanup(),
       new Promise((_, reject) =>
         setTimeout(() => reject(new Error('Timeout')), 10000)
       ),
     ]);
   }
   ```

6. **Only enable shutdown hooks when needed** - They consume memory
   ```typescript
   app.enableShutdownHooks(); // Only if necessary
   ```

7. **Order matters** - Modules initialize in dependency order
   ```typescript
   // DatabaseModule initializes before CatsModule
   @Module({
     imports: [DatabaseModule],
   })
   export class CatsModule {}
   ```

8. **Test lifecycle hooks** - Include in unit tests
   ```typescript
   it('should initialize on module init', async () => {
     await service.onModuleInit();
     expect(service.isInitialized()).toBe(true);
   });
   ```

9. **Use for side effects only** - Keep business logic in methods
   ```typescript
   // Good
   onModuleInit() {
     this.connect();
   }

   // Bad - business logic in lifecycle hook
   onModuleInit() {
     this.processAllUsers();
   }
   ```

10. **Document initialization requirements** - Be clear about dependencies
    ```typescript
    /**
     * Requires DATABASE_URL environment variable
     * Connects on module initialization
     */
    async onModuleInit() {
      await this.connect();
    }
    ```

## Common Patterns

### Retry Logic on Initialization

```typescript
async onModuleInit() {
  let retries = 3;
  while (retries > 0) {
    try {
      await this.connect();
      break;
    } catch (error) {
      retries--;
      if (retries === 0) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
```

### Conditional Initialization

```typescript
async onModuleInit() {
  const environment = this.configService.get('NODE_ENV');

  if (environment === 'production') {
    await this.initializeMonitoring();
  }
}
```

### Dependency Validation

```typescript
onModuleInit() {
  if (!this.configService.get('API_KEY')) {
    throw new Error('API_KEY is required');
  }
}
```
