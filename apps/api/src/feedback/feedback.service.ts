import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateFeedbackDto } from './feedback.dto'

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFeedbackDto) {
    return this.prisma.feedback.create({
      data: {
        serviceId: dto.serviceId ?? null,
        message: dto.message,
        contact: dto.contact || null,
      },
      select: { id: true, createdAt: true },
    })
  }

  async findAll(serviceId?: string) {
    return this.prisma.feedback.findMany({
      where: serviceId ? { serviceId } : {},
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { id: true, serviceId: true, message: true, contact: true, createdAt: true },
    })
  }
}
