'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

type FilterType = 'none' | 'mean' | 'gaussian' | 'median'
type DefectType = 'point' | 'scratch' | 'pattern'

const SZ = 256
const CS = 400

function generateWaferImage(
  defectCount: number, noiseLevel: number,
  defectTypes: DefectType[], scratchLength: number,
): ImageData {
  const c = document.createElement('canvas'); c.width = SZ; c.height = SZ
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(SZ, SZ)
  const d = img.data
  const cx = SZ / 2; const cy = SZ / 2
  const radius = SZ * 0.42

  for (let y = 0; y < SZ; y++) {
    for (let x = 0; x < SZ; x++) {
      const i = (y * SZ + x) * 4
      const dx = x - cx; const dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      let v: number
      if (dist <= radius) {
        const ef = Math.min(1, (radius - dist) / 4)
        v = 140 + ef * 20 + Math.sin(x * 0.3) * Math.cos(y * 0.3) * 5
      } else { v = 201 }
      v += (Math.random() - 0.5) * noiseLevel
      d[i] = d[i + 1] = d[i + 2] = Math.max(0, Math.min(255, v))
      d[i + 3] = 255
    }
  }

  let seed = 42
  const rng = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }

  for (let i = 0; i < defectCount; i++) {
    const dt = defectTypes[i % defectTypes.length]
    if (dt === 'point') {
      const angle = rng() * Math.PI * 2; const dist = rng() * radius * 0.9
      const px = Math.floor(cx + Math.cos(angle) * dist)
      const py = Math.floor(cy + Math.sin(angle) * dist)
      const size = 1 + Math.floor(rng() * 3)
      for (let dy = -size; dy <= size; dy++)
        for (let dx = -size; dx <= size; dx++) {
          const nx = px + dx; const ny = py + dy
          if (nx >= 0 && nx < SZ && ny >= 0 && ny < SZ) {
            if (Math.abs(dx) <= size && Math.abs(dy) <= size) {
              const falloff = 1 - (Math.abs(dx) + Math.abs(dy)) / (size * 2 + 1)
              const ii = (ny * SZ + nx) * 4
              d[ii] = Math.max(0, d[ii] - 120 * falloff)
              d[ii + 1] = Math.max(0, d[ii + 1] - 120 * falloff)
              d[ii + 2] = Math.max(0, d[ii + 2] - 120 * falloff)
            }
          }
        }
    } else if (dt === 'scratch') {
      const angle = rng() * Math.PI * 2; const dist = rng() * radius * 0.85
      const sx = Math.floor(cx + Math.cos(angle) * dist)
      const sy = Math.floor(cy + Math.sin(angle) * dist)
      const len = 4 + Math.floor(rng() * scratchLength)
      const sa = rng() * Math.PI * 2
      for (let j = 0; j < len; j++) {
        const px = Math.floor(sx + Math.cos(sa) * j)
        const py = Math.floor(sy + Math.sin(sa) * j)
        if (px >= 0 && px < SZ && py >= 0 && py < SZ) {
          for (let dx = -1; dx <= 1; dx++)
            for (let dy = -1; dy <= 1; dy++) {
              const nx = px + dx; const ny = py + dy
              if (nx >= 0 && nx < SZ && ny >= 0 && ny < SZ) {
                const ii = (ny * SZ + nx) * 4
                d[ii] = Math.max(0, d[ii] - 50)
                d[ii + 1] = Math.max(0, d[ii + 1] - 50)
                d[ii + 2] = Math.max(0, d[ii + 2] - 50)
              }
            }
        }
      }
    } else if (dt === 'pattern') {
      const angle = rng() * Math.PI * 2; const dist = rng() * radius * 0.9
      const pcx = Math.floor(cx + Math.cos(angle) * dist)
      const pcy = Math.floor(cy + Math.sin(angle) * dist)
      const outerR = 2 + Math.floor(rng() * 3)
      const innerR = Math.max(1, outerR - 1)
      for (let dy = -outerR; dy <= outerR; dy++)
        for (let dx = -outerR; dx <= outerR; dx++) {
          const d2 = Math.sqrt(dx * dx + dy * dy)
          if (d2 <= outerR && d2 >= innerR) {
            const nx = pcx + dx; const ny = pcy + dy
            if (nx >= 0 && nx < SZ && ny >= 0 && ny < SZ) {
              const ii = (ny * SZ + nx) * 4
              d[ii] = Math.max(0, d[ii] - 90)
              d[ii + 1] = Math.max(0, d[ii + 1] - 90)
              d[ii + 2] = Math.max(0, d[ii + 2] - 90)
            }
          }
        }
    }
  }
  return img
}

function applyFilter(src: ImageData, ftype: FilterType, ksize: number): ImageData {
  const half = Math.floor(ksize / 2)
  const canvas = document.createElement('canvas'); canvas.width = SZ; canvas.height = SZ
  const ctx = canvas.getContext('2d')!
  const dst = ctx.createImageData(SZ, SZ)
  const s = src.data; const d = dst.data
  if (ftype === 'none') return src

  if (ftype === 'mean') {
    for (let y = 0; y < SZ; y++)
      for (let x = 0; x < SZ; x++) {
        let sum = 0; let cnt = 0
        for (let ky = -half; ky <= half; ky++)
          for (let kx = -half; kx <= half; kx++) {
            const nx = x + kx; const ny = y + ky
            if (nx >= 0 && nx < SZ && ny >= 0 && ny < SZ) { sum += s[(ny * SZ + nx) * 4]; cnt++ }
          }
        const val = sum / cnt
        const i = (y * SZ + x) * 4
        d[i] = d[i + 1] = d[i + 2] = val; d[i + 3] = 255
      }
  } else if (ftype === 'gaussian') {
    const sigma = ksize / 4
    const kernel: number[] = []; let ksum = 0
    for (let ky = -half; ky <= half; ky++)
      for (let kx = -half; kx <= half; kx++) {
        const w = Math.exp(-(kx * kx + ky * ky) / (2 * sigma * sigma))
        kernel.push(w); ksum += w
      }
    for (let y = 0; y < SZ; y++)
      for (let x = 0; x < SZ; x++) {
        let sum = 0; let ki = 0
        for (let ky = -half; ky <= half; ky++)
          for (let kx = -half; kx <= half; kx++) {
            const nx = x + kx; const ny = y + ky
            if (nx >= 0 && nx < SZ && ny >= 0 && ny < SZ) sum += s[(ny * SZ + nx) * 4] * kernel[ki]
            ki++
          }
        const val = sum / ksum
        const i = (y * SZ + x) * 4
        d[i] = d[i + 1] = d[i + 2] = val; d[i + 3] = 255
      }
  } else if (ftype === 'median') {
    for (let y = 0; y < SZ; y++)
      for (let x = 0; x < SZ; x++) {
        const vals: number[] = []
        for (let ky = -half; ky <= half; ky++)
          for (let kx = -half; kx <= half; kx++) {
            const nx = x + kx; const ny = y + ky
            if (nx >= 0 && nx < SZ && ny >= 0 && ny < SZ) vals.push(s[(ny * SZ + nx) * 4])
          }
        vals.sort((a, b) => a - b)
        const val = vals[Math.floor(vals.length / 2)]
        const i = (y * SZ + x) * 4
        d[i] = d[i + 1] = d[i + 2] = val; d[i + 3] = 255
      }
  }
  return dst
}

function applyEdgeDetection(src: ImageData, threshold: number): ImageData {
  const canvas = document.createElement('canvas'); canvas.width = SZ; canvas.height = SZ
  const ctx = canvas.getContext('2d')!
  const dst = ctx.createImageData(SZ, SZ)
  const s = src.data; const d = dst.data

  for (let y = 1; y < SZ - 1; y++)
    for (let x = 1; x < SZ - 1; x++) {
      const p = (y * SZ + x) * 4
      const tl = s[((y - 1) * SZ + (x - 1)) * 4]
      const tc = s[((y - 1) * SZ + x) * 4]
      const tr = s[((y - 1) * SZ + (x + 1)) * 4]
      const ml = s[(y * SZ + (x - 1)) * 4]
      const mr = s[(y * SZ + (x + 1)) * 4]
      const bl = s[((y + 1) * SZ + (x - 1)) * 4]
      const bc = s[((y + 1) * SZ + x) * 4]
      const br = s[((y + 1) * SZ + (x + 1)) * 4]
      const gx = -tl - 2 * ml - bl + tr + 2 * mr + br
      const gy = -tl - 2 * tc - tr + bl + 2 * bc + br
      const mag = Math.sqrt(gx * gx + gy * gy)
      const pv = mag > threshold ? 255 : 0
      d[p] = d[p + 1] = d[p + 2] = pv; d[p + 3] = 255
    }
  return dst
}

function markDefects(edgeData: ImageData, origData: ImageData): { image: ImageData; count: number } {
  const canvas = document.createElement('canvas'); canvas.width = SZ; canvas.height = SZ
  const ctx = canvas.getContext('2d')!
  ctx.putImageData(origData, 0, 0)
  const overlay = ctx.getImageData(0, 0, SZ, SZ)
  const ep = edgeData.data; const od = overlay.data
  const vis = new Uint8Array(SZ * SZ)
  let blobCount = 0

  for (let y = 0; y < SZ; y++)
    for (let x = 0; x < SZ; x++) {
      const ei = (y * SZ + x) * 4
      if (ep[ei] === 255 && !vis[y * SZ + x]) {
        const stack: [number, number][] = [[x, y]]
        vis[y * SZ + x] = 1
        let blobSize = 0
        while (stack.length > 0) {
          const [cx, cy] = stack.pop()!
          blobSize++
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              const nx = cx + dx; const ny = cy + dy
              if (nx >= 0 && nx < SZ && ny >= 0 && ny < SZ) {
                const ni = (ny * SZ + nx) * 4
                if (ep[ni] === 255 && !vis[ny * SZ + nx]) { vis[ny * SZ + nx] = 1; stack.push([nx, ny]) }
              }
            }
        }
        if (blobSize >= 3) {
          blobCount++
          const colors = [[255, 70, 70], [255, 210, 50], [70, 200, 100]]
          const color = colors[blobCount % colors.length]
          const stack2: [number, number][] = [[x, y]]
          const v2 = new Uint8Array(SZ * SZ)
          v2[y * SZ + x] = 1
          while (stack2.length > 0) {
            const [cx, cy] = stack2.pop()!
            for (let dy = -1; dy <= 1; dy++)
              for (let dx = -1; dx <= 1; dx++) {
                const nx = cx + dx; const ny = cy + dy
                if (nx >= 0 && nx < SZ && ny >= 0 && ny < SZ) {
                  const ni = (ny * SZ + nx) * 4
                  if (ep[ni] === 255 && !v2[ny * SZ + nx]) {
                    v2[ny * SZ + nx] = 1; stack2.push([nx, ny])
                    od[ni] = color[0]; od[ni + 1] = color[1]; od[ni + 2] = color[2]
                  }
                }
              }
          }
        }
      }
    }
  return { image: overlay, count: blobCount }
}

function renderImg(img: ImageData, ctx: CanvasRenderingContext2D) {
  const tc = document.createElement('canvas'); tc.width = SZ; tc.height = SZ
  tc.getContext('2d')!.putImageData(img, 0, 0)
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, CS, CS)
  ctx.drawImage(tc, 0, 0, CS, CS)
}

export function DefectDetectCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [defectCount, setDef] = useState(12)
  const [noiseLevel, setNoise] = useState(18)
  const [filterType, setFilt] = useState<FilterType>('gaussian')
  const [kernelSize, setKern] = useState(3)
  const [edgeThresh, setEdge] = useState(50)
  const [scratchLen, setScr] = useState(8)
  const [defectTypes, setDTypes] = useState<DefectType[]>(['point', 'scratch', 'pattern'])
  const [timing, setTiming] = useState({ f: 0, e: 0, m: 0 })
  const [blobCount, setBlobs] = useState(0)
  const [processing, setProc] = useState(false)
  const [viewMode, setView] = useState<'final' | 'original' | 'edges'>('final')
  const lastImg = useRef<ImageData | null>(null)
  const lastEdges = useRef<ImageData | null>(null)
  const lastMarked = useRef<{ image: ImageData; count: number } | null>(null)

  const toggleDefectType = (type: DefectType) => {
    setDTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }

  const renderView = useCallback((ctx: CanvasRenderingContext2D) => {
    const img = lastImg.current; const edges = lastEdges.current; const marked = lastMarked.current
    if (!img || !edges || !marked) return
    if (viewMode === 'original') { renderImg(img, ctx); return }
    if (viewMode === 'edges') { renderImg(edges, ctx); return }
    renderImg(img, ctx)
    ctx.globalAlpha = 0.35
    const tc = document.createElement('canvas'); tc.width = SZ; tc.height = SZ
    tc.getContext('2d')!.putImageData(edges, 0, 0)
    ctx.drawImage(tc, 0, 0, CS, CS)
    ctx.globalAlpha = 1
    const mt = document.createElement('canvas'); mt.width = SZ; mt.height = SZ
    mt.getContext('2d')!.putImageData(marked.image, 0, 0)
    ctx.globalAlpha = 0.55
    ctx.drawImage(mt, 0, 0, CS, CS)
    ctx.globalAlpha = 1
  }, [viewMode])

  const processImage = useCallback(() => {
    setProc(true)
    const t0 = performance.now()
    const raw = generateWaferImage(defectCount, noiseLevel, defectTypes, scratchLen)
    const t1 = performance.now()
    const filt = applyFilter(raw, filterType, kernelSize)
    const t2 = performance.now()
    const edges = applyEdgeDetection(filt, edgeThresh)
    const t3 = performance.now()
    const marked = markDefects(edges, filt)
    const t4 = performance.now()
    lastImg.current = filt; lastEdges.current = edges; lastMarked.current = marked
    setTiming({ f: t2 - t1, e: t3 - t2, m: t4 - t3 })
    setBlobs(marked.count)
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) renderView(ctx)
    setProc(false)
  }, [defectCount, noiseLevel, filterType, kernelSize, edgeThresh, scratchLen, defectTypes, renderView])

  useEffect(() => { processImage() }, [processImage])
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx && lastImg.current) renderView(ctx)
  }, [viewMode, renderView])

  const sliderCls = 'w-full h-1 bg-[var(--muted)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)]'

  const btn = (active: boolean) =>
    ['px-2 py-1 font-mono text-[10px] rounded border transition-colors',
      active
        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
        : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)]'
    ].join(' ')

  const viewLabel: Record<string, string> = { final: '检出结果', original: '滤波后', edges: '边缘图' }
  const filterLabel: Record<string, string> = { none: '无', mean: '均值', gaussian: '高斯', median: '中值' }
  const defectLabel: Record<string, string> = { point: '颗粒', scratch: '划痕', pattern: '图案' }

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr] anim-fade-up delay-1">
      <div className="space-y-3">
        <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--surface)]">
          <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[var(--border)] bg-[var(--muted)]">
            {(['final', 'original', 'edges'] as const).map(function (m) {
              const active = viewMode === m
              return (
                <button key={m} aria-label={viewLabel[m]} tabIndex={0} onClick={function () { setView(m) }}
                  className={'px-2 py-0.5 font-mono text-[10px] rounded transition-colors ' +
                    (active ? 'bg-[var(--accent-muted)] text-[var(--accent-foreground)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]')}>
                  {viewLabel[m]}
                </button>
              )
            })}
            <span className="flex-1" />
            <span className="font-mono text-[9px] text-[var(--muted-foreground)]">{SZ}x{SZ}</span>
          </div>
          <div className="p-3 flex justify-center bg-[var(--surface)]">
            <canvas ref={canvasRef} width={CS} height={CS} className="w-full rounded" style={{ imageRendering: 'pixelated' }} />
          </div>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono text-[var(--muted-foreground)]">
          <span>检出: <span className="text-[var(--accent)]">{blobCount}</span></span>
          <span className="text-[var(--border)] hidden sm:inline">|</span>
          <span>滤波 {timing.f.toFixed(1)}ms</span>
          <span className="text-[var(--border)] hidden sm:inline">|</span>
          <span>边缘 {timing.e.toFixed(1)}ms</span>
          <span className="text-[var(--border)] hidden sm:inline">|</span>
          <span>标记 {timing.m.toFixed(1)}ms</span>
        </div>
        {processing && (
          <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--accent)]">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            处理中...
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
          <h3 className="font-mono text-xs font-semibold mb-3">参数控制</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span className="text-[var(--muted-foreground)]">缺陷数量</span>
                <span>{defectCount}</span>
              </div>
              <input type="range" min={0} max={30} value={defectCount}
                onChange={function (e) { setDef(Number(e.target.value)) }} className={sliderCls} />
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span className="text-[var(--muted-foreground)]">噪声水平</span>
                <span>{noiseLevel}</span>
              </div>
              <input type="range" min={0} max={60} value={noiseLevel}
                onChange={function (e) { setNoise(Number(e.target.value)) }} className={sliderCls} />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[var(--muted-foreground)] mb-1.5">滤波方式</div>
              <div className="flex flex-wrap gap-1.5">
                {(['none', 'mean', 'gaussian', 'median'] as FilterType[]).map(function (type) {
                  const active = filterType === type
                  return (
                    <button key={type} aria-label={filterLabel[type]} tabIndex={0} onClick={function () { setFilt(type) }}
                      className={btn(active)}>
                      {filterLabel[type]}
                    </button>
                  )
                })}
              </div>
            </div>
            {filterType !== 'none' && (
              <div>
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-[var(--muted-foreground)]">核大小</span>
                  <span>{kernelSize}x{kernelSize}</span>
                </div>
                <input type="range" min={3} max={9} step={2} value={kernelSize}
                  onChange={function (e) { setKern(Number(e.target.value)) }} className={sliderCls} />
              </div>
            )}
            <div>
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span className="text-[var(--muted-foreground)]">边缘阈值</span>
                <span>{edgeThresh}</span>
              </div>
              <input type="range" min={10} max={200} value={edgeThresh}
                onChange={function (e) { setEdge(Number(e.target.value)) }} className={sliderCls} />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[var(--muted-foreground)] mb-1.5">缺陷类型</div>
              <div className="flex flex-wrap gap-1.5">
                {(['point', 'scratch', 'pattern'] as DefectType[]).map(function (type) {
                  const active = defectTypes.includes(type)
                  return (
                    <button key={type} aria-label={defectLabel[type]} tabIndex={0} onClick={function () { toggleDefectType(type) }}
                      className={btn(active)}>
                      {defectLabel[type]}
                    </button>
                  )
                })}
              </div>
            </div>
            {defectTypes.includes('scratch') && (
              <div>
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-[var(--muted-foreground)]">划痕长度</span>
                  <span>{scratchLen}px</span>
                </div>
                <input type="range" min={3} max={20} value={scratchLen}
                  onChange={function (e) { setScr(Number(e.target.value)) }} className={sliderCls} />
              </div>
            )}
            <button onClick={processImage}
              className="w-full mt-2 py-1.5 font-mono text-[10px] font-medium border border-[var(--border)] rounded bg-[var(--muted)] hover:bg-[var(--border)] transition-colors">
              重新生成
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
