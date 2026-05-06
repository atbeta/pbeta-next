'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

type Mode = 'gravity' | 'repulse' | 'vortex' | 'trail'

const MODE_LABELS: Record<Mode, string> = { gravity: '引力', repulse: '斥力', vortex: '涡旋', trail: '拖尾' }

class Particle {
  x = 0; y = 0; vx = 0; vy = 0
  ax = 0; ay = 0
  life = 1; decay = 0
  r = 0; g = 0; b = 0

  constructor(w: number, h: number) {
    this.reset(w, h)
  }
  reset(w: number, h: number) {
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * Math.min(w, h) * 0.3
    this.x = w / 2 + Math.cos(angle) * radius
    this.y = h / 2 + Math.sin(angle) * radius
    this.vx = (Math.random() - 0.5) * 0.5
    this.vy = (Math.random() - 0.5) * 0.5
    this.life = Math.random()
    this.decay = 0.002 + Math.random() * 0.003
    const hue = Math.random()
    this.r = 0.4 + 0.6 * Math.sin(hue * Math.PI * 2 + 0)
    this.g = 0.4 + 0.6 * Math.sin(hue * Math.PI * 2 + 2)
    this.b = 0.4 + 0.6 * Math.sin(hue * Math.PI * 2 + 4)
  }
}

export function ParticleEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mode, setMode] = useState<Mode>('gravity')
  const [count, setCount] = useState(5000)
  const [fps, setFps] = useState(0)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0, down: false })
  const animRef = useRef(0)
  const lastTimeRef = useRef(0)
  const frameCountRef = useRef(0)
  const modeRef = useRef<Mode>('gravity')

  useEffect(() => { modeRef.current = mode }, [mode])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let w = 0; let h = 0

    function resize() {
      const dpr = window.devicePixelRatio || 1
      w = canvas!.clientWidth * dpr
      h = canvas!.clientHeight * dpr
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w; canvas!.height = h
      }
    }

    function ensureParticles() {
      while (particlesRef.current.length < count) {
        particlesRef.current.push(new Particle(w, h))
      }
      while (particlesRef.current.length > count) {
        particlesRef.current.pop()
      }
    }

    function render(now: number) {
      animRef.current = requestAnimationFrame(render)
      resize()
      ensureParticles()

      const dt = Math.min(1, (now - lastTimeRef.current) / 16)
      lastTimeRef.current = now
      frameCountRef.current++

      const m = modeRef.current
      const mx = mouseRef.current.x * w
      const my = mouseRef.current.y * h
      const md = mouseRef.current.down

      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = 'rgba(5,5,10,0.15)'
      ctx.fillRect(0, 0, w, h)

      const ps = particlesRef.current
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i]
        p.life -= p.decay * dt
        if (p.life <= 0) { p.reset(w, h); p.life = 1 }

        const dx = mx - p.x
        const dy = my - p.y
        const dist = Math.sqrt(dx * dx + dy * dy) + 1
        const force = md ? 2 / (dist * 0.1 + 1) : 0.3 / (dist * 0.5 + 1)

        switch (m) {
          case 'gravity':
            p.ax = force * dx / dist
            p.ay = force * dy / dist
            break
          case 'repulse':
            p.ax = -force * dx / dist
            p.ay = -force * dy / dist
            break
          case 'vortex':
            p.ax = force * dx / dist - dy * 0.003
            p.ay = force * dy / dist + dx * 0.003
            break
          case 'trail':
            p.ax = (dx / dist) * 0.1
            p.ay = (dy / dist) * 0.1
            p.decay = 0.015
            break
        }

        p.vx += p.ax * dt
        p.vy += p.ay * dt
        p.vx *= 0.98
        p.vy *= 0.98

        p.x += p.vx * dt
        p.y += p.vy * dt

        if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
          p.reset(w, h); p.life = 1
        }

        const alpha = Math.sin(p.life * Math.PI)
        const r = Math.floor(p.r * 255 * alpha)
        const g = Math.floor(p.g * 255 * alpha)
        const b = Math.floor(p.b * 255 * alpha)

        if (m === 'trail') {
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.4})`
          ctx.fillRect(p.x - 0.5, p.y - 0.5, 1, 1)
        } else {
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.7})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      if (md && m !== 'trail') {
        ctx.beginPath()
        ctx.arc(mx, my, 8, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }

    lastTimeRef.current = performance.now()
    animRef.current = requestAnimationFrame(render)

    const fpsInterval = setInterval(() => {
      setFps(frameCountRef.current)
      frameCountRef.current = 0
    }, 1000)

    return () => {
      cancelAnimationFrame(animRef.current)
      clearInterval(fpsInterval)
    }
  }, [count])

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return
    mouseRef.current = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height, down: e.buttons > 0 }
  }, [])

  return (
    <div className="space-y-4 anim-fade-up delay-1">
      <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--surface)]">
        <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--muted)] flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold">
            {count.toLocaleString()} Particles &middot; {MODE_LABELS[mode]}
          </span>
          <span className="font-mono text-[9px] text-[var(--muted-foreground)]">{fps} fps</span>
        </div>
        <canvas ref={canvasRef} onMouseMove={handleMouse} onMouseDown={handleMouse} onMouseUp={handleMouse}
          className="w-full aspect-video" style={{ height: 420 }} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="p-3 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
          <div className="text-[10px] font-mono text-[var(--muted-foreground)] mb-2">交互模式</div>
          <div className="flex flex-wrap gap-1.5">
            {(['gravity', 'repulse', 'vortex', 'trail'] as Mode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={'px-2 py-1 font-mono text-[10px] rounded border transition-colors ' +
                  (mode === m ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)]')}>
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>
        </div>
        <div className="p-3 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
          <div className="flex justify-between text-[10px] font-mono mb-1">
            <span className="text-[var(--muted-foreground)]">粒子数量</span>
            <span>{count.toLocaleString()}</span>
          </div>
          <input type="range" min={500} max={15000} step={500} value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full h-1 bg-[var(--muted)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)]" />
        </div>
      </div>

      <div className="p-3 border border-dashed border-[var(--border)] rounded-lg text-[10px] text-[var(--muted-foreground)] leading-relaxed">
        纯 Canvas 2D 实现，无 WebGL。每帧遍历 {count.toLocaleString()}+ 粒子计算引力/斥力/涡旋力，使用半透明覆层实现拖尾效果。鼠标悬停控制粒子运动，点击增强引力。
      </div>
    </div>
  )
}
