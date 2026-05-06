import type { Metadata } from 'next'
import { ParticleEngine } from './particle-engine'

export const metadata: Metadata = { title: 'Canvas Physics' }

export default function ParticlePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-6 anim-fade-up">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-1 h-4 bg-[var(--accent)] rounded-full" />
          <span className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Canvas 2D</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-2">Canvas Physics Engine</h1>
        <p className="text-sm text-[var(--muted-foreground)] max-w-lg leading-relaxed">
          纯 Canvas 2D 实现的万级粒子物理引擎。引力/斥力/涡旋模式，鼠标交互，展示 60fps 下的渲染优化策略。
        </p>
      </div>
      <ParticleEngine />
    </div>
  )
}
