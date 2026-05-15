import type { Metadata } from 'next'

export const metadata: Metadata = { title: '关于' }

const focuses = [
  {
    label: '前端工程',
    desc: 'TypeScript、React、Next.js，关注 monorepo 架构、构建工具链和全栈开发体验。',
  },
  {
    label: 'Web 3D 与工业可视化',
    desc: 'WebGPU、WebGL / Three.js、Canvas——把复杂的工业数据变成直观的交互式视觉呈现。',
  },
  {
    label: '开发者工具与 AI 协作',
    desc: 'MCP 协议、CLI 工具、AI 辅助开发工作流——探索下一代工程系统该有的形态。',
  },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 space-y-12">
      {/* Header */}
      <section className="anim-fade-up space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-1 h-4 bg-[var(--accent)] rounded-full" />
          <span className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase tracking-[0.2em]">
            关于
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">关于我和本站</h1>
      </section>

      {/* Intro */}
      <section className="anim-fade-up delay-1 space-y-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
        <p>
          我是 Beta，十多年软件开发经验。从后端服务到前端可视化，从工具链到架构设计，一直对「把东西做出来」保持好奇。
        </p>
        <p>
          目前在三个方向上投入主要精力：
        </p>
      </section>

      {/* Focus areas */}
      <section className="anim-fade-up delay-1 space-y-3">
        {focuses.map((f) => (
          <div
            key={f.label}
            className="p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
          >
            <h3 className="font-mono text-sm font-semibold text-[var(--foreground)] mb-1">
              {f.label}
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              {f.desc}
            </p>
          </div>
        ))}
      </section>

      {/* About this site */}
      <section className="anim-fade-up delay-2 space-y-3">
        <h2 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
          <span className="w-1 h-3 bg-[var(--accent)] rounded-full" />
          这个网站
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
          Tech Memos 是我的公开笔记和项目记录。它以「数字花园」的方式维护——内容会持续修订和生长，而非一次性发布后沉底。目前的更新频率约为每周一次。
        </p>
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
          记录的内容包括正在做的项目、技术思考和观察、对特定主题的系统分析，以及 Web 3D 可视化实验。
        </p>
      </section>

      {/* Contact */}
      <section className="anim-fade-up delay-2 space-y-3">
        <h2 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
          <span className="w-1 h-3 bg-[var(--accent)] rounded-full" />
          联系
        </h2>
        <div className="space-y-2 text-sm">
          <p className="text-[var(--muted-foreground)]">
            有技术问题、合作想法或想交流，欢迎邮件联系：
          </p>
          <div className="flex items-center gap-4">
            <a
              href="mailto:me@pbeta.me"
              className="inline-flex items-center justify-center px-4 py-2 bg-[var(--foreground)] text-[var(--background)] font-medium text-sm rounded-lg transition-all hover:scale-105"
            >
              me@pbeta.me
            </a>
            <a
              href="https://github.com/atbeta"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
