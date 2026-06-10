---
name: validation
description: NestJS validation using ValidationPipe with class-validator decorators, auto-validation, transform options, whitelist properties, and custom validators. Use when validating request payloads, DTOs, query parameters, or route parameters.
---

# NestJS Validation

## When to Use This Skill

Use this skill when:
- Validating request bodies (POST, PUT, PATCH)
- Validating query parameters and route parameters
- Transforming and sanitizing input data
- Stripping unwanted properties from requests
- Implementing custom validation logic
- Auto-converting primitive types
- Validating nested objects and arrays

## What is Validation?

NestJS ValidationPipe uses the `class-validator` library to validate incoming data against DTO classes with declarative decorators. It provides automatic validation, transformation, and sanitization.

## Installation

```bash
npm install class-validator class-transformer
```

## Basic Setup

Enable ValidationPipe globally:

```typescript
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
```

## Basic Validation

Create a DTO with validation decorators:

```typescript
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
```

Use in controller:

```typescript
import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return createUserDto;
  }
}
```

**If validation fails**, ValidationPipe throws `BadRequestException` with error details.

## Common Validation Decorators

### String Validators
```typescript
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsEmail,
  IsUrl,
  IsUUID,
  IsAlpha,
  IsAlphanumeric,
} from 'class-validator';

export class StringDto {
  @IsString()
  text: string;

  @IsNotEmpty()
  required: string;

  @MinLength(5)
  @MaxLength(20)
  username: string;

  @Matches(/^[a-zA-Z0-9]*$/)
  alphanumeric: string;

  @IsEmail()
  email: string;

  @IsUrl()
  website: string;

  @IsUUID()
  id: string;

  @IsAlpha()
  onlyLetters: string;

  @IsAlphanumeric()
  alphaNum: string;
}
```

### Number Validators
```typescript
import {
  IsNumber,
  IsInt,
  IsPositive,
  IsNegative,
  Min,
  Max,
  IsDivisibleBy,
} from 'class-validator';

export class NumberDto {
  @IsNumber()
  price: number;

  @IsInt()
  quantity: number;

  @IsPositive()
  positive: number;

  @IsNegative()
  negative: number;

  @Min(0)
  @Max(100)
  percentage: number;

  @IsDivisibleBy(5)
  divisible: number;
}
```

### Boolean Validators
```typescript
import { IsBoolean } from 'class-validator';

export class BooleanDto {
  @IsBoolean()
  isActive: boolean;
}
```

### Date Validators
```typescript
import { IsDate, MinDate, MaxDate } from 'class-validator';

export class DateDto {
  @IsDate()
  birthDate: Date;

  @MinDate(new Date())
  futureDate: Date;

  @MaxDate(new Date())
  pastDate: Date;
}
```

### Array Validators
```typescript
import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  ArrayNotEmpty,
  ArrayUnique,
} from 'class-validator';

export class ArrayDto {
  @IsArray()
  @ArrayNotEmpty()
  tags: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  items: number[];

  @IsArray()
  @ArrayUnique()
  uniqueIds: string[];
}
```

### Enum Validators
```typescript
import { IsEnum } from 'class-validator';

enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

export class EnumDto {
  @IsEnum(UserRole)
  role: UserRole;
}
```

### Object Validators
```typescript
import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;
}

export class UserDto {
  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
```

## ValidationPipe Options

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    // Automatically transform payloads to DTO instances
    transform: true,

    // Strip properties not in DTO
    whitelist: true,

    // Throw error if non-whitelisted properties exist
    forbidNonWhitelisted: true,

    // Skip validation for undefined properties
    skipMissingProperties: false,

    // Skip validation for null properties
    skipNullProperties: false,

    // Skip validation for undefined values
    skipUndefinedProperties: false,

    // Disable detailed errors (for production)
    disableErrorMessages: false,

    // Custom error message handler
    exceptionFactory: (errors) => new BadRequestException(errors),

    // Validation groups
    groups: [],

    // Always validate (even if no decorators)
    always: false,

    // Enable strict mode
    strictGroups: false,

    // Dismiss unknown values
    dismissDefaultMessages: false,

    // Validation options for class-validator
    validationError: {
      target: false,
      value: false,
    },

    // Enable auto-transformation
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

## Auto-Transformation

With `transform: true`, the ValidationPipe automatically converts:

```typescript
import { IsInt, IsBoolean, IsDate } from 'class-validator';

export class QueryDto {
  @IsInt()
  page: number; // "5" → 5

  @IsBoolean()
  active: boolean; // "true" → true

  @IsDate()
  date: Date; // "2024-01-01" → Date object
}

@Controller('items')
export class ItemsController {
  @Get()
  findAll(@Query() query: QueryDto) {
    console.log(typeof query.page); // "number"
    console.log(typeof query.active); // "boolean"
    return query;
  }
}
```

## Stripping Properties (Whitelist)

```typescript
export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  // role is NOT in DTO
}

// Request body:
// { name: "John", email: "john@example.com", role: "admin" }

// With whitelist: true
// Result: { name: "John", email: "john@example.com" }

// With forbidNonWhitelisted: true
// Throws error if 'role' is present
```

Enable whitelist:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
);
```

## Custom Validators

Create a custom validator:

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
```

Use custom validator:

```typescript
export class CreateUserDto {
  @IsStrongPassword()
  password: string;
}
```

## Async Custom Validators

```typescript
import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isUserAlreadyExist', async: true })
@Injectable()
export class IsUserAlreadyExistConstraint implements ValidatorConstraintInterface {
  constructor(private usersService: UsersService) {}

  async validate(email: string, args: ValidationArguments) {
    const user = await this.usersService.findByEmail(email);
    return !user;
  }

  defaultMessage(args: ValidationArguments) {
    return 'User with email $value already exists';
  }
}
```

## Conditional Validation

```typescript
import { ValidateIf, IsString } from 'class-validator';

export class ConditionalDto {
  @IsString()
  type: string;

  // Only validate if type is 'email'
  @ValidateIf(o => o.type === 'email')
  @IsEmail()
  email?: string;

  // Only validate if type is 'phone'
  @ValidateIf(o => o.type === 'phone')
  @IsPhoneNumber()
  phone?: string;
}
```

## Optional Properties

```typescript
import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  age?: number;
}
```

## Validation Groups

```typescript
import { IsString, IsEmail } from 'class-validator';

export class UserDto {
  @IsString({ groups: ['create'] })
  password: string;

  @IsEmail({}, { groups: ['create', 'update'] })
  email: string;

  @IsString({ groups: ['update'] })
  name: string;
}

// In controller
@Post()
create(@Body(new ValidationPipe({ groups: ['create'] })) dto: UserDto) {
  return dto;
}

@Patch(':id')
update(@Body(new ValidationPipe({ groups: ['update'] })) dto: UserDto) {
  return dto;
}
```

## Validating Arrays of Objects

```typescript
import { IsArray, ValidateNested, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class ItemDto {
  @IsString()
  name: string;

  @IsInt()
  quantity: number;
}

export class OrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];
}
```

## Validation Decorators Reference

### Type Validators
- `@IsBoolean()` - Checks if value is boolean
- `@IsDate()` - Checks if value is date
- `@IsNumber()` - Checks if value is number
- `@IsInt()` - Checks if value is integer
- `@IsString()` - Checks if value is string
- `@IsArray()` - Checks if value is array
- `@IsEnum(entity)` - Checks if value is enum
- `@IsObject()` - Checks if value is object

### String Validators
- `@IsEmail()` - Checks if string is email
- `@IsUrl()` - Checks if string is URL
- `@IsUUID()` - Checks if string is UUID
- `@IsAlpha()` - Checks if string contains only letters
- `@IsAlphanumeric()` - Checks if string contains only letters and numbers
- `@IsHexColor()` - Checks if string is hex color
- `@IsJSON()` - Checks if string is valid JSON

### Number Validators
- `@IsPositive()` - Checks if number is positive
- `@IsNegative()` - Checks if number is negative
- `@Min(min)` - Checks if number is greater than or equal to min
- `@Max(max)` - Checks if number is less than or equal to max
- `@IsDivisibleBy(num)` - Checks if number is divisible by num

### Common Validators
- `@IsDefined()` - Checks if value is defined
- `@IsOptional()` - Checks if value is optional
- `@IsNotEmpty()` - Checks if value is not empty
- `@IsEmpty()` - Checks if value is empty
- `@IsIn(values)` - Checks if value is in array
- `@IsNotIn(values)` - Checks if value is not in array

### Array Validators
- `@ArrayContains(values)` - Checks if array contains all values
- `@ArrayNotContains(values)` - Checks if array does not contain values
- `@ArrayNotEmpty()` - Checks if array is not empty
- `@ArrayMinSize(min)` - Checks if array has minimum size
- `@ArrayMaxSize(max)` - Checks if array has maximum size
- `@ArrayUnique()` - Checks if array has unique values

### Object Validators
- `@ValidateNested()` - Validates nested object
- `@IsInstance(value)` - Checks if value is instance of class

## Mapped Types

NestJS provides utilities to transform DTOs:

```typescript
import { PartialType, PickType, OmitType, IntersectionType } from '@nestjs/mapped-types';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsInt()
  age: number;
}

// All properties optional
export class UpdateUserDto extends PartialType(CreateUserDto) {}

// Only specific properties
export class LoginDto extends PickType(CreateUserDto, ['email', 'password']) {}

// Exclude specific properties
export class UserResponseDto extends OmitType(CreateUserDto, ['password']) {}

// Combine DTOs
export class AdminUserDto extends IntersectionType(
  CreateUserDto,
  AdditionalPropsDto,
) {}
```

## Parsing and Transforming

### Parse Int Pipe
```typescript
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.service.findOne(id);
}
```

### Parse Bool Pipe
```typescript
@Get()
findAll(@Query('active', ParseBoolPipe) active: boolean) {
  return this.service.findAll(active);
}
```

### Parse UUID Pipe
```typescript
@Get(':id')
findOne(@Param('id', ParseUUIDPipe) id: string) {
  return this.service.findOne(id);
}
```

### Parse Array Pipe
```typescript
@Get()
findByIds(@Query('ids', ParseArrayPipe) ids: string[]) {
  return this.service.findByIds(ids);
}
```

## Custom Error Messages

```typescript
export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString({ message: 'Name must be a string' })
  name: string;
}
```

## Testing Validation

```typescript
import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  it('should validate correct data', async () => {
    const dto = new CreateUserDto();
    dto.email = 'test@example.com';
    dto.password = 'password123';
    dto.name = 'John Doe';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid email', async () => {
    const dto = new CreateUserDto();
    dto.email = 'invalid-email';
    dto.password = 'password123';
    dto.name = 'John Doe';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });
});
```

## Best Practices

1. **Use DTOs** - Always create separate DTO classes
2. **Whitelist properties** - Enable `whitelist: true` to strip unwanted data
3. **Transform data** - Use `transform: true` for auto-conversion
4. **Forbid non-whitelisted** - Use `forbidNonWhitelisted: true` in production
5. **Custom messages** - Provide user-friendly error messages
6. **Reuse DTOs** - Use mapped types to avoid duplication
7. **Validate nested objects** - Use `@ValidateNested()` with `@Type()`
8. **Test validation** - Write unit tests for DTOs
9. **Type safety** - Leverage TypeScript types
10. **Global pipes** - Set up ValidationPipe globally for consistency
