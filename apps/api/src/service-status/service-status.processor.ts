import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import {
  SERVICE_STATUS_QUEUE,
  CHECK_SERVICE_JOB,
  CheckServiceJobData,
  CheckResult,
  ServiceStatus,
} from './service-status.types'
import { ServiceStatusService } from './service-status.service'

@Processor(SERVICE_STATUS_QUEUE)
export class ServiceStatusProcessor extends WorkerHost {
  private readonly logger = new Logger(ServiceStatusProcessor.name)

  constructor(private readonly statusService: ServiceStatusService) {
    super()
  }

  async process(job: Job<CheckServiceJobData>): Promise<void> {
    if (job.name !== CHECK_SERVICE_JOB) return

    const { serviceId, url } = job.data
    const result = await this.checkUrl(serviceId, url)
    await this.statusService.persistResult(result)
    this.logger.debug(`${url} → ${result.status} (${result.latencyMs}ms)`)
  }

  private async checkUrl(serviceId: string, url: string): Promise<CheckResult> {
    const start = Date.now()
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10_000)
      
      const res = await fetch(url, {
        method: 'GET', // HEAD can be blocked by some WAFs
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; pbeta-monitor/1.0; +https://pbeta.me)'
        },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      const latencyMs = Date.now() - start
      // 520/521/522/523 are Cloudflare errors, usually meaning origin is down
      const status: ServiceStatus = res.ok ? 'up' : res.status >= 500 ? 'down' : 'degraded'
      return { serviceId, status, latencyMs }
    } catch {
      return { serviceId, status: 'down', latencyMs: null }
    }
  }
}
