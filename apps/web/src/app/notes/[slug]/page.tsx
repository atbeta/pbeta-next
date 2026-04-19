import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { allNotes } from 'content-collections'
import { MDXContent } from '@/components/mdx-content'
import { Tag } from '@/components/tag'
import { formatDate } from '@/lib/format'
import { CommentSection } from '@/components/comments/comment-section'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return allNotes.map((note) => ({ slug: note._meta.path }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const note = allNotes.find((n) => n._meta.path === slug)
  if (!note) return {}
  return { title: note.title, description: note.description }
}

const statusConfig: Record<string, { icon: string; label: string }> = {
  architecture: { icon: '🏛️', label: '架构' },
  development:  { icon: '🛠️', label: '开发' },
  research:     { icon: '🔍', label: '研究' },
  snippet:      { icon: '📝', label: '速记' },
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params
  const note = allNotes.find((n) => n._meta.path === slug)
  if (!note) notFound()

  const sc = statusConfig[note.status]

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Breadcrumb */}
      <Link
        href="/notes"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-8 group"
      >
        <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
        返回随笔
      </Link>

      {/* Header */}
      <div className="mb-10 space-y-4 anim-fade-up">
        <h1 className="text-2xl font-bold tracking-tight leading-snug">{note.title}</h1>
        <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">{note.description}</p>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--muted)] font-mono text-[10px] text-[var(--muted-foreground)]">
            {sc.icon} {sc.label}
          </span>
          <span className="font-mono text-[10px] text-[var(--muted-foreground)] tabular-nums">
            {formatDate(note.date)}
          </span>
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.map((tag: string) => <Tag key={tag}>{tag}</Tag>)}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--border)] mb-10" />

      {/* Content */}
      <div className="anim-fade-up delay-1">
        <MDXContent code={note.mdx} />
      </div>

      {/* Comments */}
      <CommentSection slug={`/notes/${slug}`} />
    </div>
  )
}
