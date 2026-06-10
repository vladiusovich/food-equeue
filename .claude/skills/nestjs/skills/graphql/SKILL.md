---
name: graphql
description: NestJS GraphQL integration with Code First and Schema First approaches, resolvers, queries, mutations, subscriptions, and GraphQL modules. Use when building GraphQL APIs with NestJS.
---

# NestJS GraphQL

## When to Use This Skill

Use this skill when:
- Building GraphQL APIs instead of REST
- Creating resolvers for queries and mutations
- Implementing real-time features with subscriptions
- Working with GraphQL schemas (SDL or code-first)
- Setting up Apollo Server or Mercurius with NestJS
- Creating type-safe GraphQL APIs with TypeScript

## What is GraphQL in NestJS?

NestJS provides first-class support for GraphQL with two approaches: Code First (using decorators and TypeScript classes) and Schema First (using GraphQL SDL files). It supports Apollo Server and Mercurius drivers.

## Installation

```bash
npm i @nestjs/graphql @nestjs/apollo @apollo/server graphql
```

For Mercurius (Fastify):
```bash
npm i @nestjs/graphql @nestjs/mercurius @apollo/server graphql mercurius
```

## Code First Approach

### Setup

```typescript
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
  ],
})
export class AppModule {}
```

**Key Points:**
- `autoSchemaFile` - Automatically generates schema from TypeScript classes
- `driver: ApolloDriver` - Uses Apollo Server
- Schema is generated at runtime from decorators

### Object Types

```typescript
import { ObjectType, Field, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class Cat {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Int)
  age: number;

  @Field({ nullable: true })
  breed?: string;
}
```

### Resolvers and Queries

```typescript
import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { Cat } from './models/cat.model';
import { CatsService } from './cats.service';

@Resolver(() => Cat)
export class CatsResolver {
  constructor(private catsService: CatsService) {}

  @Query(() => [Cat])
  async cats(): Promise<Cat[]> {
    return this.catsService.findAll();
  }

  @Query(() => Cat)
  async cat(@Args('id', { type: () => ID }) id: string): Promise<Cat> {
    return this.catsService.findOne(id);
  }

  @Query(() => [Cat])
  async searchCats(
    @Args('name', { nullable: true }) name?: string,
    @Args('age', { type: () => Int, nullable: true }) age?: number,
  ): Promise<Cat[]> {
    return this.catsService.search(name, age);
  }
}
```

**Key Points:**
- `@Resolver()` - Marks class as GraphQL resolver
- `@Query()` - Defines GraphQL query
- Return type specified with arrow function
- `@Args()` - Extracts query arguments

### Mutations

```typescript
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Cat } from './models/cat.model';
import { CreateCatInput } from './dto/create-cat.input';
import { UpdateCatInput } from './dto/update-cat.input';

@Resolver(() => Cat)
export class CatsResolver {
  constructor(private catsService: CatsService) {}

  @Mutation(() => Cat)
  async createCat(
    @Args('createCatInput') createCatInput: CreateCatInput,
  ): Promise<Cat> {
    return this.catsService.create(createCatInput);
  }

  @Mutation(() => Cat)
  async updateCat(
    @Args('id') id: string,
    @Args('updateCatInput') updateCatInput: UpdateCatInput,
  ): Promise<Cat> {
    return this.catsService.update(id, updateCatInput);
  }

  @Mutation(() => Boolean)
  async deleteCat(@Args('id') id: string): Promise<boolean> {
    await this.catsService.remove(id);
    return true;
  }
}
```

### Input Types

```typescript
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateCatInput {
  @Field()
  name: string;

  @Field(() => Int)
  age: number;

  @Field({ nullable: true })
  breed?: string;
}

@InputType()
export class UpdateCatInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => Int, { nullable: true })
  age?: number;

  @Field({ nullable: true })
  breed?: string;
}
```

### Subscriptions

```typescript
import { Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { Cat } from './models/cat.model';

const pubSub = new PubSub();

@Resolver(() => Cat)
export class CatsResolver {
  @Mutation(() => Cat)
  async createCat(
    @Args('createCatInput') createCatInput: CreateCatInput,
  ): Promise<Cat> {
    const cat = await this.catsService.create(createCatInput);
    pubSub.publish('catAdded', { catAdded: cat });
    return cat;
  }

  @Subscription(() => Cat)
  catAdded() {
    return pubSub.asyncIterator('catAdded');
  }
}
```

**Enable subscriptions in module:**

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
  subscriptions: {
    'graphql-ws': true,
  },
})
```

## Schema First Approach

### Setup

```typescript
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts'),
      },
    }),
  ],
})
export class AppModule {}
```

### Schema Definition (.graphql)

```graphql
# cats.graphql
type Cat {
  id: ID!
  name: String!
  age: Int!
  breed: String
}

input CreateCatInput {
  name: String!
  age: Int!
  breed: String
}

type Query {
  cats: [Cat!]!
  cat(id: ID!): Cat
}

type Mutation {
  createCat(createCatInput: CreateCatInput!): Cat!
  deleteCat(id: ID!): Boolean!
}

type Subscription {
  catAdded: Cat!
}
```

### Resolver Implementation

```typescript
import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { CatsService } from './cats.service';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();

@Resolver('Cat')
export class CatsResolver {
  constructor(private catsService: CatsService) {}

  @Query('cats')
  async getCats() {
    return this.catsService.findAll();
  }

  @Query('cat')
  async getCat(@Args('id') id: string) {
    return this.catsService.findOne(id);
  }

  @Mutation('createCat')
  async create(@Args('createCatInput') args: any) {
    const cat = await this.catsService.create(args);
    pubSub.publish('catAdded', { catAdded: cat });
    return cat;
  }

  @Subscription('catAdded')
  catAdded() {
    return pubSub.asyncIterator('catAdded');
  }
}
```

## GraphQL Modules

```typescript
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
    CatsModule,
  ],
})
export class AppModule {}
```

```typescript
import { Module } from '@nestjs/common';
import { CatsResolver } from './cats.resolver';
import { CatsService } from './cats.service';

@Module({
  providers: [CatsResolver, CatsService],
})
export class CatsModule {}
```

## Async Configuration

```typescript
GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    autoSchemaFile: true,
    playground: configService.get('GRAPHQL_PLAYGROUND') === 'true',
  }),
  inject: [ConfigService],
})
```

## Field Resolvers

```typescript
import { Resolver, Query, ResolveField, Parent } from '@nestjs/graphql';
import { Cat } from './models/cat.model';
import { Owner } from './models/owner.model';

@Resolver(() => Cat)
export class CatsResolver {
  @Query(() => Cat)
  async cat(@Args('id') id: string): Promise<Cat> {
    return this.catsService.findOne(id);
  }

  @ResolveField(() => Owner)
  async owner(@Parent() cat: Cat): Promise<Owner> {
    return this.ownersService.findByOwnerId(cat.ownerId);
  }
}
```

## Guards and Interceptors

```typescript
import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthGuard } from '../auth/auth.guard';
import { Cat } from './models/cat.model';

@Resolver(() => Cat)
export class CatsResolver {
  @Query(() => [Cat])
  @UseGuards(AuthGuard)
  async cats(): Promise<Cat[]> {
    return this.catsService.findAll();
  }

  @Mutation(() => Cat)
  @UseGuards(AuthGuard)
  async createCat(
    @Args('createCatInput') createCatInput: CreateCatInput,
  ): Promise<Cat> {
    return this.catsService.create(createCatInput);
  }
}
```

## Custom Scalars

```typescript
import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('Date')
export class DateScalar implements CustomScalar<number, Date> {
  description = 'Date custom scalar type';

  parseValue(value: number): Date {
    return new Date(value);
  }

  serialize(value: Date): number {
    return value.getTime();
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    return null;
  }
}
```

Register in module:
```typescript
@Module({
  providers: [DateScalar, CatsResolver],
})
export class CatsModule {}
```

## GraphQL Playground

Access at `http://localhost:3000/graphql` (enabled by default in development)

Disable in production:
```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
  playground: false,
})
```

## Best Practices

1. **Use Code First for TypeScript projects** - Better type safety and DRY principle
2. **Use Schema First when** - Schema is designed by separate team or using schema-stitching
3. **Separate models and inputs** - Don't use same class for both
4. **Use field resolvers** - For computed fields and lazy loading
5. **Implement proper error handling** - Use GraphQL error formatting
6. **Use DataLoader** - Prevent N+1 query problems
7. **Enable depth limiting** - Prevent deeply nested queries
8. **Use subscriptions wisely** - Consider scaling implications
9. **Document schema** - Add descriptions to types and fields
10. **Use validation** - Validate inputs with class-validator

## Common Patterns

### Pagination

```typescript
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class PaginatedCats {
  @Field(() => [Cat])
  items: Cat[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;
}

@Resolver(() => Cat)
export class CatsResolver {
  @Query(() => PaginatedCats)
  async paginatedCats(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('pageSize', { type: () => Int, defaultValue: 10 }) pageSize: number,
  ): Promise<PaginatedCats> {
    const [items, total] = await this.catsService.findPaginated(page, pageSize);
    return { items, total, page, pageSize };
  }
}
```

### Enums

```typescript
import { registerEnumType } from '@nestjs/graphql';

export enum CatBreed {
  PERSIAN = 'PERSIAN',
  SIAMESE = 'SIAMESE',
  MAINE_COON = 'MAINE_COON',
}

registerEnumType(CatBreed, {
  name: 'CatBreed',
  description: 'Available cat breeds',
});

@ObjectType()
export class Cat {
  @Field(() => CatBreed, { nullable: true })
  breed?: CatBreed;
}
```

### Unions and Interfaces

```typescript
import { createUnionType, Field, InterfaceType, ObjectType } from '@nestjs/graphql';

@InterfaceType()
abstract class Animal {
  @Field()
  name: string;

  @Field()
  age: number;
}

@ObjectType({ implements: () => [Animal] })
export class Cat implements Animal {
  name: string;
  age: number;

  @Field()
  breed: string;
}

@ObjectType({ implements: () => [Animal] })
export class Dog implements Animal {
  name: string;
  age: number;

  @Field()
  isGoodBoy: boolean;
}

export const AnimalUnion = createUnionType({
  name: 'AnimalUnion',
  types: () => [Cat, Dog] as const,
});
```

## Code First vs Schema First

### Code First Advantages:
- Single source of truth (TypeScript)
- Better IDE support and type safety
- Less duplication
- Easier refactoring

### Schema First Advantages:
- Schema-driven development
- Better for contract-first APIs
- Non-TypeScript teams can design schema
- Schema stitching and federation easier

Choose based on team preferences and project requirements.
