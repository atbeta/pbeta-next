'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

type FilterType = 'none' | 'mean' | 'gaussian' | 'median'
type DefectType = 'point' | 'scratch' | 'pattern'

const CANVAS_SIZE = 400
const IMG_SIZE = 256

export function DefectDetectCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [defectCount, setDefectCount] = useState(12)
  const [noiseLevel, setNoiseLevel] = useState(18)
  const [filterType, setFilterType] = useState<FilterType>('gaussian')
  const [kernelSize, setKernelSize] = useState(3)
  const [edgeThreshold, setEdgeThreshold] = useState(50)
  const [scratchLength, setScratchLength] = useState(8)
  const [defectTypes, setDefectTypes] = useState<DefectType[]>(['point', 'scratch', 'pattern'])
  const [timing, setTiming] = useState({ filter: 0, edge: 0, mark: 0 })
  const [blobCount, setBlobCount] = useState(0)
  const [processing, setProcessing] = useState(false)

  const toggleDefectType = (type: DefectType) => {
    setDefectTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    )
  }

  const processImage = useCallback(() => {
    setProcessing(true)
    setProcessing(false)
  }, [defectCount, noiseLevel, filterType, kernelSize, edgeThreshold, scratchLength, defectTypes])

  useEffect(() => {
    processImage()
  }, [processImage])

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr] anim-fade-up delay-1">
      <div className="space-y-3">
        <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--surface)]">
          <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="w-full" />
        </div>
      </div>
      <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
        <h3 className="font-mono text-xs font-semibold mb-3">参数控制</h3>
        <p className="text-[10px] text-[var(--muted-foreground)]">
          缺陷检测算法实现中——将支持颗粒/划痕/图案缺陷的模拟生成与实时检测。
        </p>
      </div>
    </div>
  )
}
