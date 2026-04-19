import type { Metadata } from 'next'
import type { ServiceEntry } from '@pbeta/shared'
import { API_BASE_URL } from '@/lib/api-base-url'

export const metadata: Metadata = { title: '服务' }

interface ServicesResult {
  services: ServiceEntry[]
  error: boolean
}

const statusConfig = {
  up:       { dot: 'bg-green-500', pulse: true,  label: '正常' },
  degraded: { dot: 'bg-yellow-500', pulse: false, label: '降级' },
  down:     { dot: 'bg-red-500',   pulse: false, label: '故障' },
  unknown:  { dot: 'bg-[var(--muted-foreground)]', pulse: false, label: '未知' },
}

async function getServices(): Promise<ServicesResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/services`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    })

    if (!res.ok) {
      return { services: [], error: true }
    }

    return { services: await res.json(), error: false }
  } catch (err) {
    console.error('Failed to fetch services:', err)
    return { services: [], error: true }
  }
}

export default async function ServicesPage() {
  const { services, error } = await getServices()

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 anim-fade-up">
        <h1 className="text-xl font-bold tracking-tight mb-2">服务</h1>
        <p className="text-sm text-[var(--muted-foreground)] max-w-md">
          对外开放的公益 Web 服务。长期维护，完全免费。
        </p>
      </div>

      {/* Service list */}
      {services.length > 0 ? (
        <ul className="space-y-2 anim-fade-up delay-1">
          {services.map((svc) => {
            const sc = statusConfig[svc.status] || statusConfig.unknown
            return (
              <li key={svc.id}>
                <div className="flex items-start gap-4 p-5 border border-[var(--border)] rounded-lg bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--muted)] transition-all duration-200">
                  {/* Status indicator */}
                  <div className="mt-0.5 shrink-0">
                    <div className="relative flex h-2 w-2">
                      {sc.pulse && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-60" />
                      )}
                      <span className={`relative inline-flex h-2 w-2 rounded-full ${sc.dot}`} />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-semibold">{svc.name}</span>
                      <span className="px-1.5 py-0.5 font-mono text-[9px] text-[var(--muted-foreground)] border border-[var(--border)] rounded bg-[var(--muted)]">
                        {svc.category}
                      </span>
                    </div>
                    {svc.description && (
                      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                        {svc.description}
                      </p>
                    )}
                  </div>

                  {/* Status + Link */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`font-mono text-[10px] ${svc.status === 'up' ? 'text-green-600 dark:text-green-400' : 'text-[var(--muted-foreground)]'}`}>
                      {sc.label}
                    </span>
                    {svc.url && svc.url !== '#' && (
                      <a
                        href={svc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                      >
                        访问 ↗
                      </a>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      ) : error ? (
        <div className="anim-fade-up delay-1 rounded-xl border border-red-500/20 bg-red-500/5 px-6 py-8 text-center">
          <p className="text-sm font-medium text-[var(--foreground)]">服务状态暂时不可用</p>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            当前无法连接状态 API，请稍后刷新重试。
          </p>
        </div>
      ) : (
        <div className="text-center py-12 text-[var(--muted-foreground)] text-sm border-2 border-dashed border-[var(--border)] rounded-xl anim-fade-up delay-1">
          暂无公开服务
        </div>
      )}

      {/* Footer note */}
      <p className="mt-8 text-xs text-[var(--muted-foreground)] anim-fade-up delay-2">
        状态数据每 5 分钟自动更新。有服务建议或问题，欢迎{' '}
        <a
          href="mailto:me@pbeta.me"
          className="text-[var(--foreground)] underline underline-offset-2 hover:text-[var(--accent)] transition-colors"
        >
          联系我
        </a>
        。
      </p>
    </div>
  )
}
