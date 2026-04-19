import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { BullModule } from '@nestjs/bullmq'
import { APP_GUARD } from '@nestjs/core'

import appConfig, { validateEnv } from './config/app.config'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { ServiceStatusModule } from './service-status/service-status.module'
import { FeedbackModule } from './feedback/feedback.module'
import { HealthModule } from './health/health.module'
import { CommentsModule } from './comments/comments.module'

@Module({
  imports: [
    // Config — load and validate env vars
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validate: validateEnv,
    }),

    // BullMQ — connect to Redis
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: { url: config.get<string>('redisUrl') },
      }),
    }),

    // Schedule — cron jobs
    ScheduleModule.forRoot(),

    // Throttler — default: 100 req/min globally
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    // Feature modules
    PrismaModule,
    AuthModule,
    ServiceStatusModule,
    FeedbackModule,
    HealthModule,
    CommentsModule,
  ],
  providers: [
    // Apply throttler globally (individual routes can override with @Throttle)
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Apply JWT guard globally (@Public() skips it)
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
