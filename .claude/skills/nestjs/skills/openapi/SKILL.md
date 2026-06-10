---
name: openapi
description: NestJS OpenAPI/Swagger integration for API documentation, decorators, types, parameters, security, and automatic schema generation. Use when documenting REST APIs.
---

# NestJS OpenAPI (Swagger)

## When to Use This Skill

Use this skill when:
- Documenting REST APIs
- Generating interactive API documentation
- Creating OpenAPI/Swagger specifications
- Adding API metadata and descriptions
- Defining request/response schemas
- Documenting authentication and security
- Generating TypeScript clients
- Testing APIs through Swagger UI

## What is OpenAPI in NestJS?

The OpenAPI (Swagger) module provides decorators and tools to automatically generate API documentation from your NestJS application. It creates an interactive UI for testing endpoints and generates machine-readable API specifications.

## Installation

```bash
npm install @nestjs/swagger
```

## Basic Setup

### Bootstrap Configuration

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Cats API')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
```

**Access documentation at:** `http://localhost:3000/api`

**Key Points:**
- `DocumentBuilder` - Configures OpenAPI metadata
- `SwaggerModule.createDocument()` - Generates specification
- `SwaggerModule.setup()` - Mounts Swagger UI

## Document Configuration

```typescript
const config = new DocumentBuilder()
  .setTitle('My API')
  .setDescription('API description')
  .setVersion('1.0.0')
  .setTermsOfService('http://example.com/terms/')
  .setContact('API Support', 'http://example.com', 'support@example.com')
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  .addTag('users', 'User management endpoints')
  .addTag('auth', 'Authentication endpoints')
  .addServer('http://localhost:3000', 'Development')
  .addServer('https://api.example.com', 'Production')
  .addBearerAuth()
  .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' })
  .build();
```

## API Decorators

### @ApiTags

Groups endpoints by tags:

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('cats')
@Controller('cats')
export class CatsController {
  // ...
}
```

### @ApiOperation

Describes an operation:

```typescript
import { ApiOperation } from '@nestjs/swagger';

@Get()
@ApiOperation({
  summary: 'Get all cats',
  description: 'Returns a list of all cats in the database',
})
findAll() {
  return this.catsService.findAll();
}
```

### @ApiResponse

Documents response types:

```typescript
import { ApiResponse, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { Cat } from './entities/cat.entity';

@Get(':id')
@ApiOkResponse({
  description: 'The cat has been successfully retrieved',
  type: Cat,
})
@ApiNotFoundResponse({
  description: 'Cat not found',
})
findOne(@Param('id') id: string) {
  return this.catsService.findOne(id);
}
```

**Response Decorators:**
- `@ApiOkResponse()` - 200
- `@ApiCreatedResponse()` - 201
- `@ApiAcceptedResponse()` - 202
- `@ApiNoContentResponse()` - 204
- `@ApiBadRequestResponse()` - 400
- `@ApiUnauthorizedResponse()` - 401
- `@ApiForbiddenResponse()` - 403
- `@ApiNotFoundResponse()` - 404
- `@ApiConflictResponse()` - 409
- `@ApiInternalServerErrorResponse()` - 500

### @ApiParam

Documents path parameters:

```typescript
import { ApiParam } from '@nestjs/swagger';

@Get(':id')
@ApiParam({
  name: 'id',
  description: 'Cat identifier',
  type: String,
  example: '123e4567-e89b-12d3-a456-426614174000',
})
findOne(@Param('id') id: string) {
  return this.catsService.findOne(id);
}
```

### @ApiQuery

Documents query parameters:

```typescript
import { ApiQuery } from '@nestjs/swagger';

@Get()
@ApiQuery({
  name: 'limit',
  required: false,
  type: Number,
  description: 'Number of items to return',
  example: 10,
})
@ApiQuery({
  name: 'offset',
  required: false,
  type: Number,
  description: 'Number of items to skip',
  example: 0,
})
findAll(
  @Query('limit') limit: number = 10,
  @Query('offset') offset: number = 0,
) {
  return this.catsService.findAll(limit, offset);
}
```

### @ApiBody

Documents request body:

```typescript
import { ApiBody } from '@nestjs/swagger';
import { CreateCatDto } from './dto/create-cat.dto';

@Post()
@ApiBody({
  type: CreateCatDto,
  description: 'Cat data',
  examples: {
    cat1: {
      summary: 'Persian cat',
      value: {
        name: 'Fluffy',
        age: 3,
        breed: 'Persian',
      },
    },
    cat2: {
      summary: 'Siamese cat',
      value: {
        name: 'Whiskers',
        age: 2,
        breed: 'Siamese',
      },
    },
  },
})
create(@Body() createCatDto: CreateCatDto) {
  return this.catsService.create(createCatDto);
}
```

### @ApiHeader

Documents required headers:

```typescript
import { ApiHeader } from '@nestjs/swagger';

@Get()
@ApiHeader({
  name: 'X-API-Version',
  description: 'API version',
  required: true,
})
findAll() {
  return this.catsService.findAll();
}
```

## Types and Parameters

### @ApiProperty

Documents DTO properties:

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateCatDto {
  @ApiProperty({
    description: 'The name of the cat',
    example: 'Fluffy',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The age of the cat in years',
    minimum: 0,
    maximum: 30,
    example: 3,
  })
  @IsInt()
  @Min(0)
  @Max(30)
  age: number;

  @ApiPropertyOptional({
    description: 'The breed of the cat',
    example: 'Persian',
  })
  @IsOptional()
  @IsString()
  breed?: string;

  @ApiProperty({
    description: 'Tags for the cat',
    type: [String],
    example: ['friendly', 'playful'],
  })
  tags: string[];
}
```

### Enums

```typescript
import { ApiProperty } from '@nestjs/swagger';

export enum CatBreed {
  PERSIAN = 'persian',
  SIAMESE = 'siamese',
  MAINE_COON = 'maine_coon',
}

export class CreateCatDto {
  @ApiProperty({
    enum: CatBreed,
    enumName: 'CatBreed',
    description: 'The breed of the cat',
    example: CatBreed.PERSIAN,
  })
  breed: CatBreed;
}
```

### Arrays

```typescript
export class CatDto {
  @ApiProperty({
    type: [String],
    description: 'List of cat names',
    example: ['Fluffy', 'Whiskers'],
  })
  names: string[];

  @ApiProperty({
    type: [Number],
    description: 'List of ages',
  })
  ages: number[];
}
```

### Nested Objects

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class OwnerDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

export class CatDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ type: () => OwnerDto })
  owner: OwnerDto;
}
```

### @ApiHideProperty

Hides properties from documentation:

```typescript
export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiHideProperty()
  internalId: string;
}
```

## Mapped Types

### PartialType

Makes all properties optional:

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateCatDto } from './create-cat.dto';

export class UpdateCatDto extends PartialType(CreateCatDto) {}
```

### PickType

Picks specific properties:

```typescript
import { PickType } from '@nestjs/swagger';
import { CreateCatDto } from './create-cat.dto';

export class EmailCatDto extends PickType(CreateCatDto, ['name', 'breed']) {}
```

### OmitType

Omits specific properties:

```typescript
import { OmitType } from '@nestjs/swagger';
import { CreateCatDto } from './create-cat.dto';

export class UpdateCatDto extends OmitType(CreateCatDto, ['name']) {}
```

### IntersectionType

Combines multiple types:

```typescript
import { IntersectionType } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;
}

export class AdditionalCatDto {
  @ApiProperty()
  breed: string;
}

export class CompleteCatDto extends IntersectionType(
  CreateCatDto,
  AdditionalCatDto,
) {}
```

## Security

### Bearer Authentication

```typescript
// Bootstrap
const config = new DocumentBuilder()
  .addBearerAuth()
  .build();

// Controller
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('cats')
export class CatsController {
  // All routes require bearer token
}

// Single route
@Get()
@ApiBearerAuth()
findAll() {
  return this.catsService.findAll();
}
```

### API Key Authentication

```typescript
// Bootstrap
const config = new DocumentBuilder()
  .addApiKey({
    type: 'apiKey',
    name: 'X-API-Key',
    in: 'header',
  }, 'api-key')
  .build();

// Controller
import { ApiSecurity } from '@nestjs/swagger';

@ApiSecurity('api-key')
@Controller('cats')
export class CatsController {
  // ...
}
```

### OAuth2

```typescript
const config = new DocumentBuilder()
  .addOAuth2({
    type: 'oauth2',
    flows: {
      implicit: {
        authorizationUrl: 'https://example.com/oauth/authorize',
        scopes: {
          'read:cats': 'Read cats',
          'write:cats': 'Write cats',
        },
      },
    },
  })
  .build();
```

### Cookie Authentication

```typescript
const config = new DocumentBuilder()
  .addCookieAuth('sessionId')
  .build();

@ApiCookieAuth()
@Controller('cats')
export class CatsController {
  // ...
}
```

## Advanced Features

### Multiple Specifications

```typescript
// cats.document.ts
const catsConfig = new DocumentBuilder()
  .setTitle('Cats API')
  .setVersion('1.0')
  .addTag('cats')
  .build();

const catsDocument = SwaggerModule.createDocument(app, catsConfig, {
  include: [CatsModule],
});

SwaggerModule.setup('api/cats', app, catsDocument);

// dogs.document.ts
const dogsConfig = new DocumentBuilder()
  .setTitle('Dogs API')
  .setVersion('1.0')
  .addTag('dogs')
  .build();

const dogsDocument = SwaggerModule.createDocument(app, dogsConfig, {
  include: [DogsModule],
});

SwaggerModule.setup('api/dogs', app, dogsDocument);
```

### Custom Options

```typescript
SwaggerModule.setup('api', app, document, {
  customSiteTitle: 'My API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
  customfavIcon: 'https://example.com/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
  },
});
```

### File Upload

```typescript
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Post('upload')
@UseInterceptors(FileInterceptor('file'))
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
      description: {
        type: 'string',
      },
    },
  },
})
uploadFile(
  @UploadedFile() file: Express.Multer.File,
  @Body('description') description: string,
) {
  return { filename: file.filename, description };
}
```

### Extra Models

Register models not directly referenced:

```typescript
import { ApiExtraModels, getSchemaPath } from '@nestjs/swagger';

@ApiExtraModels(Cat, Dog)
@Controller()
export class AnimalsController {
  @Get()
  @ApiOkResponse({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(Cat) },
        { $ref: getSchemaPath(Dog) },
      ],
    },
  })
  findAll() {
    // ...
  }
}
```

### CLI Plugin

Add to `nest-cli.json`:

```json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": [
      {
        "name": "@nestjs/swagger",
        "options": {
          "classValidatorShim": true,
          "introspectComments": true
        }
      }
    ]
  }
}
```

**Benefits:**
- Auto-annotates properties based on types
- Infers required/optional from TypeScript
- Uses comments as descriptions
- Reduces boilerplate

**With plugin:**
```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed?: string;
}
```

**Without plugin:**
```typescript
export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiPropertyOptional()
  breed?: string;
}
```

## Export Specification

### JSON

```typescript
const document = SwaggerModule.createDocument(app, config);

// Save to file
import { writeFileSync } from 'fs';
writeFileSync('./swagger-spec.json', JSON.stringify(document, null, 2));
```

### YAML

```bash
npm install js-yaml
```

```typescript
import { dump } from 'js-yaml';
import { writeFileSync } from 'fs';

const document = SwaggerModule.createDocument(app, config);
writeFileSync('./swagger-spec.yaml', dump(document, { skipInvalid: true }));
```

## Complete Example

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Cats API')
    .setDescription('API for managing cats')
    .setVersion('1.0')
    .addTag('cats', 'Cat management')
    .addTag('auth', 'Authentication')
    .addBearerAuth()
    .addServer('http://localhost:3000', 'Development')
    .addServer('https://api.example.com', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(3000);
  console.log('API Documentation: http://localhost:3000/api/docs');
}
bootstrap();

// dto/create-cat.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, Min, Max, IsOptional, IsEnum } from 'class-validator';

export enum CatBreed {
  PERSIAN = 'persian',
  SIAMESE = 'siamese',
  MAINE_COON = 'maine_coon',
}

export class CreateCatDto {
  @ApiProperty({
    description: 'The name of the cat',
    example: 'Fluffy',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The age of the cat',
    minimum: 0,
    maximum: 30,
    example: 3,
  })
  @IsInt()
  @Min(0)
  @Max(30)
  age: number;

  @ApiPropertyOptional({
    enum: CatBreed,
    description: 'The breed of the cat',
    example: CatBreed.PERSIAN,
  })
  @IsOptional()
  @IsEnum(CatBreed)
  breed?: CatBreed;
}

// cats.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { Cat } from './entities/cat.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('cats')
@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cats' })
  @ApiOkResponse({ description: 'List of cats', type: [Cat] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query('limit') limit?: number) {
    return this.catsService.findAll(limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cat by ID' })
  @ApiParam({ name: 'id', description: 'Cat ID' })
  @ApiOkResponse({ description: 'Cat found', type: Cat })
  @ApiNotFoundResponse({ description: 'Cat not found' })
  findOne(@Param('id') id: string) {
    return this.catsService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new cat' })
  @ApiCreatedResponse({ description: 'Cat created', type: Cat })
  create(@Body() createCatDto: CreateCatDto) {
    return this.catsService.create(createCatDto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update cat' })
  @ApiOkResponse({ description: 'Cat updated', type: Cat })
  @ApiNotFoundResponse({ description: 'Cat not found' })
  update(@Param('id') id: string, @Body() updateCatDto: UpdateCatDto) {
    return this.catsService.update(id, updateCatDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete cat' })
  @ApiOkResponse({ description: 'Cat deleted' })
  @ApiNotFoundResponse({ description: 'Cat not found' })
  remove(@Param('id') id: string) {
    return this.catsService.remove(id);
  }
}
```

## Best Practices

1. **Use CLI plugin** - Reduces boilerplate significantly
2. **Document all endpoints** - Add @ApiOperation to every route
3. **Use mapped types** - PartialType, PickType for DTOs
4. **Add examples** - Make documentation more useful
5. **Document errors** - Use response decorators for all status codes
6. **Organize with tags** - Group related endpoints
7. **Secure endpoints** - Document authentication requirements
8. **Version your API** - Use setVersion in DocumentBuilder
9. **Export specs** - Generate JSON/YAML for client generation
10. **Keep it updated** - Documentation should match implementation
