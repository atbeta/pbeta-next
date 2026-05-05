'use client'

import { useRef, useEffect } from 'react'

type DefectCard = {
  label: string
  enLabel: string
  color: string
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
}

const CANVAS_SZ = 120

function drawParticle(ctx: CanvasRenderingContext2D, w: number, h: number) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = 128 + (Math.random() - 0.5) * 20
      ctx.fillStyle = `rgb(${v},${v},${v})`
      ctx.fillRect(x, y, 1, 1)
    }
  }
  for (let i = 0; i < 5; i++) {
    const px = 15 + Math.random() * (w - 30)
    const py = 15 + Math.random() * (h - 30)
    const r = 2 + Math.random() * 3
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(px, py, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawScratch(ctx: CanvasRenderingContext2D, w: number, h: number) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = 140 + (Math.random() - 0.5) * 16
      ctx.fillStyle = `rgb(${v},${v},${v})`
      ctx.fillRect(x, y, 1, 1)
    }
  }
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(15, h / 2)
  ctx.lineTo(w - 15, h / 2 + 8)
  for (let i = 0; i < 15; i++) {
    const x = 15 + (w - 30) * i / 14
    const y = h / 2 + Math.sin(i * 1.3) * 6
    ctx.lineTo(x, y)
  }
  ctx.stroke()
}

function drawPatternDefect(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#ddd'; ctx.fillRect(0, 0, w, h)
  const lineW = 6; const gap = 8; const total = lineW + gap
  for (let y = 10; y < h - 10; y += total) {
    ctx.fillStyle = '#555'
    ctx.fillRect(10, y, w - 20, lineW)
  }
  ctx.fillStyle = '#fff'
  const bx = w / 2 - 18; const by = h / 2 - 10
  ctx.fillRect(bx, by, 36, 20)
  ctx.fillStyle = '#555'
  ctx.fillRect(bx + 4, by, 28, 20)
}

function drawVoid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = 160 + (Math.random() - 0.5) * 12
      ctx.fillStyle = `rgb(${v},${v},${v})`
      ctx.fillRect(x, y, 1, 1)
    }
  }
  const cx = w / 2 + 5; const cy = h / 2
  for (let r = 12; r > 0; r--) {
    const v = 30 + r * 8
    ctx.fillStyle = `rgb(${v},${v},${v})`
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawResidue(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#e8e8e8'; ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = 'rgba(180,160,140,0.7)'
  for (let i = 0; i < 8; i++) {
    const px = 20 + i * 12
    const py = h / 2 + (i % 3) * 8
    ctx.beginPath()
    ctx.arc(px, py, 3 + Math.random() * 2, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawPeeling(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#e0e0e0'; ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#bbb'
  ctx.fillRect(5, 5, w - 10, h - 10)
  ctx.fillStyle = '#e0e0e0'
  ctx.beginPath()
  ctx.moveTo(w - 30, 10)
  ctx.lineTo(w - 10, 10)
  ctx.lineTo(w - 10, 30)
  ctx.quadraticCurveTo(w - 5, 35, w - 25, 40)
  ctx.quadraticCurveTo(w - 40, 42, w - 30, 10)
  ctx.fill()
  ctx.strokeStyle = '#999'
  ctx.lineWidth = 1
  ctx.stroke()
}

const DEFECTS: DefectCard[] = [
  { label: '颗粒', enLabel: 'Particle', color: '#ff6b6b', draw: drawParticle },
  { label: '划痕', enLabel: 'Scratch', color: '#ffd93d', draw: drawScratch },
  { label: '图案缺陷', enLabel: 'Pattern', color: '#6bcb77', draw: drawPatternDefect },
  { label: '空洞', enLabel: 'Void', color: '#4dabf7', draw: drawVoid },
  { label: '残留', enLabel: 'Residue', color: '#da77f2', draw: drawResidue },
  { label: '剥落', enLabel: 'Peeling', color: '#ff922b', draw: drawPeeling },
]

function DefectCanvas({ item }: { item: DefectCard }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = CANVAS_SZ * dpr; canvas.height = CANVAS_SZ * dpr
    canvas.style.width = CANVAS_SZ + 'px'; canvas.style.height = CANVAS_SZ + 'px'
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    item.draw(ctx, CANVAS_SZ, CANVAS_SZ)
  }, [item])

  const accent = item.color
  return (
    <div className="flex flex-col items-center gap-1.5">
      <canvas ref={ref} width={CANVAS_SZ} height={CANVAS_SZ}
        className="w-[120px] h-[120px] rounded-lg border border-[var(--border)]" />
      <span className="font-mono text-[11px] font-semibold">{item.label}</span>
      <span className="font-mono text-[9px] text-[var(--muted-foreground)]">{item.enLabel}</span>
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
    </div>
  )
}

export function DefectGallery() {
  return (
    <div className="space-y-4">
      <div className="border border-[var(--border)] rounded-lg bg-[var(--surface)] p-4">
        <div className="px-2 py-1 mb-3 flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold">常见缺陷类型</span>
          <span className="font-mono text-[9px] text-[var(--muted-foreground)]">
            {DEFECTS.length} 种
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {DEFECTS.map((d) => (
            <DefectCanvas key={d.label} item={d} />
          ))}
        </div>
      </div>
      <div className="p-3 border border-dashed border-[var(--border)] rounded-lg">
        <p className="text-[10px] text-[var(--muted-foreground)] leading-relaxed">
          以上为示意性可视化。实际晶圆缺陷的 SEM 图像通常具有更高的分辨率和更复杂的形态特征。
          在量检测设备中，缺陷图像通过明场/暗场光学系统或电子束扫描获得，
          然后由**自动缺陷分类（ADC）** 算法进行识别。
        </p>
      </div>
    </div>
  )
}
