import { Test, TestingModule } from '@nestjs/testing'
import { ServiceStatusProcessor } from './service-status.processor'
import { ServiceStatusService } from './service-status.service'
import { Job } from 'bullmq'
import { CHECK_SERVICE_JOB } from './service-status.types'

const mockStatusService = {
  persistResult: jest.fn(),
}

describe('ServiceStatusProcessor', () => {
  let processor: ServiceStatusProcessor

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceStatusProcessor,
        { provide: ServiceStatusService, useValue: mockStatusService },
      ],
    }).compile()

    processor = module.get(ServiceStatusProcessor)
    jest.clearAllMocks()
  })

  const makeJob = (data: object, name = CHECK_SERVICE_JOB) =>
    ({ name, data } as unknown as Job)

  it('should skip unknown job names', async () => {
    await processor.process(makeJob({}, 'unknown-job'))
    expect(mockStatusService.persistResult).not.toHaveBeenCalled()
  })

  it('should mark service as down when fetch throws', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('network error'))

    await processor.process(
      makeJob({ serviceId: 'svc-1', url: 'https://unreachable.example.com' }),
    )

    expect(mockStatusService.persistResult).toHaveBeenCalledWith(
      expect.objectContaining({ serviceId: 'svc-1', status: 'down', latencyMs: null }),
    )
  })

  it('should mark service as up on 200 response', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
    } as Response)

    await processor.process(
      makeJob({ serviceId: 'svc-1', url: 'https://ok.example.com' }),
    )

    expect(mockStatusService.persistResult).toHaveBeenCalledWith(
      expect.objectContaining({ serviceId: 'svc-1', status: 'up' }),
    )
    expect(mockStatusService.persistResult.mock.calls[0][0].latencyMs).toBeGreaterThanOrEqual(0)
  })

  it('should mark service as down on 5xx response', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 503,
    } as Response)

    await processor.process(
      makeJob({ serviceId: 'svc-1', url: 'https://error.example.com' }),
    )

    expect(mockStatusService.persistResult).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'down' }),
    )
  })

  it('should mark service as degraded on 4xx response', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 403,
    } as Response)

    await processor.process(
      makeJob({ serviceId: 'svc-1', url: 'https://forbidden.example.com' }),
    )

    expect(mockStatusService.persistResult).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'degraded' }),
    )
  })
})
