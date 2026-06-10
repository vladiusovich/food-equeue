---
name: queues
description: NestJS queues with Bull integration for background job processing, job processors, queue events, producers and consumers, job retries, and queue management. Use when implementing async task processing, job scheduling, or handling long-running operations.
---

# NestJS Queues

## When to Use This Skill

Use this skill when:
- Processing tasks asynchronously in the background
- Handling long-running operations without blocking requests
- Sending emails or notifications asynchronously
- Processing uploaded files or media
- Implementing job retries and failure handling
- Distributing work across multiple workers
- Managing priority-based task processing
- Scheduling delayed jobs

## What are Queues?

Queues enable you to handle time-consuming tasks asynchronously by offloading them to background workers. NestJS integrates with Bull, a Redis-based queue library for Node.js that provides robust job processing features.

## Installation

```bash
npm install @nestjs/bull bull
npm install @types/bull --save-dev
```

Redis is required:
```bash
# Install Redis locally or use Docker
docker run -d -p 6379:6379 redis
```

## Basic Setup

### Register Bull Module

```typescript
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
})
export class AppModule {}
```

### Register Queue

```typescript
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [EmailService, EmailProcessor],
})
export class EmailModule {}
```

## Producer (Adding Jobs)

```typescript
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EmailService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendWelcomeEmail(email: string) {
    await this.emailQueue.add('welcome', {
      email,
      subject: 'Welcome!',
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    await this.emailQueue.add('password-reset', {
      email,
      token,
    });
  }

  // Add job with options
  async sendNewsletterEmail(email: string) {
    await this.emailQueue.add(
      'newsletter',
      { email },
      {
        delay: 5000, // Delay 5 seconds
        attempts: 3, // Retry 3 times
        priority: 1, // Lower number = higher priority
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }
}
```

## Consumer (Processing Jobs)

```typescript
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  @Process('welcome')
  async sendWelcomeEmail(job: Job) {
    this.logger.log(`Processing welcome email for ${job.data.email}`);

    // Send email logic
    await this.sendEmail(job.data.email, job.data.subject);

    this.logger.log(`Welcome email sent to ${job.data.email}`);
    return { sent: true };
  }

  @Process('password-reset')
  async sendPasswordResetEmail(job: Job) {
    this.logger.log(`Processing password reset email`);

    await this.sendEmail(
      job.data.email,
      'Password Reset',
      `Token: ${job.data.token}`,
    );

    return { sent: true };
  }

  @Process('newsletter')
  async sendNewsletterEmail(job: Job) {
    this.logger.log(`Processing newsletter email`);

    await this.sendEmail(job.data.email, 'Newsletter');

    return { sent: true };
  }

  // Default processor for jobs without specific handler
  @Process()
  async handleDefault(job: Job) {
    this.logger.log(`Processing default job: ${job.name}`);
    return {};
  }

  private async sendEmail(to: string, subject: string, body?: string) {
    // Email sending implementation
  }
}
```

## Job Options

```typescript
await queue.add(
  'job-name',
  { data: 'job data' },
  {
    // Delay in milliseconds
    delay: 5000,

    // Number of retry attempts
    attempts: 3,

    // Backoff strategy
    backoff: {
      type: 'exponential',
      delay: 1000,
    },

    // Priority (lower = higher priority)
    priority: 1,

    // Remove job when completed
    removeOnComplete: true,

    // Remove job when failed
    removeOnFail: false,

    // Job timeout in milliseconds
    timeout: 30000,

    // Job ID (for deduplication)
    jobId: 'unique-job-id',

    // Repeat options
    repeat: {
      cron: '0 0 * * *',
      tz: 'America/New_York',
    },

    // Limit rate
    limiter: {
      max: 5, // Max 5 jobs
      duration: 1000, // Per 1 second
    },
  },
);
```

## Queue Events

Listen to queue events:

```typescript
import { Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`Job ${job.id} completed with result: ${JSON.stringify(result)}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed with error: ${error.message}`);
  }

  @Process()
  async processJob(job: Job) {
    // Process job
  }
}
```

### All Available Events

```typescript
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  OnQueueProgress,
  OnQueueWaiting,
  OnQueueStalled,
  OnQueueError,
  OnQueuePaused,
  OnQueueResumed,
  OnQueueCleaned,
  OnQueueDrained,
  OnQueueRemoved,
} from '@nestjs/bull';

@Processor('email')
export class EmailProcessor {
  @OnQueueActive()
  onActive(job: Job) {}

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {}

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {}

  @OnQueueProgress()
  onProgress(job: Job, progress: number) {}

  @OnQueueWaiting()
  onWaiting(jobId: number | string) {}

  @OnQueueStalled()
  onStalled(job: Job) {}

  @OnQueueError()
  onError(error: Error) {}

  @OnQueuePaused()
  onPaused() {}

  @OnQueueResumed()
  onResumed() {}

  @OnQueueCleaned()
  onCleaned(jobs: Job[], type: string) {}

  @OnQueueDrained()
  onDrained() {}

  @OnQueueRemoved()
  onRemoved(job: Job) {}
}
```

## Job Progress

Track job progress:

```typescript
@Processor('video-processing')
export class VideoProcessor {
  @Process('transcode')
  async transcodeVideo(job: Job) {
    const { videoUrl } = job.data;

    // Update progress to 25%
    await job.progress(25);

    // Process video
    await this.processVideo(videoUrl);

    // Update progress to 50%
    await job.progress(50);

    // Finalize
    await this.finalizeVideo(videoUrl);

    // Update progress to 100%
    await job.progress(100);

    return { transcoded: true };
  }

  @OnQueueProgress()
  onProgress(job: Job, progress: number) {
    console.log(`Job ${job.id} is ${progress}% complete`);
  }
}
```

## Job Retry and Backoff

```typescript
// Exponential backoff
await queue.add(
  'job',
  { data: 'test' },
  {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 2000, // 2s, 4s, 8s, 16s, 32s
    },
  },
);

// Fixed backoff
await queue.add(
  'job',
  { data: 'test' },
  {
    attempts: 3,
    backoff: {
      type: 'fixed',
      delay: 5000, // 5s, 5s, 5s
    },
  },
);

// Custom backoff
await queue.add(
  'job',
  { data: 'test' },
  {
    attempts: 3,
    backoff: (attemptsMade, err) => {
      return attemptsMade * 1000;
    },
  },
);
```

## Queue Management

```typescript
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueueManagementService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  // Pause queue
  async pauseQueue() {
    await this.emailQueue.pause();
  }

  // Resume queue
  async resumeQueue() {
    await this.emailQueue.resume();
  }

  // Get job counts
  async getJobCounts() {
    return await this.emailQueue.getJobCounts();
  }

  // Get waiting jobs
  async getWaitingJobs() {
    return await this.emailQueue.getWaiting();
  }

  // Get active jobs
  async getActiveJobs() {
    return await this.emailQueue.getActive();
  }

  // Get completed jobs
  async getCompletedJobs() {
    return await this.emailQueue.getCompleted();
  }

  // Get failed jobs
  async getFailedJobs() {
    return await this.emailQueue.getFailed();
  }

  // Get specific job
  async getJob(jobId: string) {
    return await this.emailQueue.getJob(jobId);
  }

  // Remove job
  async removeJob(jobId: string) {
    const job = await this.emailQueue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }

  // Retry failed job
  async retryJob(jobId: string) {
    const job = await this.emailQueue.getJob(jobId);
    if (job) {
      await job.retry();
    }
  }

  // Clean completed jobs
  async cleanCompleted() {
    await this.emailQueue.clean(5000, 'completed');
  }

  // Clean failed jobs
  async cleanFailed() {
    await this.emailQueue.clean(5000, 'failed');
  }

  // Empty queue
  async emptyQueue() {
    await this.emailQueue.empty();
  }

  // Get queue metrics
  async getMetrics() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.emailQueue.getWaitingCount(),
      this.emailQueue.getActiveCount(),
      this.emailQueue.getCompletedCount(),
      this.emailQueue.getFailedCount(),
      this.emailQueue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }
}
```

## Repeatable Jobs

```typescript
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class ScheduledJobsService {
  constructor(@InjectQueue('reports') private reportsQueue: Queue) {}

  // Schedule daily report
  async scheduleDailyReport() {
    await this.reportsQueue.add(
      'daily-report',
      { type: 'daily' },
      {
        repeat: {
          cron: '0 9 * * *', // Every day at 9 AM
          tz: 'America/New_York',
        },
      },
    );
  }

  // Schedule weekly report
  async scheduleWeeklyReport() {
    await this.reportsQueue.add(
      'weekly-report',
      { type: 'weekly' },
      {
        repeat: {
          cron: '0 9 * * 1', // Every Monday at 9 AM
        },
      },
    );
  }

  // Get repeatable jobs
  async getRepeatableJobs() {
    return await this.reportsQueue.getRepeatableJobs();
  }

  // Remove repeatable job
  async removeRepeatableJob(key: string) {
    await this.reportsQueue.removeRepeatableByKey(key);
  }
}
```

## Rate Limiting

```typescript
// Limit to 5 jobs per second
await queue.add(
  'job',
  { data: 'test' },
  {
    limiter: {
      max: 5,
      duration: 1000,
    },
  },
);

// Queue-level rate limiting
BullModule.registerQueue({
  name: 'email',
  limiter: {
    max: 10, // Max 10 jobs
    duration: 5000, // Per 5 seconds
  },
});
```

## Priority Queues

```typescript
// High priority (lower number = higher priority)
await queue.add('urgent-email', { email: 'test@example.com' }, { priority: 1 });

// Medium priority
await queue.add('normal-email', { email: 'test@example.com' }, { priority: 5 });

// Low priority
await queue.add('newsletter', { email: 'test@example.com' }, { priority: 10 });
```

## Real-World Examples

### Image Processing Queue

```typescript
// Producer
@Injectable()
export class ImageService {
  constructor(@InjectQueue('image-processing') private imageQueue: Queue) {}

  async processImage(imageUrl: string, userId: string) {
    return await this.imageQueue.add('resize', {
      imageUrl,
      userId,
      sizes: ['thumbnail', 'medium', 'large'],
    });
  }
}

// Consumer
@Processor('image-processing')
export class ImageProcessor {
  private readonly logger = new Logger(ImageProcessor.name);

  @Process('resize')
  async resizeImage(job: Job) {
    const { imageUrl, userId, sizes } = job.data;

    this.logger.log(`Processing image: ${imageUrl}`);

    const results = [];

    for (let i = 0; i < sizes.length; i++) {
      const size = sizes[i];
      await job.progress((i / sizes.length) * 100);

      const resized = await this.resize(imageUrl, size);
      results.push(resized);
    }

    await job.progress(100);

    return results;
  }

  private async resize(url: string, size: string) {
    // Image resizing logic
  }
}
```

### Email Queue with Templates

```typescript
// Producer
@Injectable()
export class NotificationService {
  constructor(@InjectQueue('notifications') private notificationQueue: Queue) {}

  async sendWelcomeEmail(user: User) {
    await this.notificationQueue.add('email', {
      template: 'welcome',
      to: user.email,
      data: { name: user.name },
    });
  }

  async sendOrderConfirmation(order: Order) {
    await this.notificationQueue.add(
      'email',
      {
        template: 'order-confirmation',
        to: order.customerEmail,
        data: { orderId: order.id, total: order.total },
      },
      { priority: 1 }, // High priority
    );
  }
}

// Consumer
@Processor('notifications')
export class NotificationProcessor {
  constructor(private emailService: EmailService) {}

  @Process('email')
  async sendEmail(job: Job) {
    const { template, to, data } = job.data;

    const html = await this.emailService.renderTemplate(template, data);
    await this.emailService.send(to, html);

    return { sent: true, to };
  }
}
```

### File Upload Queue

```typescript
@Injectable()
export class UploadService {
  constructor(@InjectQueue('file-upload') private uploadQueue: Queue) {}

  async uploadFile(file: Express.Multer.File, userId: string) {
    return await this.uploadQueue.add('process-upload', {
      fileName: file.filename,
      originalName: file.originalname,
      userId,
    });
  }
}

@Processor('file-upload')
export class UploadProcessor {
  @Process('process-upload')
  async processUpload(job: Job) {
    const { fileName, originalName, userId } = job.data;

    // Scan for viruses
    await job.progress(25);
    await this.scanFile(fileName);

    // Generate thumbnail
    await job.progress(50);
    await this.generateThumbnail(fileName);

    // Upload to S3
    await job.progress(75);
    const url = await this.uploadToS3(fileName);

    // Save to database
    await job.progress(100);
    await this.saveToDatabase(url, originalName, userId);

    return { url };
  }
}
```

## Configuration with ConfigService

```typescript
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## Testing Queues

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';

describe('EmailService', () => {
  let service: EmailService;
  let queue: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: getQueueToken('email'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    queue = module.get(getQueueToken('email'));
  });

  it('should add job to queue', async () => {
    await service.sendWelcomeEmail('test@example.com');

    expect(queue.add).toHaveBeenCalledWith('welcome', {
      email: 'test@example.com',
      subject: 'Welcome!',
    });
  });
});
```

## Best Practices

1. **Use meaningful job names** - Makes debugging easier
2. **Set appropriate retries** - Configure retry attempts for failed jobs
3. **Implement error handling** - Handle job failures gracefully
4. **Monitor queues** - Track job counts and metrics
5. **Use priority** - Prioritize critical jobs
6. **Clean up completed jobs** - Remove old jobs to save memory
7. **Rate limit** - Prevent overwhelming external services
8. **Use job IDs** - Prevent duplicate jobs
9. **Progress tracking** - Update progress for long-running jobs
10. **Log everything** - Log job start, completion, and failures

## Common Patterns

### Deduplication
```typescript
await queue.add(
  'job',
  { data: 'test' },
  {
    jobId: 'unique-job-id',
    removeOnComplete: true,
  },
);
```

### Job Chaining
```typescript
@Process('step-1')
async step1(job: Job) {
  const result = await this.processStep1(job.data);

  // Add next job
  await this.queue.add('step-2', { ...job.data, step1Result: result });

  return result;
}

@Process('step-2')
async step2(job: Job) {
  return await this.processStep2(job.data);
}
```

### Circuit Breaker
```typescript
@Process('external-api')
async callExternalApi(job: Job) {
  const failureCount = await this.getFailureCount();

  if (failureCount > 10) {
    throw new Error('Circuit breaker open');
  }

  try {
    const result = await this.api.call(job.data);
    await this.resetFailureCount();
    return result;
  } catch (error) {
    await this.incrementFailureCount();
    throw error;
  }
}
```
