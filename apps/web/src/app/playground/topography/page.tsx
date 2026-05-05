import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Surface Topography 3D' }

export default function TopographyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 anim-fade-up">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-1 h-4 bg-[var(--accent)] rounded-full" />
          <span className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase tracking-[0.2em]">
            Metrology
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-2">Surface Topography 3D</h1>
        <p className="text-sm text-[var(--muted-foreground)] max-w-lg leading-relaxed">
          三维表面形貌可视化。基于 Three.js 实现高度图渲染、3D 网格重建、线轮廓截面与粗糙度参数计算。
        </p>
      </div>

      <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-16 flex flex-col items-center justify-center text-center anim-fade-up delay-1">
        <span className="font-mono text-[11px] text-[var(--muted-foreground)] mb-2">
          Three.js 3D 表面形貌查看器
        </span>
        <span className="text-[10px] text-[var(--muted-foreground)]/50">
          即将上线 — 支持高度图/点云加载、截面测量、粗糙度分析
        </span>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3 anim-fade-up delay-1">
        {[
          { title: '高度图渲染', desc: '灰度热力图 / 伪彩色映射' },
          { title: '3D 表面重建', desc: 'Mesh 生成 + 旋转缩放' },
          { title: '截面测量', desc: '交互切割线 + 实时轮廓' },
          { title: '粗糙度分析', desc: 'Ra/Rq/Rz/Sa/Sq 统计' },
          { title: '点云支持', desc: 'ASCII/Binary 格式导入' },
          { title: 'WASM 加速', desc: '高度场计算引擎' },
        ].map((f) => (
          <div key={f.title} className="p-3 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
            <span className="font-mono text-[11px] font-semibold">{f.title}</span>
            <p className="text-[10px] text-[var(--muted-foreground)] mt-1">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 border border-dashed border-[var(--border)] rounded-lg anim-fade-up delay-2">
        <h3 className="font-mono text-xs font-semibold mb-2">技术栈</h3>
        <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
          Three.js + React Three Fiber 实现 3D 渲染管线。高度图数据通过 Canvas 生成或外部文件导入。
          粗糙度参数计算使用 WASM（Rust）加速，对比纯 JS 性能。
        </p>
      </div>
    </div>
  )
}
