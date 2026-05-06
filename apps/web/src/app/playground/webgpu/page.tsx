import type { Metadata } from 'next'
import { WebGPUPlayground } from './webgpu-playground'

export const metadata: Metadata = { title: 'WebGPU Compute' }

export default function WebGPUPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-6 anim-fade-up">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-1 h-4 bg-[var(--accent)] rounded-full" />
          <span className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase tracking-[0.2em]">WebGPU</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-2">WebGPU Compute Shader</h1>
        <p className="text-sm text-[var(--muted-foreground)] max-w-lg leading-relaxed">
          WebGPU 是 WebGL 的下一代图形 API，支持 Compute Shader 在 GPU 上做通用并行计算。这里是 WGSL 计算着色器的实时编辑环境。
        </p>
      </div>
      <WebGPUPlayground />
    </div>
  )
}
