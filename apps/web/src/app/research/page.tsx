import type { Metadata } from 'next'
import Link from 'next/link'
import { allResearch } from 'content-collections'
import { Tag } from '@/components/tag'
import { formatDate } from '@/lib/format'

export const metadata: Metadata = { title: '研究' }

export default function ResearchPage() {
  const items = allResearch.sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 anim-fade-up">
        <h1 className="text-xl font-bold tracking-tight mb-2">研究</h1>
        <p className="text-sm text-[var(--muted-foreground)] max-w-md">
          深度研究、实验记录和可复现的发现。有完整方法论和数据支撑。
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">暂无内容。</p>
      ) : (
        <ul className="space-y-3 anim-fade-up delay-1">
          {items.map((item) => (
            <li key={item._meta.path}>
              <Link
                href={`/research/${item._meta.path}`}
                className="group flex flex-col gap-3 p-5 border border-[var(--border)] rounded-lg bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--muted)] transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-sm font-semibold group-hover:text-[var(--accent)] transition-colors">
                    {item.title}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--muted-foreground)] tabular-nums shrink-0 pt-0.5">
                    {formatDate(item.date)}
                  </span>
                </div>

                {item.summary && (
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-2">
                    {item.summary}
                  </p>
                )}

                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag: string) => <Tag key={tag}>{tag}</Tag>)}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
