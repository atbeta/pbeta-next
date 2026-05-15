import Link from 'next/link'
import { allNotes, allProjects } from 'content-collections'
import { formatDate } from '@/lib/format'

const areas = [
  {
    href: '/projects',
    label: '项目',
    desc: '构建工具与应用',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </svg>
    ),
  },
  {
    href: '/notes',
    label: '随笔',
    desc: '想法与观察',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M4 6h16M4 12h10M4 18h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/research',
    label: '研究',
    desc: '深度研究',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/services',
    label: '服务',
    desc: '在线服务状态',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M12 2v20M2 12h20" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
]

const statusIcon: Record<string, string> = {
  architecture: '🏛️',
  development: '🛠️',
  research: '🔍',
  snippet: '📝',
}

const opportunityStatuses = {
  open: { label: 'Open for opportunities', color: 'bg-green-500' },
  busy: { label: 'Currently busy', color: 'bg-amber-500' },
  closed: { label: 'Not available', color: 'bg-[var(--muted-foreground)]' },
}

export default function Home() {
  const recentNotes = allNotes
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 4)

  const recentProjects = allProjects
    .filter((p) => p.projectStatus === 'active')
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 4)

  return (
    <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-10 space-y-24">
      
      {/* ── Background Glow ───────────────────────────── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[var(--accent)] opacity-[0.03] blur-[120px] pointer-events-none rounded-full" />

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative anim-fade-up">
        <div className="flex items-center gap-2.5 mb-6 px-3 py-1.5 w-fit rounded-full bg-[var(--muted)]/50 border border-[var(--border)] anim-fade-up">
          <span className="text-sm">🏗️</span>
          <span className="font-mono text-[10px] sm:text-xs font-medium tracking-wide text-[var(--muted-foreground)] uppercase">
            Building things with curiosity & care
          </span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-[var(--foreground)] to-[var(--muted-foreground)]">
          技术备忘录
          <span className="block text-xl sm:text-2xl font-medium mt-2 opacity-60">Tech Memos</span>
        </h1>
        
        <p className="text-[var(--muted-foreground)] text-lg leading-relaxed max-w-2xl">
          我是 Beta，十多年软件开发经验。关注前端工程、开发者工具和 Web 3D 可视化——<br className="hidden sm:block" />
          这里持续记录正在做的项目、技术思考和观察。
        </p>

        <div className="mt-8 flex items-center gap-4">
          <a
            href="mailto:me@pbeta.me"
            className="group relative inline-flex items-center justify-center px-4 py-2 bg-[var(--foreground)] text-[var(--background)] font-medium text-sm rounded-lg overflow-hidden transition-all hover:scale-105"
          >
            <span className="relative z-10">邮件联系</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </a>
          <a
            href="https://github.com/atbeta"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-4 py-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <span className="text-sm font-medium">GitHub</span>
            <svg 
              className="w-3 h-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" 
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </section>

      {/* ── Areas ────────────────────────────────────── */}
      <section className="anim-fade-up delay-1">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {areas.map((area) => (
            <Link
              key={area.href}
              href={area.href}
              className="group glass p-5 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--accent)]/5 hover:border-[var(--accent)]/20"
            >
              <div className="mb-3 text-[var(--muted-foreground)] group-hover:text-[var(--accent)] transition-colors">
                {area.icon}
              </div>
              <div className="font-medium text-sm text-[var(--foreground)] mb-1">
                {area.label}
              </div>
              <div className="text-[13px] text-[var(--muted-foreground)] opacity-80 leading-relaxed">
                {area.desc}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Recent Notes ─────────────────────────────── */}
      {recentNotes.length > 0 && (
        <section className="anim-fade-up delay-2">
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
              <span className="w-1 h-4 bg-[var(--accent)] rounded-full" />
              最近随笔
            </h2>
            <Link
              href="/notes"
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              全部
            </Link>
          </div>
          <div className="space-y-1">
            {recentNotes.map((note) => (
              <Link
                key={note._meta.path}
                href={`/notes/${note._meta.path}`}
                className="group flex items-baseline justify-between gap-8 py-3 px-4 rounded-lg hover:bg-[var(--muted)]/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-medium text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] group-hover:translate-x-1 transition-all duration-200 truncate tracking-wide">
                    {note.title}
                  </h3>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs grayscale group-hover:grayscale-0 transition-all opacity-70">
                    {statusIcon[note.status]}
                  </span>
                  <span className="font-mono text-xs text-[var(--muted-foreground)]/60 tabular-nums">
                    {formatDate(note.date)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Active Projects ───────────────────────────── */}
      {recentProjects.length > 0 && (
        <section className="anim-fade-up delay-3">
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
              <span className="w-1 h-4 bg-[var(--accent)] rounded-full" />
              精选项目
            </h2>
            <Link
              href="/projects"
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              全部
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {recentProjects.map((project) => (
              <Link
                key={project._meta.path}
                href={`/projects/${project._meta.path}`}
                className="group relative p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/30 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative flex justify-between items-start mb-3">
                  <h3 className="font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                    {project.title}
                  </h3>
                  {project.url && (
                    <span className="text-[var(--muted-foreground)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                      ↗
                    </span>
                  )}
                </div>
                <p className="relative text-[13px] text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
