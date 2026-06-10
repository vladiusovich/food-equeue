---
name: pipes
description: NestJS pipes for data validation and transformation. Use when validating request data, transforming input types, providing default values, or sanitizing user input before it reaches route handlers.
---

# NestJS Pipes

## When to Use This Skill

Use this skill when:
- Validating request data (body, query, params)
- Transforming input data (string to number, object schema)
- Parsing primitive types (int, float, boolean, UUID)
- Providing default values for optional parameters
- Sanitizing user input
- Implementing custom validation logic
- Stripping unwanted properties from DTOs
- Auto-transforming request payloads to class instances

## What are Pipes?

Pipes are classes decorated with `@Injectable()` that implement the `PipeTransform` interface. They operate on the arguments being processed by a controller route handler and can:
- Transform input data to desired format
- Validate input data and throw exceptions if invalid

Pipes execute **after guards and interceptors (before)** but **before the route handler** in the request lifecycle.

## Basic Pipe

```typescript
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return value;
  }
}
```

**Key Points:**
- Decorated with `@Injectable()`
- Implements `PipeTransform` interface
- `transform()` receives value and metadata
- Returns transformed value or throws exception
- Runs inside exceptions zone (exceptions converted to HTTP responses)

## Argument Metadata

```typescript
export interface ArgumentMetadata {
  type: 'body' | 'query' | 'param' | 'custom';
  metatype?: Type<unknown>;
  data?: string;
}
```

**Example usage:**
```typescript
transform(value: any, metadata: ArgumentMetadata) {
  console.log('Type:', metadata.type);        // 'query'
  console.log('Metatype:', metadata.metatype); // String, Number, etc.
  console.log('Data:', metadata.data);        // 'id', 'name', etc.
  return value;
}
```

## Built-in Pipes

NestJS provides several built-in pipes:

```typescript
import {
  ValidationPipe,
  ParseIntPipe,
  ParseFloatPipe,
  ParseBoolPipe,
  ParseArrayPipe,
  ParseUUIDPipe,
  ParseEnumPipe,
  DefaultValuePipe,
} from '@nestjs/common';
```

## Binding Pipes

### Parameter-level Pipe

```typescript
import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findOne(@Query('id', ParseIntPipe) id: number) {
    return `Cat #${id}`;
  }
}
```

### Method-level Pipe

```typescript
import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { ValidationPipe } from './validation.pipe';

@Controller('cats')
export class CatsController {
  @Post()
  @UsePipes(ValidationPipe)
  create(@Body() createCatDto: CreateCatDto) {
    return 'Created';
  }
}
```

### Controller-level Pipe

```typescript
@Controller('cats')
@UsePipes(ValidationPipe)
export class CatsController {
  // All routes use the pipe
}
```

### Global Pipe

```typescript
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
```

**Alternative (in main.ts):**
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
```

## ParseIntPipe

```typescript
import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findOne(@Query('id', ParseIntPipe) id: number) {
    return `Cat #${id}`; // id is a number
  }
}
```

**Custom error message:**
```typescript
@Get(':id')
findOne(
  @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
  id: number,
) {
  return `Cat #${id}`;
}
```

## ParseUUIDPipe

```typescript
import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return `Cat with UUID: ${id}`;
  }
}
```

**Specify UUID version:**
```typescript
@Get(':id')
findOne(
  @Param('id', new ParseUUIDPipe({ version: '4' }))
  id: string,
) {
  return `Cat #${id}`;
}
```

## ParseEnumPipe

```typescript
import { Controller, Get, Query, ParseEnumPipe } from '@nestjs/common';

enum Status {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending',
}

@Controller('cats')
export class CatsController {
  @Get()
  findAll(@Query('status', new ParseEnumPipe(Status)) status: Status) {
    return `Status: ${status}`;
  }
}
```

## DefaultValuePipe

```typescript
import { Controller, Get, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return { page, limit };
  }
}
```

## ParseArrayPipe

```typescript
import { Controller, Post, Body, ParseArrayPipe } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Post()
  create(
    @Body(new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
  ) {
    return ids;
  }
}
```

**With class validation:**
```typescript
@Post()
createMultiple(
  @Body(new ParseArrayPipe({ items: CreateCatDto }))
  createCatDtos: CreateCatDto[],
) {
  return createCatDtos;
}
```

## ValidationPipe with class-validator

### Install Dependencies

```bash
npm install class-validator class-transformer
```

### Create DTO with Validation

```typescript
import {
  IsString,
  IsInt,
  Min,
  Max,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateCatDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsInt()
  @Min(0)
  @Max(30)
  age: number;

  @IsString()
  @IsNotEmpty()
  breed: string;

  @IsEmail()
  @IsOptional()
  ownerEmail?: string;
}
```

### Use ValidationPipe

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Body(ValidationPipe) createCatDto: CreateCatDto) {
    return createCatDto;
  }
}
```

### Global ValidationPipe with Options

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Strip properties without decorators
    forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
    transform: true, // Auto-transform to DTO instances
    transformOptions: {
      enableImplicitConversion: true, // Auto-convert primitive types
    },
    disableErrorMessages: false, // Show detailed error messages
    skipMissingProperties: false, // Don't skip validation of missing properties
    skipNullProperties: false, // Don't skip validation of null properties
    skipUndefinedProperties: false, // Don't skip validation of undefined properties
  }),
);
```

## Custom Validation Pipe

```typescript
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed: not a number');
    }
    return val;
  }
}
```

## Object Schema Validation Pipe

```typescript
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ObjectSchema } from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const { error } = this.schema.validate(value);
    if (error) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }
}

// Usage with Joi
import * as Joi from 'joi';

const createCatSchema = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().integer().min(0).max(30).required(),
  breed: Joi.string().required(),
});

@Post()
@UsePipes(new JoiValidationPipe(createCatSchema))
async create(@Body() createCatDto: CreateCatDto) {
  return createCatDto;
}
```

## Transformation Pipe

```typescript
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class UpperCasePipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    return value.toUpperCase();
  }
}

// Usage
@Get()
search(@Query('term', UpperCasePipe) term: string) {
  return `Searching for: ${term}`;
}
```

## Default Value Transformation

```typescript
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class DefaultValuePipe implements PipeTransform {
  constructor(private readonly defaultValue: any) {}

  transform(value: any, metadata: ArgumentMetadata) {
    return value !== undefined && value !== null ? value : this.defaultValue;
  }
}

// Usage
@Get()
findAll(
  @Query('limit', new DefaultValuePipe(10)) limit: number,
  @Query('offset', new DefaultValuePipe(0)) offset: number,
) {
  return { limit, offset };
}
```

## Sanitization Pipe

```typescript
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return value.trim().replace(/[<>]/g, '');
    }
    return value;
  }
}

// Usage
@Post()
create(@Body(SanitizePipe) createDto: CreateDto) {
  return createDto;
}
```

## Class Validator Decorators

Common validation decorators:

```typescript
import {
  IsString,
  IsNumber,
  IsInt,
  IsBoolean,
  IsArray,
  IsObject,
  IsDate,
  IsEmail,
  IsUrl,
  IsUUID,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Min,
  Max,
  MinLength,
  MaxLength,
  Length,
  Matches,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak',
  })
  password: string;

  @IsInt()
  @Min(18)
  @Max(100)
  age: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  tags: string[];

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsEnum(['admin', 'user', 'moderator'])
  role: string;

  @IsUrl()
  @IsOptional()
  website?: string;
}
```

## Nested Object Validation

```typescript
import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  country: string;
}

export class CreateUserDto {
  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
```

## Custom Validator

```typescript
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Password must contain uppercase, lowercase, number, and special character';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}

// Usage
export class CreateUserDto {
  @IsStrongPassword()
  password: string;
}
```

## Complete Example

```typescript
// validation.pipe.ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = errors.map((error) => {
        return Object.values(error.constraints || {}).join(', ');
      });
      throw new BadRequestException(messages);
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}

// create-cat.dto.ts
import {
  IsString,
  IsInt,
  Min,
  Max,
  IsNotEmpty,
  MinLength,
} from 'class-validator';

export class CreateCatDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsInt()
  @Min(0)
  @Max(30)
  age: number;

  @IsString()
  @IsNotEmpty()
  breed: string;
}

// cats.controller.ts
import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { ValidationPipe } from './validation.pipe';
import { CreateCatDto } from './dto/create-cat.dto';

@Controller('cats')
export class CatsController {
  @Post()
  @UsePipes(ValidationPipe)
  create(@Body() createCatDto: CreateCatDto) {
    return createCatDto;
  }
}
```

## Best Practices

1. **Use built-in pipes** - Leverage NestJS built-in pipes when possible
2. **Global ValidationPipe** - Apply ValidationPipe globally for consistent validation
3. **Use class-validator** - Declarative validation with decorators
4. **Transform data** - Use `transform: true` to auto-convert types
5. **Whitelist properties** - Use `whitelist: true` to strip unknown properties
6. **Custom error messages** - Provide clear, user-friendly error messages
7. **Type safety** - Use TypeScript generics for type-safe pipes
8. **Single responsibility** - Each pipe should do one thing well
9. **Validate early** - Fail fast with validation at the entry point
10. **Document DTOs** - Use decorators that self-document validation rules

## Validation Options

```typescript
new ValidationPipe({
  // Strip properties without decorators
  whitelist: true,

  // Throw error if non-whitelisted properties exist
  forbidNonWhitelisted: true,

  // Auto-transform payloads to DTO instances
  transform: true,

  // Transformation options
  transformOptions: {
    enableImplicitConversion: true,
  },

  // Don't show detailed error messages in production
  disableErrorMessages: process.env.NODE_ENV === 'production',

  // Custom exception factory
  exceptionFactory: (errors) => {
    const messages = errors.map((error) => ({
      field: error.property,
      errors: Object.values(error.constraints || {}),
    }));
    return new BadRequestException(messages);
  },
})
```

## Request Lifecycle Position

```
Incoming Request
    ↓
Middleware
    ↓
Guards
    ↓
Interceptors (before)
    ↓
Pipes ← (You are here)
    ↓
Route Handler
    ↓
Interceptors (after)
    ↓
Exception Filters
    ↓
Response
```

Pipes are the last line of defense before your route handler, ensuring data is valid and in the correct format.
