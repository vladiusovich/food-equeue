---
name: task-scheduling
description: NestJS task scheduling using @nestjs/schedule for cron jobs, intervals, timeouts, and dynamic scheduling. Use when implementing scheduled tasks, periodic jobs, delayed execution, or background processing.
---

# NestJS Task Scheduling

## When to Use This Skill

Use this skill when:
- Running tasks at specific times (cron jobs)
- Executing periodic tasks (intervals)
- Scheduling delayed tasks (timeouts)
- Implementing background jobs
- Creating scheduled reports or backups
- Cleaning up expired data
- Sending scheduled notifications
- Dynamically managing scheduled tasks

## What is Task Scheduling?

The `@nestjs/schedule` module allows you to schedule arbitrary code (methods/functions) to execute at fixed dates/times, recurring intervals, or after specified intervals. It integrates with the popular `node-cron` package.

## Installation

```bash
npm install @nestjs/schedule
```

## Basic Setup

```typescript
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [TasksService],
})
export class AppModule {}
```

## Cron Jobs

### Basic Cron Job

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  @Cron('45 * * * * *')
  handleCron() {
    console.log('Called every 45 seconds');
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  handleEvery30Seconds() {
    console.log('Called every 30 seconds');
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  handleMidnight() {
    console.log('Called at midnight every day');
  }
}
```

### Cron Expression Format

```
* * * * * *
│ │ │ │ │ │
│ │ │ │ │ └─ Day of Week (0-7, 0 and 7 are Sunday)
│ │ │ │ └─── Month (1-12)
│ │ │ └───── Day of Month (1-31)
│ │ └─────── Hour (0-23)
│ └───────── Minute (0-59)
└─────────── Second (0-59, optional)
```

### Common Cron Patterns

```typescript
@Injectable()
export class TasksService {
  // Every minute
  @Cron('0 * * * * *')
  everyMinute() {}

  // Every 5 minutes
  @Cron('0 */5 * * * *')
  everyFiveMinutes() {}

  // Every hour
  @Cron('0 0 * * * *')
  everyHour() {}

  // Every day at 3 AM
  @Cron('0 0 3 * * *')
  everyDayAt3AM() {}

  // Every Monday at 9 AM
  @Cron('0 0 9 * * 1')
  everyMondayAt9AM() {}

  // First day of every month at midnight
  @Cron('0 0 0 1 * *')
  firstDayOfMonth() {}

  // Every weekday at 6 PM
  @Cron('0 0 18 * * 1-5')
  everyWeekdayAt6PM() {}
}
```

### Predefined Cron Expressions

```typescript
import { CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  @Cron(CronExpression.EVERY_SECOND)
  everySecond() {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  every5Seconds() {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  every10Seconds() {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  every30Seconds() {}

  @Cron(CronExpression.EVERY_MINUTE)
  everyMinute() {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  every5Minutes() {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  every10Minutes() {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  every30Minutes() {}

  @Cron(CronExpression.EVERY_HOUR)
  everyHour() {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  everyDayAtMidnight() {}

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  everyDayAtNoon() {}

  @Cron(CronExpression.EVERY_WEEK)
  everyWeek() {}

  @Cron(CronExpression.EVERY_WEEKDAY)
  everyWeekday() {}

  @Cron(CronExpression.EVERY_WEEKEND)
  everyWeekend() {}

  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_1AM)
  mondayToFridayAt1AM() {}

  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_10AM)
  mondayToFridayAt10AM() {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  firstDayOfMonth() {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON)
  firstDayOfMonthAtNoon() {}
}
```

## Cron Job Options

```typescript
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  @Cron('45 * * * * *', {
    name: 'notifications',
    timeZone: 'America/New_York',
    disabled: false,
  })
  sendNotifications() {
    console.log('Sending notifications');
  }
}
```

**Options:**
- `name` - Unique identifier for the job
- `timeZone` - Specify timezone (e.g., 'America/New_York', 'Europe/London')
- `disabled` - Disable the cron job

## Intervals

Run tasks at fixed intervals:

```typescript
import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  @Interval(10000) // 10 seconds
  handleInterval() {
    console.log('Called every 10 seconds');
  }

  @Interval('notifications', 30000)
  sendNotifications() {
    console.log('Send notifications every 30 seconds');
  }
}
```

## Timeouts

Run tasks once after a delay:

```typescript
import { Injectable } from '@nestjs/common';
import { Timeout } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  @Timeout(5000) // 5 seconds
  handleTimeout() {
    console.log('Called once after 5 seconds');
  }

  @Timeout('delayed-task', 10000)
  delayedTask() {
    console.log('Called once after 10 seconds');
  }
}
```

## Dynamic Scheduling

Dynamically control scheduled tasks:

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class TasksService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  @Cron('* * 8 * * *', {
    name: 'notifications',
    timeZone: 'America/New_York',
  })
  triggerNotifications() {
    console.log('Sending notifications');
  }

  // Add a new cron job dynamically
  addCronJob(name: string, seconds: number) {
    const job = new CronJob(`${seconds} * * * * *`, () => {
      console.log(`Job ${name} executing at ${seconds} seconds`);
    });

    this.schedulerRegistry.addCronJob(name, job);
    job.start();

    console.log(`Job ${name} added`);
  }

  // Delete a cron job
  deleteCron(name: string) {
    this.schedulerRegistry.deleteCronJob(name);
    console.log(`Job ${name} deleted`);
  }

  // Get all cron jobs
  getCronJobs() {
    const jobs = this.schedulerRegistry.getCronJobs();
    jobs.forEach((value, key) => {
      let next;
      try {
        next = value.nextDate().toJSDate();
      } catch (e) {
        next = 'error: next fire date is in the past!';
      }
      console.log(`Job: ${key} -> next: ${next}`);
    });
  }

  // Stop a cron job
  stopCron(name: string) {
    const job = this.schedulerRegistry.getCronJob(name);
    job.stop();
    console.log(`Job ${name} stopped`);
  }

  // Start a cron job
  startCron(name: string) {
    const job = this.schedulerRegistry.getCronJob(name);
    job.start();
    console.log(`Job ${name} started`);
  }
}
```

## Dynamic Intervals

```typescript
import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  addInterval(name: string, milliseconds: number) {
    const callback = () => {
      console.log(`Interval ${name} executing`);
    };

    const interval = setInterval(callback, milliseconds);
    this.schedulerRegistry.addInterval(name, interval);
  }

  deleteInterval(name: string) {
    this.schedulerRegistry.deleteInterval(name);
    console.log(`Interval ${name} deleted`);
  }

  getIntervals() {
    const intervals = this.schedulerRegistry.getIntervals();
    intervals.forEach((key) => console.log(`Interval: ${key}`));
  }
}
```

## Dynamic Timeouts

```typescript
import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  addTimeout(name: string, milliseconds: number) {
    const callback = () => {
      console.log(`Timeout ${name} executing`);
    };

    const timeout = setTimeout(callback, milliseconds);
    this.schedulerRegistry.addTimeout(name, timeout);
  }

  deleteTimeout(name: string) {
    this.schedulerRegistry.deleteTimeout(name);
    console.log(`Timeout ${name} deleted`);
  }

  getTimeouts() {
    const timeouts = this.schedulerRegistry.getTimeouts();
    timeouts.forEach((key) => console.log(`Timeout: ${key}`));
  }
}
```

## Real-World Examples

### Database Cleanup

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredTokens() {
    this.logger.log('Running cleanup job for expired tokens');

    const result = await this.tokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    this.logger.log(`Deleted ${result.affected} expired tokens`);
  }

  @Cron('0 0 3 * * 0') // Every Sunday at 3 AM
  async cleanupOldLogs() {
    this.logger.log('Running cleanup job for old logs');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.logsRepository.delete({
      createdAt: LessThan(thirtyDaysAgo),
    });

    this.logger.log(`Deleted ${result.affected} old logs`);
  }
}
```

### Scheduled Reports

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private analyticsService: AnalyticsService,
    private emailService: EmailService,
  ) {}

  @Cron('0 0 9 * * 1') // Every Monday at 9 AM
  async sendWeeklyReport() {
    this.logger.log('Generating weekly report');

    const report = await this.analyticsService.generateWeeklyReport();
    await this.emailService.sendReport('weekly', report);

    this.logger.log('Weekly report sent');
  }

  @Cron('0 0 9 1 * *') // First day of month at 9 AM
  async sendMonthlyReport() {
    this.logger.log('Generating monthly report');

    const report = await this.analyticsService.generateMonthlyReport();
    await this.emailService.sendReport('monthly', report);

    this.logger.log('Monthly report sent');
  }
}
```

### Data Synchronization

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private externalApiService: ExternalApiService,
    private dataRepository: DataRepository,
  ) {}

  @Cron('0 */15 * * * *') // Every 15 minutes
  async syncData() {
    this.logger.log('Starting data synchronization');

    try {
      const externalData = await this.externalApiService.fetchData();

      for (const item of externalData) {
        await this.dataRepository.upsert(item);
      }

      this.logger.log(`Synchronized ${externalData.length} items`);
    } catch (error) {
      this.logger.error('Sync failed', error.stack);
    }
  }
}
```

### Cache Warming

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CacheWarmingService {
  private readonly logger = new Logger(CacheWarmingService.name);

  constructor(
    private cacheManager: Cache,
    private productsService: ProductsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async warmProductsCache() {
    this.logger.log('Warming products cache');

    const popularProducts = await this.productsService.getPopular();
    await this.cacheManager.set('products:popular', popularProducts, 3600000);

    const featuredProducts = await this.productsService.getFeatured();
    await this.cacheManager.set('products:featured', featuredProducts, 3600000);

    this.logger.log('Products cache warmed');
  }
}
```

### Notification Service

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private emailService: EmailService,
    private usersRepository: UsersRepository,
  ) {}

  @Cron('0 0 8 * * *') // Every day at 8 AM
  async sendDailyDigest() {
    this.logger.log('Sending daily digest');

    const users = await this.usersRepository.find({
      where: { emailPreferences: { dailyDigest: true } },
    });

    for (const user of users) {
      await this.emailService.sendDailyDigest(user);
    }

    this.logger.log(`Sent digest to ${users.length} users`);
  }

  @Cron('0 30 * * * *') // Every hour at :30
  async sendReminderNotifications() {
    this.logger.log('Checking for reminders');

    const reminders = await this.findUpcomingReminders();

    for (const reminder of reminders) {
      await this.emailService.sendReminder(reminder);
    }
  }

  private async findUpcomingReminders() {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    return this.remindersRepository.find({
      where: {
        scheduledAt: Between(now, oneHourLater),
        sent: false,
      },
    });
  }
}
```

## Timezone Support

```typescript
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  // New York timezone
  @Cron('0 0 9 * * *', {
    timeZone: 'America/New_York',
  })
  newYorkMorning() {
    console.log('9 AM in New York');
  }

  // London timezone
  @Cron('0 0 9 * * *', {
    timeZone: 'Europe/London',
  })
  londonMorning() {
    console.log('9 AM in London');
  }

  // Tokyo timezone
  @Cron('0 0 9 * * *', {
    timeZone: 'Asia/Tokyo',
  })
  tokyoMorning() {
    console.log('9 AM in Tokyo');
  }
}
```

## Error Handling

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    try {
      this.logger.log('Running scheduled task');
      await this.performTask();
      this.logger.log('Task completed successfully');
    } catch (error) {
      this.logger.error('Task failed', error.stack);
      // Optionally send alert
      await this.notifyError(error);
    }
  }

  private async performTask() {
    // Task implementation
  }

  private async notifyError(error: Error) {
    // Send error notification
  }
}
```

## Testing Scheduled Tasks

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should execute cron job', async () => {
    const spy = jest.spyOn(service, 'handleCron');

    // Manually trigger the method
    await service.handleCron();

    expect(spy).toHaveBeenCalled();
  });
});
```

## Best Practices

1. **Use logging** - Log task execution for monitoring
2. **Handle errors** - Always wrap tasks in try-catch
3. **Set appropriate intervals** - Don't schedule too frequently
4. **Use timezone** - Specify timezone for time-sensitive tasks
5. **Monitor performance** - Track execution time
6. **Avoid long-running tasks** - Use queues for heavy operations
7. **Use named tasks** - Name tasks for better management
8. **Test thoroughly** - Test scheduled logic separately
9. **Document schedules** - Comment cron expressions
10. **Clean up resources** - Properly handle cleanup in tasks

## Common Patterns

### Locking Mechanism
```typescript
@Injectable()
export class TasksService {
  private isRunning = false;

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    if (this.isRunning) {
      console.log('Previous job still running, skipping...');
      return;
    }

    this.isRunning = true;
    try {
      await this.performTask();
    } finally {
      this.isRunning = false;
    }
  }
}
```

### Conditional Execution
```typescript
@Injectable()
export class TasksService {
  constructor(private configService: ConfigService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async conditionalTask() {
    const isEnabled = this.configService.get('SCHEDULED_TASKS_ENABLED');

    if (!isEnabled) {
      return;
    }

    await this.performTask();
  }
}
```
