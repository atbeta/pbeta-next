import { Test, TestingModule } from '@nestjs/testing'
import { getQueueToken } from '@nestjs/bullmq'
import { ServiceStatusService } from './service-status.service'
import { PrismaService } from '../prisma/prisma.service'
import { SERVICE_STATUS_QUEUE } from './service-status.types'

const mockPrisma = {
  service: {
    findMany: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
  },
  serviceStatusHistory: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn(),
}

const mockQueue = {
  add: jest.fn(),
}

describe('ServiceStatusService', () => {
  let service: ServiceStatusService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceStatusService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: getQueueToken(SERVICE_STATUS_QUEUE), useValue: mockQueue },
      ],
    }).compile()

    service = module.get(ServiceStatusService)
    jest.clearAllMocks()
  })

  describe('enqueueAll', () => {
    it('should enqueue a job for each service', async () => {
      mockPrisma.service.findMany.mockResolvedValue([
        { id: 'svc-1', url: 'https://a.example.com', name: 'Service A' },
        { id: 'svc-2', url: 'https://b.example.com', name: 'Service B' },
      ])

      await service.enqueueAll()

      expect(mockQueue.add).toHaveBeenCalledTimes(2)
      expect(mockQueue.add).toHaveBeenCalledWith(
        'check-service',
        { serviceId: 'svc-1', url: 'https://a.example.com' },
        expect.any(Object),
      )
    })

    it('should do nothing when no services exist', async () => {
      mockPrisma.service.findMany.mockResolvedValue([])
      await service.enqueueAll()
      expect(mockQueue.add).not.toHaveBeenCalled()
    })
  })

  describe('persistResult', () => {
    it('should call $transaction with 2 operations (update + history create)', async () => {
      mockPrisma.$transaction.mockResolvedValue([])
      mockPrisma.service.update.mockReturnValue({ id: 'svc-1' })
      mockPrisma.serviceStatusHistory.create.mockReturnValue({ id: 'hist-1' })

      await service.persistResult({ serviceId: 'svc-1', status: 'up', latencyMs: 120 })

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1)
      // $transaction receives an array of 2 query results
      const [ops] = mockPrisma.$transaction.mock.calls
      expect(ops[0]).toHaveLength(2)
    })
  })

  describe('findAll', () => {
    it('should return services list', async () => {
      const expected = [{ id: 'svc-1', name: 'Service A', status: 'up' }]
      mockPrisma.service.findMany.mockResolvedValue(expected)

      const result = await service.findAll()
      expect(result).toEqual(expected)
      expect(mockPrisma.service.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { name: 'asc' } }),
      )
    })
  })

  describe('findHistory', () => {
    it('should return up to 48 history records for a service', async () => {
      const records = Array.from({ length: 10 }, (_, i) => ({
        status: 'up',
        latencyMs: 100 + i,
        checkedAt: new Date(),
      }))
      mockPrisma.serviceStatusHistory.findMany.mockResolvedValue(records)

      const result = await service.findHistory('svc-1')
      expect(result).toHaveLength(10)
      expect(mockPrisma.serviceStatusHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { serviceId: 'svc-1' }, take: 48 }),
      )
    })
  })
})
