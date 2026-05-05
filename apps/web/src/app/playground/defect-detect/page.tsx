import type { Metadata } from 'next'
import { DefectDetectCanvas } from './defect-detect-canvas'

export const metadata: Metadata = { title: 'Wafer Defect Detection' }

export default function DefectDetectPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 anim-fade-up">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-1 h-4 bg-[var(--accent)] rounded-full" />
          <span className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase tracking-[0.2em]">
            Metrology
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-2">Wafer Defect Detection</h1>
        <p className="text-sm text-[var(--muted-foreground)] max-w-lg leading-relaxed">
          模拟晶圆表面缺陷检测流水线。左侧为处理流程可视化，右侧可调整检测参数。
          展示从原始图像到缺陷标记的完整信号处理链路。
        </p>
      </div>

      <DefectDetectCanvas />

      <div className="mt-12 grid gap-8 sm:grid-cols-3 anim-fade-up delay-1">
        <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
          <h3 className="font-mono text-xs font-semibold mb-2">处理流水线</h3>
          <div className="space-y-1.5">
            {[
              { step: '1. 原始图像', desc: '模拟含缺陷的晶圆表面灰度图' },
              { step: '2. 滤波去噪', desc: '高斯/中值/均值滤波降噪' },
              { step: '3. 边缘检测', desc: 'Sobel + 自适应阈值' },
              { step: '4. 缺陷标记', desc: '连通区域分析 + 统计' },
            ].map((s) => (
              <div key={s.step} className="flex gap-2">
                <span className="font-mono text-[10px] text-[var(--accent)] shrink-0">{s.step}</span>
                <span className="text-[11px] text-[var(--muted-foreground)]">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
          <h3 className="font-mono text-xs font-semibold mb-2">缺陷类型</h3>
          <div className="space-y-1.5">
            {[
              { type: '颗粒 (Particle)', size: '1-3 px', color: '#ff6b6b' },
              { type: '划痕 (Scratch)', size: '5-15 px', color: '#ffd93d' },
              { type: '图案缺陷', size: '3-8 px', color: '#6bcb77' },
            ].map((d) => (
              <div key={d.type} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="flex-1 font-mono text-[10px]">{d.type}</span>
                <span className="font-mono text-[9px] text-[var(--muted-foreground)]">{d.size}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border border-[var(--muted-foreground)]/20 rounded-lg bg-[var(--muted)]">
          <h3 className="font-mono text-xs font-semibold mb-2">WASM 性能对比</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-[var(--muted-foreground)]">纯 JS 处理</span>
              <span id="js-time" className="text-[var(--foreground)]">—</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-[var(--muted-foreground)]">WASM 处理</span>
              <span id="wasm-time" className="text-[var(--accent)]">—</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-[var(--muted-foreground)]">加速比</span>
              <span id="speedup" className="text-[var(--accent)] font-semibold">—</span>
            </div>
            <div className="mt-2 pt-2 border-t border-[var(--border)]">
              <p className="text-[9px] text-[var(--muted-foreground)]/60">
                * WASM 模块尚未集成，数值为预留位
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 border border-dashed border-[var(--border)] rounded-lg anim-fade-up delay-2">
        <h3 className="font-mono text-xs font-semibold mb-2">技术说明</h3>
        <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
          当前为纯 JavaScript/Canvas 实现。计划使用 Rust + wasm-pack 将滤波和边缘检测算法编译为 WASM，
          预期在 512x512 图像上获得 5-20x 的性能提升。WASM 模块将通过 packages/wasm 构建，
          Next.js 直接 import 使用。
        </p>
      </div>
    </div>
  )
}
