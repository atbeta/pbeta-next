import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'WASM Compute Benchmark' }

export default function WasmBenchPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 anim-fade-up">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-1 h-4 bg-[var(--accent)] rounded-full" />
          <span className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase tracking-[0.2em]">
            Infrastructure
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-2">WASM Compute Benchmark</h1>
        <p className="text-sm text-[var(--muted-foreground)] max-w-lg leading-relaxed">
          对比 JavaScript 与 WebAssembly 在计算密集型任务上的性能差异。
          为后续仿真模块的 WASM 迁移提供性能基线。
        </p>
      </div>

      <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-16 flex flex-col items-center justify-center text-center anim-fade-up delay-1">
        <span className="font-mono text-[11px] text-[var(--muted-foreground)] mb-2">
          WASM 性能基准测试
        </span>
        <span className="text-[10px] text-[var(--muted-foreground)]/50">
          即将上线 — 矩阵乘法 / 图像滤波 / FFT / 排序 等基准测试
        </span>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 anim-fade-up delay-1">
        {[
          { title: '矩阵乘法', desc: 'NxN 矩阵乘法的 JS vs WASM 对比', metric: 'GFLOPS' },
          { title: '图像滤波', desc: '均值/高斯/中值滤波在 512x512 图像上的性能', metric: 'ms' },
          { title: 'FFT', desc: '一维/二维快速傅里叶变换', metric: 'ms' },
          { title: '排序算法', desc: '快速排序/归并排序 1M 个浮点数', metric: 'ms' },
          { title: '哈希计算', desc: 'SHA-256 / MD5 大文件摘要', metric: 'MB/s' },
          { title: '物理仿真', desc: 'N 体引力模拟 / 波动方程求解', metric: 'steps/s' },
        ].map((b) => (
          <div key={b.title} className="p-4 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[11px] font-semibold">{b.title}</span>
              <span className="font-mono text-[9px] text-[var(--accent)]">{b.metric}</span>
            </div>
            <p className="text-[10px] text-[var(--muted-foreground)]">{b.desc}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="px-2 py-1 rounded bg-[var(--muted)] text-center">
                <span className="font-mono text-[9px] text-[var(--muted-foreground)]">JS</span>
                <span className="block font-mono text-[11px] text-[var(--foreground)]">—</span>
              </div>
              <div className="px-2 py-1 rounded bg-[var(--accent-muted)] text-center">
                <span className="font-mono text-[9px] text-[var(--muted-foreground)]">WASM</span>
                <span className="block font-mono text-[11px] text-[var(--accent)]">—</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 border border-dashed border-[var(--border)] rounded-lg anim-fade-up delay-2">
        <h3 className="font-mono text-xs font-semibold mb-2">技术栈</h3>
        <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
          Rust + wasm-pack 构建 WASM 模块，通过 packages/wasm 作为 workspace 管理。
          Next.js 可直接 import WASM 包。Benchmark 使用 performance.now() 计时，
          多次运行取中位数以确保数据稳定。
        </p>
      </div>
    </div>
  )
}
