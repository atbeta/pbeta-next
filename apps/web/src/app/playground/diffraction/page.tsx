import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Diffraction Pattern Explorer' }

export default function DiffractionPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 anim-fade-up">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-1 h-4 bg-[var(--accent)] rounded-full" />
          <span className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase tracking-[0.2em]">
            Optics
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-2">Diffraction Pattern Explorer</h1>
        <p className="text-sm text-[var(--muted-foreground)] max-w-lg leading-relaxed">
          夫琅禾费衍射图案实时生成。光刻光学仿真的最小可行单元——理解傅里叶光学与成像系统的基础。
        </p>
      </div>

      <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-16 flex flex-col items-center justify-center text-center anim-fade-up delay-1">
        <span className="font-mono text-[11px] text-[var(--muted-foreground)] mb-2">
          Canvas 衍射图案生成器
        </span>
        <span className="text-[10px] text-[var(--muted-foreground)]/50">
          即将上线 — 支持圆形/矩形/光栅孔径、波长可调、强度分布图
        </span>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3 anim-fade-up delay-1">
        {[
          { title: '圆形孔径', desc: 'Airy pattern 艾里斑' },
          { title: '矩形孔径', desc: 'sinc^2 二维衍射图' },
          { title: '光栅衍射', desc: '多缝干涉 + 衍射包络' },
          { title: '波长调节', desc: '193nm / 365nm / 可见光' },
          { title: '强度剖面', desc: '一维截面曲线' },
          { title: 'WASM FFT', desc: '快速傅里叶变换加速' },
        ].map((f) => (
          <div key={f.title} className="p-3 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
            <span className="font-mono text-[11px] font-semibold">{f.title}</span>
            <p className="text-[10px] text-[var(--muted-foreground)] mt-1">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 border border-dashed border-[var(--border)] rounded-lg anim-fade-up delay-2">
        <h3 className="font-mono text-xs font-semibold mb-2">技术栈</h3>
        <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
          当前用 Canvas 2D 实时计算夫琅禾费衍射积分。后续集成 WASM FFT 实现快速傅里叶变换，
          为完整光刻光学仿真（Abbe 成像模型 + 薄掩模近似）做准备。
        </p>
      </div>
    </div>
  )
}
