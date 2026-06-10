---
name: database
description: NestJS database integration with TypeORM, Prisma, and MongoDB (Mongoose). Covers SQL and NoSQL databases, repository pattern, entities, migrations, and database operations. Use when working with databases, ORMs, or data persistence.
---

# NestJS Database Integration

## When to Use This Skill

Use this skill when:
- Setting up database connections
- Working with SQL databases (PostgreSQL, MySQL, SQLite)
- Working with MongoDB
- Defining entities and schemas
- Implementing repository pattern
- Running database migrations
- Using TypeORM, Prisma, or Mongoose
- Performing CRUD operations

## Overview

NestJS supports multiple database solutions:
- **TypeORM** - Full-featured ORM for SQL databases
- **Prisma** - Modern ORM with type-safe query builder
- **Mongoose** - ODM for MongoDB
- **Sequelize** - Alternative ORM for SQL databases
- **MikroORM** - TypeScript ORM with Unit of Work

---

## TypeORM Integration

### Installation

```bash
npm install @nestjs/typeorm typeorm mysql2
# or
npm install @nestjs/typeorm typeorm pg
# or
npm install @nestjs/typeorm typeorm sqlite3
```

### Basic Setup

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'mydb',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Don't use in production
    }),
  ],
})
export class AppModule {}
```

### Define Entity

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  age?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Register Entity in Module

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
```

### Repository Pattern with TypeORM

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: any): Promise<User> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
```

### TypeORM Relations

```typescript
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, ManyToMany, JoinTable } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // One-to-Many
  @OneToMany(() => Post, post => post.author)
  posts: Post[];

  // Many-to-Many
  @ManyToMany(() => Role)
  @JoinTable()
  roles: Role[];
}

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  // Many-to-One
  @ManyToOne(() => User, user => user.posts)
  author: User;
}

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
```

### Query Builder

```typescript
async findUserWithPosts(userId: number): Promise<User> {
  return await this.usersRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.posts', 'post')
    .where('user.id = :id', { id: userId })
    .getOne();
}

async searchUsers(search: string): Promise<User[]> {
  return await this.usersRepository
    .createQueryBuilder('user')
    .where('user.name LIKE :search', { search: `%${search}%` })
    .orWhere('user.email LIKE :search', { search: `%${search}%` })
    .orderBy('user.createdAt', 'DESC')
    .limit(10)
    .getMany();
}
```

### Transactions

```typescript
import { DataSource } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(private dataSource: DataSource) {}

  async createUserWithProfile(userData: any, profileData: any): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.save(User, userData);
      await queryRunner.manager.save(Profile, { ...profileData, user });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
```

### Migrations

Generate migration:
```bash
npm run typeorm migration:generate -- -n CreateUsers
```

Run migrations:
```bash
npm run typeorm migration:run
```

Revert migration:
```bash
npm run typeorm migration:revert
```

Migration file:
```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1234567890 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE users`);
  }
}
```

---

## Prisma Integration

### Installation

```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

### Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  age       Int?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model Post {
  id        String   @id @default(uuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("posts")
}
```

### Prisma Service

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: any) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
```

### Prisma Module

```typescript
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### Using Prisma in Service

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOne(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }

  async findUserWithPosts(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { posts: true },
    });
  }
}
```

### Prisma Migrations

```bash
# Create migration
npx prisma migrate dev --name init

# Apply migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed database
npx prisma db seed
```

### Prisma Transactions

```typescript
async createUserWithProfile(userData: any, profileData: any) {
  return await this.prisma.$transaction(async (prisma) => {
    const user = await prisma.user.create({ data: userData });
    const profile = await prisma.profile.create({
      data: {
        ...profileData,
        userId: user.id,
      },
    });
    return { user, profile };
  });
}
```

---

## MongoDB with Mongoose

### Installation

```bash
npm install @nestjs/mongoose mongoose
```

### Basic Setup

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest'),
  ],
})
export class AppModule {}
```

### Define Schema

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  age?: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

### Register Schema in Module

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
```

### Using Mongoose in Service

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: any): Promise<User> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
```

### Mongoose Relations

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop()
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  author: Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Populate in service
async findPostWithAuthor(postId: string) {
  return this.postModel
    .findById(postId)
    .populate('author')
    .exec();
}
```

---

## Database Configuration

### Using ConfigService

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Multiple Databases

```typescript
@Module({
  imports: [
    TypeOrmModule.forRoot({
      name: 'default',
      type: 'postgres',
      // ...
    }),
    TypeOrmModule.forRoot({
      name: 'secondary',
      type: 'mysql',
      // ...
    }),
  ],
})
export class AppModule {}

// In service
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User, 'default')
    private usersRepository: Repository<User>,
  ) {}
}
```

## Repository Pattern

### Custom Repository

```typescript
import { EntityRepository, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async findByEmail(email: string): Promise<User | undefined> {
    return this.findOne({ where: { email } });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.find({ where: { isActive: true } });
  }
}
```

## Best Practices

1. **Don't use synchronize in production** - Use migrations instead
2. **Use transactions** - For operations that must succeed or fail together
3. **Index frequently queried fields** - Improve query performance
4. **Use DTOs** - Separate database entities from API DTOs
5. **Validate data** - Use ValidationPipe with DTOs
6. **Handle errors** - Catch and handle database errors properly
7. **Use connection pooling** - Configure appropriate pool size
8. **Soft deletes** - Consider soft deletes instead of hard deletes
9. **Environment configuration** - Use ConfigService for database config
10. **Type safety** - Leverage TypeScript types from Prisma/TypeORM

## Common Patterns

### Soft Delete
```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @DeleteDateColumn()
  deletedAt?: Date;
}
```

### Pagination
```typescript
async findAll(page: number = 1, limit: number = 10) {
  const [users, total] = await this.usersRepository.findAndCount({
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    data: users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
```

### Search and Filter
```typescript
async searchUsers(query: any) {
  const qb = this.usersRepository.createQueryBuilder('user');

  if (query.name) {
    qb.andWhere('user.name LIKE :name', { name: `%${query.name}%` });
  }

  if (query.email) {
    qb.andWhere('user.email = :email', { email: query.email });
  }

  return qb.getMany();
}
```
