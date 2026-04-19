/**
 * E2E tests — require real PostgreSQL + Redis (run via docker-compose)
 * Before running: docker compose -f infra/docker-compose.yml up -d
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'

describe('API E2E', () => {
  let app: INestApplication<App>
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api/v1')
    await app.init()

    prisma = moduleFixture.get(PrismaService)
  })

  afterAll(async () => {
    await prisma.serviceStatusHistory.deleteMany()
    await prisma.feedback.deleteMany()
    await prisma.service.deleteMany()
    await app.close()
  })

  // ─── Health ────────────────────────────────────────────────────────────────

  describe('GET /api/v1/health', () => {
    it('returns 200 with database status', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200)
      expect(res.body.status).toBe('ok')
      expect(res.body.info?.database?.status).toBe('up')
    })
  })

  // ─── Services ──────────────────────────────────────────────────────────────

  describe('GET /api/v1/services', () => {
    let serviceId: string

    beforeAll(async () => {
      const svc = await prisma.service.create({
        data: { name: 'Test Service', url: 'https://example.com', category: 'test' },
      })
      serviceId = svc.id
    })

    it('returns list of services', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/services').expect(200)
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body.some((s: { id: string }) => s.id === serviceId)).toBe(true)
    })

    it('returns history for a service', async () => {
      await prisma.serviceStatusHistory.create({
        data: { serviceId, status: 'up', latencyMs: 80 },
      })

      const res = await request(app.getHttpServer())
        .get(`/api/v1/services/${serviceId}/history`)
        .expect(200)

      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body[0]).toMatchObject({ status: 'up', latencyMs: 80 })
    })
  })

  // ─── Feedback ──────────────────────────────────────────────────────────────

  describe('POST /api/v1/feedback', () => {
    it('creates feedback with valid payload', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/feedback')
        .send({ message: 'This is very helpful, thank you!' })
        .expect(201)

      expect(res.body).toHaveProperty('id')
      expect(res.body).toHaveProperty('createdAt')
    })

    it('rejects feedback with message too short', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/feedback')
        .send({ message: 'hi' })
        .expect(400)
    })

    it('rejects invalid email in contact field', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/feedback')
        .send({ message: 'Valid message here', contact: 'not-an-email' })
        .expect(400)
    })

    it('accepts empty string contact (anonymous)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/feedback')
        .send({ message: 'Anonymous feedback here', contact: '' })
        .expect(201)

      expect(res.body).toHaveProperty('id')
    })
  })

  // ─── Auth guard on private routes ─────────────────────────────────────────

  describe('Private routes require auth', () => {
    it('GET /api/v1/feedback requires JWT', async () => {
      await request(app.getHttpServer()).get('/api/v1/feedback').expect(401)
    })

    it('POST /api/v1/services/check requires JWT', async () => {
      await request(app.getHttpServer()).post('/api/v1/services/check').expect(401)
    })
  })
})
