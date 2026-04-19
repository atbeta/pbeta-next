import { Injectable, Logger } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { PrismaService } from '../prisma/prisma.service'
import {
  SERVICE_STATUS_QUEUE,
  CHECK_SERVICE_JOB,
  CheckResult,
  ServiceStatus,
} from './service-status.types'

@Injectable()
export class ServiceStatusService {
  private readonly logger = new Logger(ServiceStatusService.name)

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(SERVICE_STATUS_QUEUE) private readonly queue: Queue,
  ) {}

  /** Enqueue a health check for all registered services */
  async enqueueAll(): Promise<void> {
    const services = await this.prisma.service.findMany({
      select: { id: true, url: true, name: true },
    })

    for (const svc of services) {
      await this.queue.add(
        CHECK_SERVICE_JOB,
        { serviceId: svc.id, url: svc.url },
        { removeOnComplete: 50, removeOnFail: 20 },
      )
    }

    this.logger.log(`Enqueued health checks for ${services.length} services`)
  }

  /** Persist a check result coming from the BullMQ worker */
  async persistResult(result: CheckResult): Promise<void> {
    const { serviceId, status, latencyMs } = result

    await this.prisma.$transaction([
      this.prisma.service.update({
        where: { id: serviceId },
        data: { status, checkedAt: new Date() },
      }),
      this.prisma.serviceStatusHistory.create({
        data: { serviceId, status, latencyMs, checkedAt: new Date() },
      }),
    ])
  }

  /** Return all services with their current status */
  async findAll() {
    return this.prisma.service.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        url: true,
        category: true,
        status: true,
        checkedAt: true,
      },
    })
  }

  /** Return recent history for a single service (last 48 data points) */
  async findHistory(serviceId: string) {
    return this.prisma.serviceStatusHistory.findMany({
      where: { serviceId },
      orderBy: { checkedAt: 'desc' },
      take: 48,
      select: { status: true, latencyMs: true, checkedAt: true },
    })
  }

  /** Create a new service */
  async create(data: {
    name: string
    description?: string
    url: string
    category?: string
  }) {
    const service = await this.prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        url: data.url,
        category: data.category ?? 'general',
        status: 'unknown' as ServiceStatus,
      },
    })
    
    // Trigger immediate check
    await this.queue.add(
      CHECK_SERVICE_JOB,
      { serviceId: service.id, url: service.url },
      { removeOnComplete: 50, removeOnFail: 20 },
    )
    
    return service
  }

  /** Update an existing service */
  async update(id: string, data: {
    name?: string
    description?: string
    url?: string
    category?: string
  }) {
    const service = await this.prisma.service.update({
      where: { id },
      data,
    })
    
    // Trigger immediate check if URL changed or just to be sure
    await this.queue.add(
      CHECK_SERVICE_JOB,
      { serviceId: service.id, url: service.url },
      { removeOnComplete: 50, removeOnFail: 20 },
    )
    
    return service
  }

  /** Remove a service */
  async remove(id: string) {
    return this.prisma.service.delete({
      where: { id },
    })
  }

  /** Seed a service entry (used in tests and setup scripts) */
  async upsertService(data: {
    id?: string
    name: string
    description?: string
    url: string
    category?: string
  }) {
    return this.prisma.service.upsert({
      where: { id: data.id ?? '' },
      update: { ...data },
      create: {
        name: data.name,
        description: data.description,
        url: data.url,
        category: data.category ?? 'general',
        status: 'unknown' as ServiceStatus,
      },
    })
  }
}
