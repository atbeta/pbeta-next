import type { Metadata } from 'next'
import Link from 'next/link'
import { allTerms } from 'content-collections'
import type { Term } from 'content-collections'

export const metadata: Metadata = { title: '术语百科' }

const categoryLabels: Record<string, string> = {
  metrology: '量检测',
  lithography: '光刻',
  transistor: '晶体管',
  etching: '刻蚀',
  deposition: '沉积',
  cmp: 'CMP',
  wafer: '晶圆制造',
  packaging: '封装',
}

const difficultyBadge: Record<string, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '深入',
}

export default function TermsPage() {
  const grouped: Record<string, Term[]> = {}
  for (const t of allTerms) {
    if (!grouped[t.category]) grouped[t.category] = []
    grouped[t.category].push(t)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-10 anim-fade-up">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-1 h-4 bg-[var(--accent)] rounded-full" />
          <span className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase tracking-[0.2em]">
            Glossary
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-2">术语可视化百科</h1>
        <p className="text-sm text-[var(--muted-foreground)] max-w-lg leading-relaxed">
          用交互式可视化理解半导体制造的核心概念。每个术语都配有图示、动画或交互模拟。
        </p>
      </div>

      {Object.keys(categoryLabels).map((cat, ci) => {
        const terms = grouped[cat]
        if (!terms || terms.length === 0) return null
        return (
          <section key={cat} className={`mb-10 anim-fade-up delay-${Math.min(ci + 1, 3)}`}>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-medium text-[var(--muted-foreground)]">
                {categoryLabels[cat] || cat}
              </h2>
              <span className="font-mono text-[9px] text-[var(--muted-foreground)]/50">
                {terms.length} 个术语
              </span>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {terms.map((t) => (
                <Link
                  key={t._meta.path}
                  href={`/terms/${t._meta.path}`}
                  className="group flex flex-col gap-2 p-4 border border-[var(--border)] rounded-lg bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--muted)] transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-sm font-semibold group-hover:text-[var(--accent)] transition-colors">
                      {t.title}
                    </span>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--muted-foreground)] shrink-0">
                      {difficultyBadge[t.difficulty] || t.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-2">
                    {t.description}
                  </p>
                  {t.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {t.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted-foreground)] border border-[var(--border)] rounded bg-[var(--muted)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
