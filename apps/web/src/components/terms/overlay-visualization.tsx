'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

const W = 600
const H = 320

export function OverlayVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [offsetX, setOffsetX] = useState(3)
  const [offsetY, setOffsetY] = useState(-2)
  const [rotation, setRotation] = useState(1.5)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    canvas.width = W * dpr; canvas.height = H * dpr
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px'
    ctx.scale(dpr, dpr)

    const bg = getComputedStyle(canvas).getPropertyValue('--surface').trim() || '#0a0a0a'
    const fg = getComputedStyle(canvas).getPropertyValue('--foreground').trim() || '#fafafa'
    const muted = getComputedStyle(canvas).getPropertyValue('--muted-foreground').trim() || '#a1a1aa'
    const accent = getComputedStyle(canvas).getPropertyValue('--accent').trim() || '#3b82f6'
    const border = getComputedStyle(canvas).getPropertyValue('--border').trim() || '#27272a'

    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

    const cx = W / 2
    const cy = H / 2 - 10
    const outerSize = 140
    const innerSize = 70
    const gap = 90

    const offsetPX = offsetX * 3
    const offsetPY = offsetY * 3
    const rad = rotation * Math.PI / 180

    const drawCrosshair = (x: number, y: number, color: string, size: number) => {
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.setLineDash([4, 3])
      ctx.beginPath()
      ctx.moveTo(x, y - size); ctx.lineTo(x, y + size)
      ctx.moveTo(x - size, y); ctx.lineTo(x + size, y)
      ctx.stroke()
      ctx.setLineDash([])
    }

    const drawBox = (x: number, y: number, size: number, color: string, label: string, dash: boolean) => {
      const half = size / 2
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      if (dash) ctx.setLineDash([6, 4])
      ctx.strokeRect(x - half, y - half, size, size)
      ctx.setLineDash([])

      ctx.fillStyle = color
      ctx.font = '9px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(label, x, y + half + 16)
    }

    drawCrosshair(cx - gap, cy, muted, 25)
    drawCrosshair(cx + gap, cy, muted, 25)

    drawBox(cx - gap, cy, outerSize, '#ef4444', '参考层 (前层)', true)
    drawBox(cx - gap + offsetPX, cy + offsetPY, innerSize, accent, '当前层', false)

    ctx.save()
    ctx.translate(cx + gap, cy)
    ctx.rotate(rad)
    drawBox(0, 0, outerSize, '#ef4444', '参考层 (前层)', true)
    ctx.restore()
    drawBox(cx + gap, cy, innerSize, accent, '当前层', false)

    ctx.strokeStyle = border
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(W / 2, 20); ctx.lineTo(W / 2, H - 30)
    ctx.stroke()

    ctx.fillStyle = muted
    ctx.font = '11px monospace'
    ctx.textAlign = 'center'

    ctx.fillStyle = '#ef4444'
    ctx.fillText('平移误差', cx - gap, cy - outerSize / 2 - 30)

    ctx.fillStyle = '#ef4444'
    ctx.fillText('旋转误差', cx + gap, cy - outerSize / 2 - 30)

    const overlayMag = Math.sqrt(offsetX * offsetX + offsetY * offsetY)
    const statusBg = overlayMag < 2 ? 'rgba(107,203,119,0.15)' : overlayMag < 5 ? 'rgba(255,210,50,0.15)' : 'rgba(255,107,107,0.15)'
    const statusText = overlayMag < 2 ? '✓ 在规格内 (< 2nm)' : overlayMag < 5 ? '⚠ 接近边界 (2-5nm)' : '✗ 超出规格 (> 5nm)'
    const statusColor = overlayMag < 2 ? '#6bcb77' : overlayMag < 5 ? '#ffd23d' : '#ff6b6b'

    const infoX = 20
    const infoY = H - 55
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.fillRect(infoX - 4, infoY - 4, 200, 44)

    ctx.fillStyle = muted
    ctx.font = '9px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(`X: ${offsetX.toFixed(1)}nm  Y: ${offsetY.toFixed(1)}nm  R: ${rotation.toFixed(1)}°`, infoX, infoY + 10)
    ctx.fillText(`矢量误差: ${overlayMag.toFixed(1)}nm`, infoX, infoY + 22)

    ctx.fillStyle = statusColor
    ctx.fillText(statusText, infoX, infoY + 34)
  }, [offsetX, offsetY, rotation])

  useEffect(() => {
    draw()
    const onResize = () => draw()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [draw])

  const sliderCls = 'w-full h-1 bg-[var(--muted)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)]'

  return (
    <div className="space-y-4">
      <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--surface)]">
        <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--muted)] flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold">Box-in-Box Overlay 测量</span>
          <span className="font-mono text-[9px] text-[var(--muted-foreground)]">
            左: 平移 &middot; 右: 旋转
          </span>
        </div>
        <div className="p-2 flex justify-center">
          <canvas ref={canvasRef} className="w-full max-w-[600px]" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="p-3 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
          <div className="flex justify-between text-[10px] font-mono mb-1">
            <span className="text-[var(--muted-foreground)]">X 偏移</span>
            <span>{offsetX > 0 ? '+' : ''}{offsetX.toFixed(1)}nm</span>
          </div>
          <input type="range" min={-8} max={8} step={0.1} value={offsetX}
            onChange={(e) => setOffsetX(Number(e.target.value))} className={sliderCls} />
        </div>
        <div className="p-3 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
          <div className="flex justify-between text-[10px] font-mono mb-1">
            <span className="text-[var(--muted-foreground)]">Y 偏移</span>
            <span>{offsetY > 0 ? '+' : ''}{offsetY.toFixed(1)}nm</span>
          </div>
          <input type="range" min={-8} max={8} step={0.1} value={offsetY}
            onChange={(e) => setOffsetY(Number(e.target.value))} className={sliderCls} />
        </div>
        <div className="p-3 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
          <div className="flex justify-between text-[10px] font-mono mb-1">
            <span className="text-[var(--muted-foreground)]">旋转</span>
            <span>{rotation.toFixed(1)}°</span>
          </div>
          <input type="range" min={-5} max={5} step={0.1} value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))} className={sliderCls} />
        </div>
      </div>

      <div className="p-3 border border-dashed border-[var(--border)] rounded-lg">
        <p className="text-[10px] text-[var(--muted-foreground)] leading-relaxed">
          <span className="font-mono" style={{ color: '#ef4444' }}>红色虚线</span> = 参考层 &middot;
          <span className="font-mono text-[var(--accent)]">蓝色实线</span> = 当前层 &middot;
          调整滑块观察平移和旋转对套刻精度的影响。
        </p>
      </div>
    </div>
  )
}
