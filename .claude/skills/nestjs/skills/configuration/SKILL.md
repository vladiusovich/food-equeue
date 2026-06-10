---
name: configuration
description: NestJS configuration management using @nestjs/config module, environment variables, configuration validation, and custom configuration files. Use when managing application settings, environment-specific configs, or validating configuration values.
---

# NestJS Configuration

## When to Use This Skill

Use this skill when:
- Managing environment variables
- Setting up application configuration
- Validating configuration values
- Creating custom configuration files
- Working with different environments (dev, staging, production)
- Organizing configuration namespaces
- Using type-safe configuration

## What is Configuration?

The `@nestjs/config` module provides a ConfigService that loads environment variables from `.env` files and provides a centralized way to access configuration throughout your application.

## Installation

```bash
npm install @nestjs/config
```

For validation:
```bash
npm install joi
npm install --save-dev @types/joi
```

## Basic Setup

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

**Key Points:**
- `isGlobal: true` - Makes ConfigModule available everywhere
- Automatically loads `.env` file from root directory
- Environment variables accessible via `ConfigService`

## Using ConfigService

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getDatabaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL');
  }

  getPort(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  // Non-nullable value (throws if not found)
  getApiKey(): string {
    return this.configService.getOrThrow<string>('API_KEY');
  }
}
```

## Environment File (.env)

```bash
# .env
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
PORT=3000
API_KEY=secret-key
JWT_SECRET=jwt-secret-key
```

## Custom Configuration Files

Create namespaced configuration:

```typescript
// config/database.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
}));
```

```typescript
// config/app.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api',
}));
```

Register custom configurations:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
    }),
  ],
})
export class AppModule {}
```

Access namespaced configuration:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService {
  constructor(private configService: ConfigService) {}

  getConnectionOptions() {
    const host = this.configService.get<string>('database.host');
    const port = this.configService.get<number>('database.port');

    // Alternative: get entire namespace
    const dbConfig = this.configService.get('database');

    return dbConfig;
  }
}
```

## Configuration Validation

Using Joi for schema validation:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        API_KEY: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().default('1h'),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
  ],
})
export class AppModule {}
```

**Validation Options:**
- `allowUnknown` - Allow environment variables not in schema
- `abortEarly` - Stop validation on first error (false = report all errors)

## Custom Validation with class-validator

```typescript
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  API_KEY: string;
}

function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    { enableImplicitConversion: true },
  );

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
  ],
})
export class AppModule {}
```

## Configuration Options

```typescript
ConfigModule.forRoot({
  // Make module global
  isGlobal: true,

  // Custom .env file path
  envFilePath: '.env.development',

  // Multiple env files (priority order)
  envFilePath: ['.env.local', '.env'],

  // Ignore .env file
  ignoreEnvFile: true,

  // Load custom configuration files
  load: [databaseConfig, appConfig],

  // Validation schema
  validationSchema: Joi.object({...}),

  // Validation options
  validationOptions: {
    allowUnknown: true,
    abortEarly: false,
  },

  // Custom validate function
  validate: (config) => config,

  // Expand environment variables
  expandVariables: true,

  // Cache configuration values
  cache: true,
})
```

## Type-Safe Configuration

Create configuration interface:

```typescript
// config/configuration.interface.ts
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface AppConfig {
  port: number;
  environment: string;
  apiPrefix: string;
}

export interface Configuration {
  database: DatabaseConfig;
  app: AppConfig;
}
```

Use with ConfigService:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from './config/configuration.interface';

@Injectable()
export class DatabaseService {
  constructor(private configService: ConfigService) {}

  getConfig(): DatabaseConfig {
    return this.configService.get<DatabaseConfig>('database');
  }
}
```

## Async Configuration

Load configuration asynchronously:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        host: configService.get('database.host'),
        port: configService.get('database.port'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## Conditional Module Loading

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  providers: [
    {
      provide: 'CACHE_MODULE',
      useFactory: (configService: ConfigService) => {
        const cacheEnabled = configService.get<boolean>('CACHE_ENABLED');
        return cacheEnabled ? CacheModule : null;
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
```

## Environment-Specific Files

```typescript
const envFilePath = `.env.${process.env.NODE_ENV || 'development'}`;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
  ],
})
export class AppModule {}
```

Files structure:
- `.env.development`
- `.env.staging`
- `.env.production`
- `.env.test`

## Expanding Variables

Enable variable expansion in .env files:

```bash
# .env
DATABASE_USER=postgres
DATABASE_PASSWORD=secret
DATABASE_NAME=mydb
DATABASE_URL=postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@localhost:5432/${DATABASE_NAME}
```

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
  ],
})
export class AppModule {}
```

## Testing Configuration

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('ConfigService', () => {
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          load: [
            () => ({
              DATABASE_URL: 'postgresql://localhost:5432/test',
              PORT: 3000,
            }),
          ],
        }),
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
  });

  it('should get database URL', () => {
    expect(configService.get('DATABASE_URL')).toBe(
      'postgresql://localhost:5432/test',
    );
  });
});
```

## Best Practices

1. **Use validation** - Always validate configuration on startup
2. **Type safety** - Use TypeScript interfaces for configuration
3. **Default values** - Provide sensible defaults
4. **Required values** - Use `getOrThrow()` for critical config
5. **Namespace configuration** - Organize related configs together
6. **Don't commit .env** - Add to `.gitignore`
7. **Document variables** - Provide `.env.example` file
8. **Use secrets management** - For production sensitive data
9. **Cache configuration** - Enable caching for performance
10. **Global module** - Set `isGlobal: true` for convenience

## Common Patterns

### Database Configuration
```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
}));
```

### JWT Configuration
```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRATION || '1h',
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
}));
```

### Feature Flags
```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('features', () => ({
  enableCache: process.env.ENABLE_CACHE === 'true',
  enableLogging: process.env.ENABLE_LOGGING === 'true',
  enableMetrics: process.env.ENABLE_METRICS === 'true',
}));
```
