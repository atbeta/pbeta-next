import type { Metadata } from 'next'
import { BenchCanvas } from './bench-canvas'

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
          每项测试运行多轮取中位数，为后续仿真模块的 WASM 迁移建立性能基线。
        </p>
      </div>

      <BenchCanvas />

      <div className="mt-8 p-4 border border-dashed border-[var(--border)] rounded-lg anim-fade-up delay-2">
        <h3 className="font-mono text-xs font-semibold mb-2">技术说明</h3>
        <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
          当前为纯 JavaScript 实现。WASM 模块计划通过 Rust + wasm-pack 构建于 packages/wasm。
          预期在矩阵乘法、图像卷积等任务上获得 5-50x 性能提升。
        </p>
      </div>
    </div>
  )
}
