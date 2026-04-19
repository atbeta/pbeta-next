import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ServiceStatusService } from './service-status.service'

@Injectable()
export class ServiceStatusScheduler {
  private readonly logger = new Logger(ServiceStatusScheduler.name)

  constructor(private readonly statusService: ServiceStatusService) {}

  /** Run health checks every 5 minutes */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron(): Promise<void> {
    this.logger.log('Scheduling service health checks...')
    await this.statusService.enqueueAll()
  }
}
