import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { allProjects } from 'content-collections'
import { MDXContent } from '@/components/mdx-content'
import { Tag } from '@/components/tag'
import { formatDate } from '@/lib/format'
import { CommentSection } from '@/components/comments/comment-section'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return allProjects.map((p) => ({ slug: p._meta.path }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = allProjects.find((p) => p._meta.path === slug)
  if (!project) return {}
  return { title: project.title, description: project.description }
}

const statusConfig: Record<string, { dot: string; label: string }> = {
  active:  { dot: 'bg-green-500', label: '进行中' },
  stable:  { dot: 'bg-blue-500', label: '已完成' },
  archive: { dot: 'bg-[var(--muted-foreground)]', label: '归档' },
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = allProjects.find((p) => p._meta.path === slug)
  if (!project) notFound()

  const sc = statusConfig[project.projectStatus]

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Breadcrumb */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-8 group"
      >
        <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
        返回项目
      </Link>

      {/* Header */}
      <div className="mb-10 space-y-4 anim-fade-up">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight leading-snug">{project.title}</h1>
          <span className="flex items-center gap-1.5 shrink-0 mt-1">
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{sc.label}</span>
          </span>
        </div>

        <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">{project.description}</p>

        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[10px] text-[var(--muted-foreground)] tabular-nums">
            {formatDate(project.date)}
          </span>
          {(project.url || project.repo) && (
            <>
              <span className="text-[var(--border-strong)]">·</span>
              <div className="flex items-center gap-3">
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-[var(--accent)] hover:opacity-80 transition-opacity"
                  >
                    访问 ↗
                  </a>
                )}
                {project.repo && (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    源码 ↗
                  </a>
                )}
              </div>
            </>
          )}
        </div>

        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--border)] mb-10" />

      {/* Content */}
      <div className="anim-fade-up delay-1">
        <MDXContent code={project.mdx} />
      </div>

      {/* Comments */}
      <CommentSection slug={`/projects/${slug}`} />
    </div>
  )
}
