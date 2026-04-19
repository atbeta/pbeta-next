import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private static pool: Pool | null = null
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL environment variable is not set')

    // Re-use pool across requests to avoid connection exhaustion
    if (!PrismaService.pool) {
      PrismaService.pool = new Pool({ connectionString: url })
    }

    super({ adapter: new PrismaPg(PrismaService.pool as any) })
  }

  async onModuleInit() {
    await this.$connect()
    this.logger.log('Database connected')
  }

  async onModuleDestroy() {
    await this.$disconnect()
    if (PrismaService.pool) {
      await PrismaService.pool.end()
      PrismaService.pool = null
    }
    this.logger.log('Database disconnected')
  }
}
