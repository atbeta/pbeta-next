import type { Metadata } from 'next'
import Link from 'next/link'
import { allProjects } from 'content-collections'
import { Tag } from '@/components/tag'
import { formatDate } from '@/lib/format'

export const metadata: Metadata = { title: '项目' }

const statusConfig: Record<string, { dot: string; label: string }> = {
  active:  { dot: 'bg-green-500', label: '活跃' },
  stable:  { dot: 'bg-blue-500', label: '稳定' },
  archive: { dot: 'bg-[var(--muted-foreground)]', label: '归档' },
}

export default function ProjectsPage() {
  const active  = allProjects.filter(p => p.projectStatus === 'active').sort((a, b) => (a.date < b.date ? 1 : -1))
  const stable  = allProjects.filter(p => p.projectStatus === 'stable').sort((a, b) => (a.date < b.date ? 1 : -1))
  const archive = allProjects.filter(p => p.projectStatus === 'archive').sort((a, b) => (a.date < b.date ? 1 : -1))
  const ordered = [...active, ...stable, ...archive]

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 anim-fade-up">
        <h1 className="text-xl font-bold tracking-tight mb-2">项目</h1>
        <p className="text-sm text-[var(--muted-foreground)] max-w-md">
          亲手构建的工具、应用和实验项目。
        </p>
      </div>

      {ordered.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">暂无内容。</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 anim-fade-up delay-1">
          {ordered.map((project) => {
            const sc = statusConfig[project.projectStatus]
            return (
              <Link
                key={project._meta.path}
                href={`/projects/${project._meta.path}`}
                className="group flex flex-col gap-3 p-5 border border-[var(--border)] rounded-lg bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--muted)] transition-all duration-200"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-sm font-semibold group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                    {project.title}
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    <span className="font-mono text-[9px] text-[var(--muted-foreground)]">{sc.label}</span>
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed flex-1">
                  {project.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map((tag) => <Tag key={tag}>{tag}</Tag>)}
                  </div>
                  <span className="font-mono text-[10px] text-[var(--muted-foreground)] tabular-nums shrink-0 ml-2">
                    {formatDate(project.date)}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
