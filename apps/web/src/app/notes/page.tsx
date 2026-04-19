import type { Metadata } from 'next'
import Link from 'next/link'
import { allNotes } from 'content-collections'
import { Tag } from '@/components/tag'
import { formatDate } from '@/lib/format'

export const metadata: Metadata = { title: '随笔' }

const statusConfig: Record<string, { icon: string; label: string; color: string }> = {
  architecture: { icon: '🏛️', label: '架构', color: 'text-blue-600 dark:text-blue-400' },
  development:  { icon: '🛠️', label: '开发', color: 'text-emerald-600 dark:text-emerald-400' },
  research:     { icon: '🔍', label: '研究', color: 'text-purple-600 dark:text-purple-400' },
  snippet:      { icon: '📝', label: '速记', color: 'text-amber-600 dark:text-amber-400' },
}

export default function NotesPage() {
  const notes = allNotes.sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 anim-fade-up">
        <h1 className="text-xl font-bold tracking-tight mb-2">随笔</h1>
        <p className="text-sm text-[var(--muted-foreground)] max-w-md">
          技术深度探索与日常开发随笔。记录从零碎速记到系统架构的成长过程。
        </p>
        {/* Legend */}
        <div className="flex items-center gap-4 mt-4">
          {Object.entries(statusConfig).map(([key, val]) => (
            <span key={key} className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--muted-foreground)]">
              <span>{val.icon}</span>
              {val.label}
            </span>
          ))}
        </div>
      </div>

      {notes.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">暂无内容。</p>
      ) : (
        <div className="flex flex-col border-y border-[var(--border)] divide-y divide-[var(--border)] anim-fade-up delay-1 sm:-mx-4">
          {notes.map((note) => (
            <Link
              key={note._meta.path}
              href={`/notes/${note._meta.path}`}
              className="group flex flex-col sm:flex-row sm:items-start justify-between gap-4 py-6 sm:px-4 hover:bg-[var(--muted)]/30 transition-all duration-300"
            >
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                    {note.title}
                  </h2>
                  <span className="shrink-0 text-sm" title={statusConfig[note.status]?.label}>
                    {statusConfig[note.status]?.icon}
                  </span>
                </div>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {note.description}
                </p>
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {note.tags.map((tag: string) => <Tag key={tag}>{tag}</Tag>)}
                  </div>
                )}
              </div>
              <div className="shrink-0 sm:mt-1">
                <span className="font-mono text-sm text-[var(--muted-foreground)] tabular-nums">
                  {formatDate(note.date)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
