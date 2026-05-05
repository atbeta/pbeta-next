import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Playground' }

type PlaygroundEntry = {
  href: string
  title: string
  description: string
  tags: string[]
  category: string
  status: 'building' | 'planned'
}

const playgrounds: PlaygroundEntry[] = [
  {
    href: '/playground/defect-detect',
    title: 'Wafer Defect Detection',
    description: '模拟晶圆表面缺陷检测流水线：噪声生成 → 滤波去噪 → 边缘检测 → 缺陷标记。展示 JS/WASM 图像处理能力对比。',
    tags: ['Canvas', '图像处理', '滤波器', '边缘检测', 'WASM'],
    category: '量检测',
    status: 'building',
  },
  {
    href: '/playground/topography',
    title: 'Surface Topography 3D',
    description: '三维表面形貌可视化：高度图生成、3D 网格渲染、线轮廓截面、粗糙度参数计算。基于 Three.js。',
    tags: ['Three.js', '3D', 'WebGL', '表面分析'],
    category: '量检测',
    status: 'building',
  },
  {
    href: '/playground/diffraction',
    title: 'Diffraction Pattern Explorer',
    description: '夫琅禾费衍射图案实时生成：圆形/矩形孔径、光栅衍射、波长可调。光刻光学仿真的最小可行单元。',
    tags: ['Canvas', '光学', '傅里叶变换', '衍射'],
    category: '光学仿真',
    status: 'building',
  },
  {
    href: '/playground/wasm-bench',
    title: 'WASM Compute Benchmark',
    description: '对比 JS 与 WASM 在矩阵运算、图像处理、FFT 等计算密集型任务上的性能差异。为后续仿真打基础。',
    tags: ['WASM', '性能', 'Benchmark', 'Rust'],
    category: '基础设施',
    status: 'building',
  },
]

const categories = ['量检测', '光学仿真', '基础设施']

const statusMap: Record<string, { dot: string; label: string }> = {
  building: { dot: 'bg-yellow-500 animate-pulse', label: '构建中' },
  planned: { dot: 'bg-[var(--muted-foreground)]', label: '计划中' },
}

export default function PlaygroundPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-10 anim-fade-up">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-1 h-4 bg-[var(--accent)] rounded-full" />
          <span className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase tracking-[0.2em]">
            Playground
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-2">技术演练场</h1>
        <p className="text-sm text-[var(--muted-foreground)] max-w-lg leading-relaxed">
          探索 WebAssembly、WebGL/Three.js 在半导体量检测与光学仿真领域的前端技术边界。
          每个 Demo 都是一次工程实践，从算法实现到性能优化。
        </p>
      </div>

      {categories.map((category, ci) => {
        const items = playgrounds.filter((p) => p.category === category)
        if (items.length === 0) return null
        return (
          <section key={category} className={`mb-12 anim-fade-up delay-${Math.min(ci + 1, 3)}`}>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-medium text-[var(--muted-foreground)]">{category}</h2>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((pg) => {
                const status = statusMap[pg.status]
                return (
                  <Link
                    key={pg.href}
                    href={pg.href}
                    className="group flex flex-col gap-3 p-5 border border-[var(--border)] rounded-lg bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--muted)] transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-sm font-semibold group-hover:text-[var(--accent)] transition-colors">
                        {pg.title}
                      </span>
                      <span className="flex items-center gap-1.5 shrink-0">
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        <span className="font-mono text-[9px] text-[var(--muted-foreground)]">{status.label}</span>
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-3">
                      {pg.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {pg.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted-foreground)] border border-[var(--border)] rounded bg-[var(--muted)] group-hover:border-[var(--border-strong)] transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}

      <div className="mt-16 pt-8 border-t border-[var(--border)] anim-fade-up delay-2">
        <h3 className="text-sm font-medium mb-2">后续计划</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { title: 'CD/Overlay Measurement', desc: '关键尺寸与套刻测量模拟' },
            { title: 'Plasma Etching Viz', desc: '等离子体刻蚀工艺 3D 可视化' },
            { title: 'Lithography Full Sim', desc: '完整光刻光学仿真（Abbe + 薄掩模近似）' },
            { title: 'Wafer Map Explorer', desc: '晶圆级缺陷分布图交互浏览' },
          ].map((item) => (
            <div
              key={item.title}
              className="p-3 border border-dashed border-[var(--border)] rounded-lg"
            >
              <span className="font-mono text-xs font-medium text-[var(--muted-foreground)]">{item.title}</span>
              <p className="text-[10px] text-[var(--muted-foreground)]/60 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
