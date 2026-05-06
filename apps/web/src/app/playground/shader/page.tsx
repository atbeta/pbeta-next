import type { Metadata } from 'next'
import { ShaderPlayground } from './shader-playground'

export const metadata: Metadata = { title: 'Shader Playground' }

export default function ShaderPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-6 anim-fade-up">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-1 h-4 bg-[var(--accent)] rounded-full" />
          <span className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase tracking-[0.2em]">WebGL</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-2">Shader Playground</h1>
        <p className="text-sm text-[var(--muted-foreground)] max-w-lg leading-relaxed">
          在线编写 GLSL Fragment Shader，实时预览。鼠标位置、时间、分辨率作为 uniform 传入，支持 Shadertoy 风格。
        </p>
      </div>
      <ShaderPlayground />
    </div>
  )
}
