import { Test, TestingModule } from '@nestjs/testing'
import { FeedbackService } from './feedback.service'
import { PrismaService } from '../prisma/prisma.service'

const mockPrisma = {
  feedback: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
}

describe('FeedbackService', () => {
  let service: FeedbackService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get(FeedbackService)
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should create feedback and return id + createdAt', async () => {
      const now = new Date()
      mockPrisma.feedback.create.mockResolvedValue({ id: 'fb-1', createdAt: now })

      const result = await service.create({ message: 'Great service!' })

      expect(result).toEqual({ id: 'fb-1', createdAt: now })
      expect(mockPrisma.feedback.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ message: 'Great service!', serviceId: null }),
        }),
      )
    })

    it('should store optional contact and serviceId', async () => {
      mockPrisma.feedback.create.mockResolvedValue({ id: 'fb-2', createdAt: new Date() })

      await service.create({
        message: 'Bug report',
        contact: 'user@example.com',
        serviceId: 'svc-1',
      })

      expect(mockPrisma.feedback.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            message: 'Bug report',
            contact: 'user@example.com',
            serviceId: 'svc-1',
          }),
        }),
      )
    })

    it('should store null contact when empty string provided', async () => {
      mockPrisma.feedback.create.mockResolvedValue({ id: 'fb-3', createdAt: new Date() })

      await service.create({ message: 'Hello', contact: '' })

      expect(mockPrisma.feedback.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ contact: null }),
        }),
      )
    })
  })

  describe('findAll', () => {
    it('should return all feedback when no serviceId filter', async () => {
      const items = [{ id: 'fb-1', message: 'Good' }]
      mockPrisma.feedback.findMany.mockResolvedValue(items)

      const result = await service.findAll()
      expect(result).toEqual(items)
      expect(mockPrisma.feedback.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      )
    })

    it('should filter by serviceId when provided', async () => {
      mockPrisma.feedback.findMany.mockResolvedValue([])

      await service.findAll('svc-1')
      expect(mockPrisma.feedback.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { serviceId: 'svc-1' } }),
      )
    })
  })
})
