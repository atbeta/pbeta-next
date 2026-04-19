// Shared content schema and frontmatter types
// Used by both apps/web (content-collections config) and anywhere needing content types

// ── Status enums as const arrays (single source of truth) ─────────────────
// content-collections.ts uses these with z.enum() so values never drift

export const NOTE_STATUSES = ['architecture', 'development', 'research', 'snippet'] as const
export type NoteStatus = (typeof NOTE_STATUSES)[number]

export const PROJECT_STATUSES = ['active', 'stable', 'archive'] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

// ── Content interfaces ─────────────────────────────────────────────────────

export interface BaseContent {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
}

export interface Note extends BaseContent {
  status: NoteStatus
}

export interface Project extends BaseContent {
  projectStatus: ProjectStatus
  url?: string
  repo?: string
}

export interface Research extends BaseContent {
  summary?: string
}
