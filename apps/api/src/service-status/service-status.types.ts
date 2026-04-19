// ServiceStatus is the shared contract between API and web — import from @pbeta/shared
export type { ServiceStatus } from '@pbeta/shared'

export const SERVICE_STATUS_QUEUE = 'service-status'
export const CHECK_SERVICE_JOB = 'check-service'

export interface CheckServiceJobData {
  serviceId: string
  url: string
}

export interface CheckResult {
  serviceId: string
  status: import('@pbeta/shared').ServiceStatus
  latencyMs: number | null
}
