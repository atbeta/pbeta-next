'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

const W = 700
const H = 280

export function CDVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cdTarget, setCdTarget] = useState(50)
  const [cdActual, setCdActual] = useState(50)
  const [focusOffset, setFocusOffset] = useState(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = W + 'px'
    canvas.style.height = H + 'px'
    ctx.scale(dpr, dpr)

    const bg = getComputedStyle(canvas).getPropertyValue('--surface').trim() || '#0a0a0a'
    const fg = getComputedStyle(canvas).getPropertyValue('--foreground').trim() || '#fafafa'
    const muted = getComputedStyle(canvas).getPropertyValue('--muted-foreground').trim() || '#a1a1aa'
    const accent = getComputedStyle(canvas).getPropertyValue('--accent').trim() || '#3b82f6'
    const border = getComputedStyle(canvas).getPropertyValue('--border').trim() || '#27272a'

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    const margin = { top: 30, bottom: 30, left: 60, right: 40 }
    const pw = W - margin.left - margin.right
    const ph = H - margin.top - margin.bottom
    const cx = margin.left + pw / 2

    ctx.strokeStyle = border
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(margin.left, margin.top)
    ctx.lineTo(margin.left, H - margin.bottom)
    ctx.lineTo(W - margin.right, H - margin.bottom)
    ctx.stroke()

    ctx.fillStyle = muted
    ctx.font = '10px monospace'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'

    const steps = 5
    for (let i = 0; i <= steps; i++) {
      const y = margin.top + (ph / steps) * i
      const val = 1 - i / steps
      ctx.fillText(val.toFixed(1), margin.left - 8, y)
    }

    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('归一化强度', cx, H - margin.bottom + 12)

    const cdHalf = cdActual / 2
    const leftEdge = 100 - cdHalf
    const rightEdge = 100 + cdHalf
    const scaleX = pw / 200

    for (let x = 0; x <= 200; x += 20) {
      const sx = margin.left + x * scaleX
      ctx.beginPath()
      ctx.moveTo(sx, H - margin.bottom)
      ctx.lineTo(sx, H - margin.bottom + 4)
      ctx.stroke()
      ctx.fillText(x + 'nm', sx, H - margin.bottom + 8)
    }

    ctx.beginPath()
    ctx.moveTo(margin.left, margin.top)
    const points: [number, number][] = []
    for (let x = 0; x <= 200; x++) {
      const dxFromCenter = x - 100
      const edgeSlope = 8 + focusOffset * 0.3

      let intensity: number
      if (dxFromCenter < leftEdge - edgeSlope) {
        intensity = 0.05
      } else if (dxFromCenter < leftEdge + edgeSlope) {
        const t = (dxFromCenter - (leftEdge - edgeSlope)) / (2 * edgeSlope)
        intensity = 0.05 + t * 0.9
      } else if (dxFromCenter < rightEdge - edgeSlope) {
        intensity = 0.95
      } else if (dxFromCenter < rightEdge + edgeSlope) {
        const t = (dxFromCenter - (rightEdge - edgeSlope)) / (2 * edgeSlope)
        intensity = 0.95 - t * 0.9
      } else {
        intensity = 0.05
      }

      intensity += (Math.sin(x * 0.8) * 0.01)

      const sx = margin.left + x * scaleX
      const sy = margin.top + ph * (1 - intensity)
      points.push([sx, sy])
    }

    ctx.strokeStyle = fg
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(points[0][0], points[0][1])
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1])
    }
    ctx.stroke()

    const threshold = 0.5
    const thresholdY = margin.top + ph * (1 - threshold)
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = muted
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(margin.left, thresholdY)
    ctx.lineTo(W - margin.right, thresholdY)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = muted
    ctx.textAlign = 'left'
    ctx.fillText('阈值 0.5', W - margin.right + 4, thresholdY)

    let leftCross = 0, rightCross = 0
    for (let x = 0; x <= 200; x++) {
      const dx = x - 100
      const edgeSlope = 8 + focusOffset * 0.3
      const t = (dx + edgeSlope - leftEdge) / (2 * edgeSlope)
      const intensity = Math.max(0.05, Math.min(0.95, 0.05 + t * 0.9))
      if (intensity >= threshold && leftCross === 0) leftCross = x
      if (intensity <= threshold && rightCross === 0 && leftCross > 0) rightCross = x
    }
    const measuredCD = rightCross > 0 ? rightCross - leftCross : cdActual

    const arrowY = margin.top + ph * 0.3
    const leftX = margin.left + leftCross * scaleX
    const rightX = margin.left + rightCross * scaleX

    ctx.strokeStyle = accent
    ctx.lineWidth = 1.5
    ctx.setLineDash([])

    const drawArrow = (x: number, label: string, dir: number) => {
      ctx.beginPath()
      ctx.moveTo(x, arrowY)
      ctx.lineTo(x, thresholdY + 10)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x, thresholdY + 10)
      ctx.lineTo(x - 4 * dir, thresholdY + 5)
      ctx.moveTo(x, thresholdY + 10)
      ctx.lineTo(x + 4 * dir, thresholdY + 5)
      ctx.stroke()

      ctx.fillStyle = accent
      ctx.textAlign = dir > 0 ? 'left' : 'right'
      ctx.font = '11px monospace'
      ctx.fillText(label, x + 6 * dir, arrowY - 8)
    }

    drawArrow(leftX, `${Math.round(leftCross)}nm`, 1)
    drawArrow(rightX, `${Math.round(rightCross)}nm`, -1)

    ctx.strokeStyle = accent
    ctx.lineWidth = 2
    const midY = arrowY - 20
    ctx.beginPath()
    ctx.moveTo(leftX, midY)
    ctx.lineTo(rightX, midY)
    ctx.stroke()

    const tickSize = 4
    ctx.beginPath()
    ctx.moveTo(leftX, midY - tickSize)
    ctx.lineTo(leftX, midY + tickSize)
    ctx.moveTo(rightX, midY - tickSize)
    ctx.lineTo(rightX, midY + tickSize)
    ctx.stroke()

    ctx.fillStyle = accent
    ctx.textAlign = 'center'
    ctx.font = 'bold 12px monospace'
    ctx.fillText(`CD = ${Math.round(measuredCD)}nm`, cx, midY - 6)

    if (Math.abs(measuredCD - cdTarget) > 5) {
      ctx.fillStyle = '#ff6b6b'
      ctx.textAlign = 'left'
      ctx.font = '10px monospace'
      ctx.fillText(`超出容差 (目标: ${cdTarget}nm)`, rightX + 10, midY)
    } else {
      ctx.fillStyle = '#6bcb77'
      ctx.textAlign = 'left'
      ctx.font = '10px monospace'
      ctx.fillText('✓ 在容差范围内', rightX + 10, midY)
    }

    const structY = margin.top + ph + 10
    ctx.fillStyle = ctx.createLinearGradient(margin.left, structY, margin.left + pw, structY)
    const gradEnd = W - margin.right
    const grad = ctx.createLinearGradient(margin.left, 0, gradEnd, 0)
    grad.addColorStop(0, 'rgba(59,130,246,0.15)')
    grad.addColorStop(leftCross / 200, 'rgba(59,130,246,0.3)')
    grad.addColorStop((leftCross + measuredCD / 2) / 200, 'rgba(59,130,246,0.5)')
    grad.addColorStop(rightCross / 200, 'rgba(59,130,246,0.3)')
    grad.addColorStop(1, 'rgba(59,130,246,0.15)')
    ctx.fillStyle = grad
    ctx.fillRect(margin.left, structY, pw, 20)

    ctx.strokeStyle = border
    ctx.lineWidth = 1
    ctx.strokeRect(margin.left, structY, pw, 20)

    ctx.fillStyle = muted
    ctx.font = '9px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('Wafer 截面 — 线条图案', cx, structY + 14)
  }, [cdTarget, cdActual, focusOffset])

  useEffect(() => {
    draw()
    const onResize = () => draw()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [draw])

  const regenerated = useCallback(() => {
    const variation = (Math.random() - 0.5) * 6 + focusOffset * 0.5
    setCdActual(Math.round(cdTarget + variation))
  }, [cdTarget, focusOffset])

  useEffect(() => {
    regenerated()
  }, [cdTarget, focusOffset, regenerated])

  const sliderCls = 'w-full h-1 bg-[var(--muted)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)]'

  return (
    <div className="space-y-4">
      <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--surface)]">
        <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--muted)] flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold">CD 测量示意</span>
          <span className="font-mono text-[9px] text-[var(--muted-foreground)]">
            强度曲线 + 阈值法边缘检测
          </span>
        </div>
        <div className="p-2 flex justify-center">
          <canvas ref={canvasRef} className="w-full max-w-[700px]" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="p-3 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
          <div className="flex justify-between text-[10px] font-mono mb-1">
            <span className="text-[var(--muted-foreground)]">目标 CD</span>
            <span>{cdTarget}nm</span>
          </div>
          <input type="range" min={20} max={100} value={cdTarget}
            onChange={(e) => setCdTarget(Number(e.target.value))} className={sliderCls} />
        </div>
        <div className="p-3 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
          <div className="flex justify-between text-[10px] font-mono mb-1">
            <span className="text-[var(--muted-foreground)]">焦距偏移</span>
            <span>{focusOffset > 0 ? '+' : ''}{focusOffset}nm</span>
          </div>
          <input type="range" min={-30} max={30} value={focusOffset}
            onChange={(e) => setFocusOffset(Number(e.target.value))} className={sliderCls} />
        </div>
        <div className="p-3 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
          <div className="flex justify-between text-[10px] font-mono mb-1">
            <span className="text-[var(--muted-foreground)]">实测 CD</span>
            <span className="text-[var(--accent)]">{cdActual}nm</span>
          </div>
          <button onClick={regenerated}
            className="w-full mt-1 py-1.5 font-mono text-[10px] border border-[var(--border)] rounded bg-[var(--muted)] hover:bg-[var(--border)] transition-colors">
            重新模拟
          </button>
        </div>
      </div>

      <div className="p-3 border border-dashed border-[var(--border)] rounded-lg">
        <p className="text-[10px] text-[var(--muted-foreground)] leading-relaxed">
          <span className="text-[var(--accent)] font-mono">蓝色曲线</span> = 光刻胶截面强度分布 &middot;
          <span className="text-[var(--muted-foreground)] font-mono">虚线</span> = 检测阈值 (0.5) &middot;
          <span className="text-[var(--accent)] font-mono">蓝色箭头</span> = CD 测量值<br />
          调整「目标 CD」改变图案尺寸，「焦距偏移」模拟离焦导致的边缘模糊。
        </p>
      </div>
    </div>
  )
}
