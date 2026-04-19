// Shared types and utilities between apps/web and apps/api

// ── Generic response wrapper ───────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  ok: boolean
  error?: string
}

// ── Service monitoring ─────────────────────────────────────────────────────

export type ServiceStatus = 'up' | 'down' | 'degraded' | 'unknown'

export interface ServiceEntry {
  id: string
  name: string
  description?: string | null
  url: string
  category: string
  status: ServiceStatus
  checkedAt?: string | null
}

// ── Feedback ───────────────────────────────────────────────────────────────

export interface FeedbackPayload {
  serviceId?: string
  message: string
  contact?: string
}

export interface FeedbackEntry {
  id: string
  message: string
  contact?: string | null
  serviceId?: string | null
  createdAt: string
}

// ── Comments ───────────────────────────────────────────────────────────────

export interface CommentEntry {
  id: string
  slug: string
  author: string
  email?: string | null
  content: string
  isAdmin?: boolean
  parentId?: string | null
  replies?: CommentEntry[]
  createdAt: string
}
