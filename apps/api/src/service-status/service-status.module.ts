import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { SERVICE_STATUS_QUEUE } from './service-status.types'
import { ServiceStatusService } from './service-status.service'
import { ServiceStatusProcessor } from './service-status.processor'
import { ServiceStatusScheduler } from './service-status.scheduler'
import { ServiceStatusController } from './service-status.controller'

@Module({
  imports: [
    BullModule.registerQueue({
      name: SERVICE_STATUS_QUEUE,
    }),
  ],
  providers: [ServiceStatusService, ServiceStatusProcessor, ServiceStatusScheduler],
  controllers: [ServiceStatusController],
  exports: [ServiceStatusService],
})
export class ServiceStatusModule {}
