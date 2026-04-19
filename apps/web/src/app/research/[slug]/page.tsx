import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { allResearch } from 'content-collections'
import { MDXContent } from '@/components/mdx-content'
import { Tag } from '@/components/tag'
import { formatDate } from '@/lib/format'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return allResearch.map((r) => ({ slug: r._meta.path }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = allResearch.find((r) => r._meta.path === slug)
  if (!item) return {}
  return { title: item.title, description: item.description }
}

export default async function ResearchDetailPage({ params }: Props) {
  const { slug } = await params
  const item = allResearch.find((r) => r._meta.path === slug)
  if (!item) notFound()

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Breadcrumb */}
      <Link
        href="/research"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-8 group"
      >
        <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
        返回研究
      </Link>

      {/* Header */}
      <div className="mb-10 space-y-4 anim-fade-up">
        <h1 className="text-2xl font-bold tracking-tight leading-snug">{item.title}</h1>

        {item.summary && (
          <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--muted)] text-sm text-[var(--muted-foreground)] leading-relaxed">
            <span className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider block mb-1.5">摘要</span>
            {item.summary}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] text-[var(--muted-foreground)] tabular-nums">
            {formatDate(item.date)}
          </span>
          {item.tags.length > 0 && (
            <>
              <span className="text-[var(--border-strong)]">·</span>
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--border)] mb-10" />

      {/* Content */}
      <div className="anim-fade-up delay-1">
        <MDXContent code={item.mdx} />
      </div>
    </div>
  )
}
