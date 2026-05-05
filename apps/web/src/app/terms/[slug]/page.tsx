import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { allTerms } from 'content-collections'
import { MDXContent } from '@/components/mdx-content'
import { CDVisualization } from '@/components/terms/cd-visualization'
import { OverlayVisualization } from '@/components/terms/overlay-visualization'
import { DefectGallery } from '@/components/terms/defect-gallery'

export async function generateStaticParams() {
  return allTerms.map((t) => ({ slug: t._meta.path }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const term = allTerms.find((t) => t._meta.path === slug)
  if (!term) return { title: '未找到' }
  return { title: term.title }
}

export default async function TermDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const term = allTerms.find((t) => t._meta.path === slug)
  if (!term) notFound()

  const diffLabel: Record<string, string> = {
    beginner: '入门',
    intermediate: '进阶',
    advanced: '深入',
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 anim-fade-up">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-1 h-4 bg-[var(--accent)] rounded-full" />
          <span className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase tracking-[0.2em]">
            {term.category}
          </span>
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--muted-foreground)]">
            {diffLabel[term.difficulty] || term.difficulty}
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-2">{term.title}</h1>
        <p className="text-sm text-[var(--muted-foreground)] max-w-lg leading-relaxed">
          {term.description}
        </p>
        {term.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {term.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted-foreground)] border border-[var(--border)] rounded bg-[var(--muted)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {term.visualization === 'cd-measurement' && (
        <div className="mb-10 anim-fade-up delay-1">
          <CDVisualization />
        </div>
      )}
      {term.visualization === 'overlay-sim' && (
        <div className="mb-10 anim-fade-up delay-1">
          <OverlayVisualization />
        </div>
      )}
      {term.visualization === 'defect-gallery' && (
        <div className="mb-10 anim-fade-up delay-1">
          <DefectGallery />
        </div>
      )}

      <article className="prose prose-sm max-w-none anim-fade-up delay-1">
        <MDXContent code={term.mdx} />
      </article>
    </div>
  )
}
