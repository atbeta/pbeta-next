'use client'

import { useState, useCallback, useRef } from 'react'

type BenchResult = {
  name: string
  desc: string
  jsMedian: number
  jsMin: number
  jsMax: number
  wasmPlaceholder: number | null
  unit: string
}

const ITERATIONS = 5
const N = 256
const SORT_N = 200000
const PRIME_N = 100000
const CONV_IMG = 256

function matmul256(): void {
  const a = new Float64Array(N * N)
  const b = new Float64Array(N * N)
  const c = new Float64Array(N * N)
  for (let i = 0; i < N * N; i++) { a[i] = Math.random(); b[i] = Math.random() }
  for (let i = 0; i < N; i++) {
    for (let k = 0; k < N; k++) {
      const aik = a[i * N + k]
      for (let j = 0; j < N; j++) {
        c[i * N + j] += aik * b[k * N + j]
      }
    }
  }
  if (c[0] < 0) console.log('unreachable')
}

function dotProduct1M(): void {
  const a = new Float64Array(1000000)
  const b = new Float64Array(1000000)
  for (let i = 0; i < 1000000; i++) { a[i] = Math.random(); b[i] = Math.random() }
  let sum = 0
  for (let i = 0; i < 1000000; i++) sum += a[i] * b[i]
  if (sum < 0) console.log('unreachable')
}

function mergeSort(arr: Float64Array): Float64Array {
  if (arr.length <= 1) return arr
  const mid = Math.floor(arr.length / 2)
  const left = mergeSort(arr.slice(0, mid))
  const right = mergeSort(arr.slice(mid))
  const result = new Float64Array(arr.length)
  let i = 0, j = 0, k = 0
  while (i < left.length && j < right.length) {
    result[k++] = left[i] < right[j] ? left[i++] : right[j++]
  }
  while (i < left.length) result[k++] = left[i++]
  while (j < right.length) result[k++] = right[j++]
  return result
}

function sortBench(): void {
  const arr = new Float64Array(SORT_N)
  for (let i = 0; i < SORT_N; i++) arr[i] = Math.random()
  const _result = mergeSort(arr)
  if (_result.length === 0) console.log('unreachable')
}

function primeSieve(): void {
  const limit = PRIME_N
  const sieve = new Uint8Array(limit + 1)
  sieve.fill(1)
  sieve[0] = sieve[1] = 0
  for (let i = 2; i * i <= limit; i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= limit; j += i) sieve[j] = 0
    }
  }
  let count = 0
  for (let i = 2; i <= limit; i++) if (sieve[i]) count++
  if (count < 0) console.log('unreachable')
}

function convolutionBench(): void {
  const K = 5; const half = 2
  const sigma = 1.4
  const kernel = new Float64Array(K * K)
  let ksum = 0
  for (let y = -half; y <= half; y++)
    for (let x = -half; x <= half; x++) {
      const w = Math.exp(-(x * x + y * y) / (2 * sigma * sigma))
      kernel[(y + half) * K + (x + half)] = w
      ksum += w
    }
  for (let i = 0; i < kernel.length; i++) kernel[i] /= ksum

  const src = new Float64Array(CONV_IMG * CONV_IMG)
  const dst = new Float64Array(CONV_IMG * CONV_IMG)
  for (let i = 0; i < src.length; i++) src[i] = Math.random() * 255

  for (let y = half; y < CONV_IMG - half; y++)
    for (let x = half; x < CONV_IMG - half; x++) {
      let sum = 0
      for (let ky = -half; ky <= half; ky++)
        for (let kx = -half; kx <= half; kx++) {
          sum += src[(y + ky) * CONV_IMG + (x + kx)] * kernel[(ky + half) * K + (kx + half)]
        }
      dst[y * CONV_IMG + x] = sum
    }
  if (dst[0] < 0) console.log('unreachable')
}

const BENCHMARKS: { name: string; desc: string; fn: () => void; unit: string; wasmEst: number | null }[] = [
  { name: '矩阵乘法', desc: `${N}x${N} double 矩阵乘法`, fn: matmul256, unit: 'ms', wasmEst: 15 },
  { name: '图像卷积', desc: `Gaussian 5x5 on ${CONV_IMG}x${CONV_IMG}`, fn: convolutionBench, unit: 'ms', wasmEst: 3 },
  { name: '归并排序', desc: `${(SORT_N / 1000).toFixed(0)}K 个 float 排序`, fn: sortBench, unit: 'ms', wasmEst: 40 },
  { name: '质数筛', desc: `Eratosthenes 筛法 up to ${(PRIME_N / 1000).toFixed(0)}K`, fn: primeSieve, unit: 'ms', wasmEst: 1 },
  { name: '向量点积', desc: '1M 个 double 点积', fn: dotProduct1M, unit: 'ms', wasmEst: 0.5 },
]

function runBench(fn: () => void, iterations: number): { median: number; min: number; max: number } {
  const times: number[] = []
  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now()
    fn()
    const t1 = performance.now()
    times.push(t1 - t0)
  }
  times.sort((a, b) => a - b)
  return {
    median: times[Math.floor(iterations / 2)],
    min: times[0],
    max: times[times.length - 1],
  }
}

export function BenchCanvas() {
  const [results, setResults] = useState<BenchResult[]>([])
  const [running, setRunning] = useState(false)
  const [currentBench, setCurrentBench] = useState('')
  const runningRef = useRef(false)

  const runAll = useCallback(async () => {
    if (runningRef.current) return
    runningRef.current = true
    setRunning(true)
    setResults([])

    const allResults: BenchResult[] = []

    for (const bench of BENCHMARKS) {
      setCurrentBench(bench.name)
      await new Promise(resolve => setTimeout(resolve, 50))

      const t = runBench(bench.fn, ITERATIONS)
      allResults.push({
        name: bench.name,
        desc: bench.desc,
        jsMedian: t.median,
        jsMin: t.min,
        jsMax: t.max,
        wasmPlaceholder: bench.wasmEst,
        unit: bench.unit,
      })
      setResults([...allResults])
    }

    setCurrentBench('')
    runningRef.current = false
    setRunning(false)
  }, [])

  const maxJS = Math.max(1, ...results.map(r => r.jsMedian))

  return (
    <div className="anim-fade-up delay-1 space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={runAll}
          disabled={running}
          className={'px-4 py-2 font-mono text-[11px] font-medium rounded border transition-colors ' +
            (running
              ? 'border-[var(--border)] text-[var(--muted-foreground)] cursor-not-allowed'
              : 'border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent-foreground)] hover:bg-[var(--accent)]/20')}
        >
          {running ? (currentBench ? 'Running ' + currentBench + '...' : 'Running all...') : 'Run Benchmarks (' + ITERATIONS + ' iterations)'}
        </button>
        <span className="font-mono text-[9px] text-[var(--muted-foreground)]">
          {results.length > 0 ? results.length + '/' + BENCHMARKS.length + ' complete' : 'Ready'}
        </span>
      </div>

      {results.length > 0 && (
        <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--surface)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                <th className="text-left px-4 py-2 font-mono text-[10px] text-[var(--muted-foreground)]">Benchmark</th>
                <th className="text-right px-4 py-2 font-mono text-[10px] text-[var(--muted-foreground)]">JS 中位数</th>
                <th className="text-right px-4 py-2 font-mono text-[10px] text-[var(--muted-foreground)]">JS 范围</th>
                <th className="text-right px-4 py-2 font-mono text-[10px] text-[var(--muted-foreground)]">WASM 预估</th>
                <th className="text-right px-4 py-2 font-mono text-[10px] text-[var(--muted-foreground)]">预估加速比</th>
              </tr>
            </thead>
            <tbody>
              {results.map(function (r) {
                const barWidth = Math.max(2, (r.jsMedian / maxJS) * 100)
                const speedup = r.wasmPlaceholder ? (r.jsMedian / r.wasmPlaceholder).toFixed(1) : '—'
                return (
                  <tr key={r.name} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/50">
                    <td className="px-4 py-2.5">
                      <div className="font-mono text-[11px] font-semibold">{r.name}</div>
                      <div className="font-mono text-[9px] text-[var(--muted-foreground)]">{r.desc}</div>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-3 rounded-full bg-[var(--accent-muted)] overflow-hidden min-w-[8px]" style={{ width: barWidth + 'px' }}>
                          <div className="h-full bg-[var(--accent)]/30 rounded-full" />
                        </div>
                        <span className="font-mono text-[11px] tabular-nums">{r.jsMedian.toFixed(1)}{r.unit}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[10px] text-[var(--muted-foreground)] tabular-nums">
                      {r.jsMin.toFixed(1)}{r.unit} – {r.jsMax.toFixed(1)}{r.unit}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="font-mono text-[10px] text-[var(--muted-foreground)]/60 tabular-nums">
                        {r.wasmPlaceholder ? '~' + r.wasmPlaceholder + r.unit : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="font-mono text-[11px] text-[var(--accent)] font-semibold tabular-nums">
                        {speedup}x
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {!running && results.length === 0 && (
        <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-16 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-[11px] text-[var(--muted-foreground)] mb-2">
            WASM 性能基准测试
          </span>
          <span className="text-[10px] text-[var(--muted-foreground)]/50">
            点击上方按钮开始测试，每项运行 {ITERATIONS} 轮取中位数。
          </span>
        </div>
      )}
    </div>
  )
}
