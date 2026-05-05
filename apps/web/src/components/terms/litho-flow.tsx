'use client'

import { useState, useEffect, useRef } from 'react'

type Step = {
  label: string
  desc: string
  detail: string
}

const STEPS: Step[] = [
  {
    label: '1. HMDS 预处理',
    desc: '晶圆清洗后涂覆 HMDS',
    detail: '六甲基二硅氮烷 (HMDS) 涂覆在晶圆表面，增加光刻胶的附着力。HMDS 使晶圆表面从亲水性变为疏水性。',
  },
  {
    label: '2. 涂胶',
    desc: '旋涂光刻胶 (Spin Coating)',
    detail: '液态光刻胶滴在晶圆中心，高速旋转 (3000-5000 rpm) 使胶均匀铺展。胶厚度由转速和胶粘度决定，通常 0.5-2μm。',
  },
  {
    label: '3. 前烘',
    desc: '软烘 (Soft Bake)',
    detail: '90-120°C 加热 60-90 秒，蒸发光刻胶中的溶剂，使胶层固化。前烘也改善胶与晶圆的附着力。',
  },
  {
    label: '4. 对准曝光',
    desc: 'UV 曝光 (Exposure)',
    detail: '紫外光 (193nm DUV 或 13.5nm EUV) 通过掩模版照射晶圆。掩模版上的电路图案被投影到光刻胶上，曝光区域的胶发生光化学反应。',
  },
  {
    label: '5. 曝光后烘',
    desc: 'PEB (Post-Exposure Bake)',
    detail: '110-130°C 加热 60-90 秒。对化学放大胶 (CAR)，PEB 催化曝光区内的去保护反应，大幅提高感光度。',
  },
  {
    label: '6. 显影',
    desc: '显影 (Development)',
    detail: '用显影液 (如 TMAH 溶液) 溶解曝光区域的光刻胶 (正胶)。未被曝光的区域保留，形成与掩模版图案对应的光刻胶图形。',
  },
  {
    label: '7. 硬烘',
    desc: '硬烘 (Hard Bake)',
    detail: '120-150°C 加热，进一步固化光刻胶图形。硬烘增强胶的抗刻蚀性，为后续的刻蚀或离子注入步骤做准备。',
  },
]

export function LithoFlow() {
  const [step, setStep] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (autoPlay) {
      timerRef.current = setInterval(() => {
        setStep((s) => (s + 1) % STEPS.length)
      }, 2500)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [autoPlay])

  const s = STEPS[step]

  const waferH = 14
  const hmdsH = 4
  const prH = 22
  const waferY = 20
  const waferW = 300

  return (
    <div className="space-y-4">
      <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--surface)]">
        <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--muted)] flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold">光刻工艺流程</span>
          <span className="font-mono text-[9px] text-[var(--muted-foreground)]">
            {step + 1} / {STEPS.length}
          </span>
        </div>

        <div className="p-6 flex flex-col items-center">
          <svg viewBox="0 0 360 240" className="w-full max-w-[360px]">
            {/* Substrate */}
            <rect x={30} y={waferY} width={waferW} height={waferH} rx={2}
              fill="#2a2a3a" stroke="#444" strokeWidth={0.5} />

            {/* HMDS layer - always present from step 1+ */}
            {step >= 1 && (
              <rect x={30} y={waferY - hmdsH} width={waferW} height={hmdsH} rx={2}
                fill="#4a5568" opacity={0.7} />
            )}

            {/* PR layer - from step 2202+ */}
            {step >= 2 && (
              <g>
                <rect x={30} y={waferY - hmdsH - prH} width={waferW} height={prH} rx={2}
                  fill={step >= 6 ? '#667788' : '#8b5e3c'} opacity={0.85} />

                {/* Exposed areas (step 4-5) */}
                {step >= 4 && step < 6 && (
                  <g>
                    <rect x={70} y={waferY - hmdsH - prH} width={40} height={prH}
                      fill="#c4956a" opacity={0.9} />
                    <rect x={150} y={waferY - hmdsH - prH} width={40} height={prH}
                      fill="#c4956a" opacity={0.9} />
                    <rect x={230} y={waferY - hmdsH - prH} width={40} height={prH}
                      fill="#c4956a" opacity={0.9} />
                  </g>
                )}

                {/* Developed pattern (step 6-7) */}
                {step >= 6 && (
                  <g>
                    <rect x={70} y={waferY - hmdsH - prH} width={40} height={prH} rx={1}
                      fill="#8b5e3c" />
                    <rect x={150} y={waferY - hmdsH - prH} width={40} height={prH} rx={1}
                      fill="#8b5e3c" />
                    <rect x={230} y={waferY - hmdsH - prH} width={40} height={prH} rx={1}
                      fill="#8b5e3c" />

                    {/* Hard bake glow (step 7) */}
                    {step === 7 && (
                      <g>
                        <rect x={68} y={waferY - hmdsH - prH - 2} width={44} height={prH + 4} rx={1}
                          fill="none" stroke="#ff8c42" strokeWidth={1} opacity={0.4} />
                        <rect x={148} y={waferY - hmdsH - prH - 2} width={44} height={prH + 4} rx={1}
                          fill="none" stroke="#ff8c42" strokeWidth={1} opacity={0.4} />
                        <rect x={228} y={waferY - hmdsH - prH - 2} width={44} height={prH + 4} rx={1}
                          fill="none" stroke="#ff8c42" strokeWidth={1} opacity={0.4} />
                      </g>
                    )}
                  </g>
                )}

                {/* Mask + UV (step 4) */}
                {step === 4 && (
                  <g>
                    <rect x={30} y={waferY - hmdsH - prH - 24} width={waferW} height={8} rx={1}
                      fill="#555" opacity={0.5} />
                    <rect x={60} y={waferY - hmdsH - prH - 24} width={20} height={8}
                      fill="none" />
                    <rect x={130} y={waferY - hmdsH - prH - 24} width={20} height={8}
                      fill="none" />
                    <rect x={210} y={waferY - hmdsH - prH - 24} width={20} height={8}
                      fill="none" />
                    {[80, 160, 240].map((cx) => (
                      <g key={cx}>
                        <line x1={cx} y1={waferY - hmdsH - prH - 30} x2={cx} y2={waferY - hmdsH - prH}
                          stroke="#a78bfa" strokeWidth={1.5} opacity={0.7} />
                        <line x1={cx - 4} y1={waferY - hmdsH - prH - 24} x2={cx + 4} y2={waferY - hmdsH - prH - 24}
                          stroke="#a78bfa" strokeWidth={1} opacity={0.5} />
                      </g>
                    ))}
                  </g>
                )}

                {/* Heat waves (step 3, 5) */}
                {(step === 3 || step === 5) && (
                  <g>
                    {[50, 120, 190, 260, 320].map((cx) => (
                      <path key={cx}
                        d={`M ${cx - 10} ${waferY - hmdsH - prH - 6} Q ${cx} ${waferY - hmdsH - prH - 12} ${cx + 10} ${waferY - hmdsH - prH - 6}`}
                        stroke="#ff8c42" strokeWidth={1.2} fill="none" opacity={0.5} />
                    ))}
                  </g>
                )}
              </g>
            )}

            {/* Spin coating animation (step 2) */}
            {step === 2 && (
              <g>
                <circle cx={180} cy={waferY - hmdsH - prH - 8} r={5}
                  fill="#8b5e3c" opacity={0.8}>
                  <animate attributeName="r" values="5;8;5" dur="1s" repeatCount="indefinite" />
                </circle>
                <text x={180} y={waferY - hmdsH - prH - 16}
                  textAnchor="middle" fill="#8b5e3c" fontSize={9} fontFamily="monospace">
                  光刻胶
                </text>
              </g>
            )}

            {/* HMDS molecules (step 1) */}
            {step === 1 && (
              <g>
                {[60, 120, 180, 240, 300].map((cx) => (
                  <circle key={cx} cx={cx} cy={waferY - hmdsH - 3} r={2.5}
                    fill="#4a5568" opacity={0.6} />
                ))}
              </g>
            )}

            {/* Labels */}
            <text x={10} y={waferY + waferH / 2 + 4} fill="#a1a1aa" fontSize={8} fontFamily="monospace">
              Si Substrate
            </text>
            {step >= 2 && (
              <text x={10} y={waferY - hmdsH - prH / 2 + 2} fill="#a1a1aa" fontSize={8} fontFamily="monospace">
                {step >= 6 ? 'PR Pattern' : 'Photoresist'}
              </text>
            )}
          </svg>

          <div className="mt-4 text-center">
            <h3 className="font-mono text-[12px] font-semibold mb-1">{s.label}</h3>
            <p className="text-[10px] text-[var(--accent)] font-mono mb-2">{s.desc}</p>
            <p className="text-[10px] text-[var(--muted-foreground)] max-w-sm leading-relaxed">
              {s.detail}
            </p>
          </div>
        </div>

        <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--muted)] flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setStep((s) => (s - 1 + STEPS.length) % STEPS.length)}
              className="px-2 py-1 font-mono text-[10px] rounded border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)] hover:bg-[var(--surface)] transition-colors"
              disabled={autoPlay}
            >
              ← 上一步
            </button>
            <button
              onClick={() => setStep((s) => (s + 1) % STEPS.length)}
              className="px-2 py-1 font-mono text-[10px] rounded border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)] hover:bg-[var(--surface)] transition-colors"
              disabled={autoPlay}
            >
              下一步 →
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-[var(--accent)] scale-125' : 'bg-[var(--border)]'}`}
                  aria-label={'Step ' + (i + 1)}
                />
              ))}
            </div>
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={'px-2 py-1 font-mono text-[10px] rounded border transition-colors ' +
                (autoPlay
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)]')}
            >
              {autoPlay ? '⏸ 暂停' : '▶ 自动'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
