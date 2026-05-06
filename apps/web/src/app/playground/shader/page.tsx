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

      <div className="mb-8 p-4 border border-[var(--border)] rounded-lg bg-[var(--surface)] anim-fade-up delay-1">
        <h3 className="font-mono text-xs font-semibold mb-2">什么是 Fragment Shader？</h3>
        <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed mb-3">
          Fragment Shader（片元着色器）是 GPU 渲染管线中的一个阶段：<strong className="text-[var(--foreground)]">对屏幕上的每一个像素，独立运行一次同样的程序</strong>。
          输入是像素坐标和外部变量（uniform），输出是像素颜色（RGBA）。因为 GPU 有数千个核心并行运行，一个 512×512 的画布会同时跑 26 万个 shader 实例。
        </p>
        <h3 className="font-mono text-xs font-semibold mb-2">能用来做什么？</h3>
        <div className="grid gap-2 sm:grid-cols-3 text-[10px] text-[var(--muted-foreground)]">
          <div>
            <span className="font-mono text-[var(--accent)]">视觉艺术</span>
            <p className="mt-0.5 leading-relaxed">分形图案、光线步进 3D 场景、粒子效果、实时音乐可视化。Shadertoy 上的作品都属于这一类。</p>
          </div>
          <div>
            <span className="font-mono text-[var(--accent)]">图像/视频处理</span>
            <p className="mt-0.5 leading-relaxed">色彩校正、模糊/锐化滤镜、边缘检测、绿幕抠图——GPU 比 CPU 快 10-100x。</p>
          </div>
          <div>
            <span className="font-mono text-[var(--accent)]">科学计算 (GPGPU)</span>
            <p className="mt-0.5 leading-relaxed">物理仿真、流体力学、N-body 引力模拟。WebGPU Compute Shader 是下一代方向。</p>
          </div>
        </div>
      </div>
      <ShaderPlayground />
    </div>
  )
}
