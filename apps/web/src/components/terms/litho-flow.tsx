'use client'

import { useState, useEffect, useRef } from 'react'

type Step = {
  label: string
  en: string
  desc: string
  detail: string
}

const STEPS: Step[] = [
  {
    label: '晶圆清洗',
    en: 'Wafer Clean + HMDS',
    desc: '化学清洗 \u2192 脱水烘烤 \u2192 HMDS 底涂',
    detail: '去除有机/离子/金属污染物，200-400\u00b0C 脱水烘烤去除水分。涂覆 HMDS (六甲基二硅氮烷) 作为增附剂，使晶圆表面从亲水变为疏水，增强光刻胶附着力。',
  },
  {
    label: '旋涂光刻胶',
    en: 'Spin Coating',
    desc: '滴胶 \u2192 高速旋转 \u2192 均匀薄膜',
    detail: '液态光刻胶滴在晶圆中心，3000-5000 rpm 高速旋转使胶液均匀铺展。膜厚由转速和粘度控制，通常 0.5-2\u03bcm。均匀性直接影响最终图案精度。',
  },
  {
    label: '软烘',
    en: 'Soft Bake',
    desc: '热板加热 \u2192 溶剂蒸发 \u2192 胶膜固化',
    detail: '90-120\u00b0C 热板加热 60-90 秒，蒸发光刻胶中大部分溶剂。软烘增强了胶膜与晶圆的附着力，降低粘性，使胶层对后续曝光的光化学反应响应更均匀。',
  },
  {
    label: '对准',
    en: 'Mask Alignment',
    desc: '掩模版与晶圆精密对准',
    detail: '使用对准系统将掩模版（Photomask）与晶圆上的已有图案精确对齐。多层芯片需反复对准，纳米级误差即可导致器件失效。掩模版定义了哪些区域透光、哪些不透光。',
  },
  {
    label: '曝光',
    en: 'UV Exposure',
    desc: '紫外光透过掩模版照射光刻胶',
    detail: 'DUV (193nm) 或 EUV (13.5nm) 光通过掩模版投射到光刻胶上。曝光区域发生光化学反应\u2014\u2014正胶变可溶、负胶交联固化。现代使用投影式曝光，掩模与晶圆不接触。',
  },
  {
    label: '曝光后烘',
    en: 'PEB',
    desc: '加热催化 \u2192 消除驻波 \u2192 图案锐化',
    detail: 'Post-Exposure Bake: 110-130\u00b0C 加热 60-90 秒。对化学放大胶 (CAR)，PEB 催化曝光区域的去保护反应，大幅提高感光度。同时消除光干涉引起的驻波效应，锐化图案边缘。',
  },
  {
    label: '显影',
    en: 'Development',
    desc: '显影液溶解 \u2192 图案显现',
    detail: '用 TMAH (四甲基氢氧化铵) 显影液喷淋或浸渍晶圆。正胶中曝光区域被溶解去除，未曝光区保留。之后用超纯去离子水冲洗，高纯氮气吹干，避免水渍缺陷。',
  },
  {
    label: '硬烘',
    en: 'Hard Bake',
    desc: '高温固化 \u2192 增强抗刻蚀性',
    detail: '120-150\u00b0C 加热，进一步交联固化光刻胶图案。硬烘使胶层更耐热、更抗化学腐蚀、与晶圆结合更牢固。严格的温度控制至关重要，过高会导致胶变形。',
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
      }, 3000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [autoPlay])

  const s = STEPS[step]
  const viewH = 180
  const subY = viewH - 20
  const subH = 16
  const subW = 320
  const subX = 20
  const hmdsH = 5
  const prH = 28

  return (
    <div className="space-y-4">
      <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--surface)]">
        <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--muted)] flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold">{'光刻工艺流程 \u2014 ' + s.label}</span>
          <span className="font-mono text-[9px] text-[var(--muted-foreground)]">
            {'${step + 1} / ${STEPS.length} \u00b7 ${s.en}'}
          </span>
        </div>
        <div className="p-4 pb-2">
          <svg viewBox={'0 0 360 ${viewH}'} className="w-full max-w-[360px]">
            {step >= 1 && (
              <g>
                <rect x={subX} y={subY - hmdsH} width={subW} height={hmdsH} rx={1} fill="#4a5568" opacity={0.6} />
              </g>
            )}
            {step >= 2 && (
              <g>
                <rect x={subX} y={subY - hmdsH - prH} width={subW} height={prH} rx={2}
                  fill={step >= 7 ? '#6b7b8d' : '#c4884d'} opacity={0.85} />
                {step >= 5 && step < 7 && (
                  <g>
                    {[55, 120, 190, 260, 315].map((cx) => (
                      <rect key={cx} x={cx} y={subY - hmdsH - prH} width={28} height={prH}
                        fill="#e8b87a" opacity={0.85} rx={1} />
                    ))}
                  </g>
                )}
                {step >= 7 && (
                  <g>
                    {[55, 120, 190, 260, 315].map((cx) => (
                      <rect key={cx} x={cx} y={subY - hmdsH - prH} width={28} height={prH} rx={1} fill="#c4884d" />
                    ))}
                    {step === 7 && (
                      <g>
                        {[55, 120, 190, 260, 315].map((cx) => (
                          <rect key={cx} x={cx - 1} y={subY - hmdsH - prH - 2} width={30} height={prH + 4} rx={1}
                            fill="none" stroke="#ff8c42" strokeWidth={1} opacity={0.35} />
                        ))}
                      </g>
                    )}
                  </g>
                )}
                {step >= 4 && step < 6 && (
                  <g>
                    <rect x={subX} y={subY - hmdsH - prH - 18} width={subW} height={8} rx={1}
                      fill="#555" opacity={0.5} />
                    {[55, 120, 190, 260, 315].map((cx) => (
                      <g key={cx}>
                        <line x1={cx + 14} y1={subY - hmdsH - prH - 22} x2={cx + 14} y2={subY - hmdsH - prH}
                          stroke="#a78bfa" strokeWidth={1.2} opacity={step === 5 ? 0.8 : 0.5} />
                        {step === 5 && (
                          <circle cx={cx + 14} cy={subY - hmdsH - prH} r={2} fill="#a78bfa" opacity={0.5} />
                        )}
                      </g>
                    ))}
                  </g>
                )}
                {step === 3 && (
                  <g>
                    {[50, 110, 170, 240, 310].map((cx) => (
                      <path key={cx}
                        d={'M ${cx - 8} ${subY - hmdsH - prH - 6} Q ${cx} ${subY - hmdsH - prH - 14} ${cx + 8} ${subY - hmdsH - prH - 6}'}
                        stroke="#ff8c42" strokeWidth={1.2} fill="none" opacity={0.45} />
                    ))}
                  </g>
                )}
                {step === 6 && (
                  <g>
                    {[55, 120, 190, 260, 315].map((cx) => (
                      <path key={cx}
                        d={'M ${cx - 8} ${subY - hmdsH - prH - 4} Q ${cx} ${subY - hmdsH - prH - 12} ${cx + 8} ${subY - hmdsH - prH - 4}'}
                        stroke="#ff8c42" strokeWidth={1.2} fill="none" opacity={0.4} />
                    ))}
                  </g>
                )}
                {step === 2 && (
                  <g>
                    <text x={subX + subW / 2} y={subY - hmdsH - prH - 14}
                      textAnchor="middle" fill="#c4884d" fontSize={9} fontFamily="monospace">PR</text>
                    <circle cx={subX + subW / 2} cy={subY - hmdsH - prH + 8} r={5}
                      fill="#c4884d" opacity={0.4}>
                      <animate attributeName="r" values="4;10;4" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                  </g>
                )}
              </g>
            )}
            {(step === 0 || step === 1) && (
              <g>
                {[60, 110, 170, 240, 310].map((cx) => (
                  <circle key={cx} cx={cx} cy={step === 0 ? subY - 8 : subY - hmdsH - 3}
                    r={2.5} fill={step === 0 ? '#ff6b6b' : '#4a5568'} opacity={0.5} />
                ))}
              </g>
            )}
            {step === 0 && (
              <text x={subX + subW / 2} y={subY - 20}
                textAnchor="middle" fill="#a1a1aa" fontSize={9} fontFamily="monospace">{'\u6c61\u67d3\u7269\u9700\u6e05\u9664'}</text>
            )}
            <rect x={subX} y={subY} width={subW} height={subH} rx={2}
              fill="#2a2a3a" stroke="#444" strokeWidth={0.5} />
            <text x={subX + subW / 2} y={subY + subH / 2 + 4}
              textAnchor="middle" fill="#666" fontSize={9} fontFamily="monospace">Silicon Wafer</text>
          </svg>
          <p className="mt-3 text-center text-[10px] text-[var(--muted-foreground)] leading-relaxed max-w-sm mx-auto">
            {s.detail}
          </p>
        </div>
        <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--muted)] flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setStep((s) => (s - 1 + STEPS.length) % STEPS.length)}
              className="px-2 py-1 font-mono text-[10px] rounded border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)] hover:bg-[var(--surface)] transition-colors"
              disabled={autoPlay}
            >{'\u2190 \u4e0a\u4e00\u6b65'}</button>
            <button
              onClick={() => setStep((s) => (s + 1) % STEPS.length)}
              className="px-2 py-1 font-mono text-[10px] rounded border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)] hover:bg-[var(--surface)] transition-colors"
              disabled={autoPlay}
            >{'\u4e0b\u4e00\u6b65 \u2192'}</button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <button key={i} onClick={() => setStep(i)}
                  className={'w-2 h-2 rounded-full transition-all ${i === step ? \'bg-[var(--accent)] scale-125\' : \'bg-[var(--border)]\'}'}
                  aria-label={'Step ' + (i + 1)} />
              ))}
            </div>
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={'px-2 py-1 font-mono text-[10px] rounded border transition-colors ' +
                (autoPlay
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)]')}
            >{autoPlay ? '\u23f8' : '\u25b6'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
