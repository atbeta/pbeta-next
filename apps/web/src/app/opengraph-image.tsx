import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Tech Memos · 技术备忘录'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#050505',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '600px',
            background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#6366f1',
              }}
            />
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '14px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              pbeta.me
            </span>
          </div>

          <div
            style={{
              fontSize: '72px',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            技术备忘录
          </div>

          <div
            style={{
              fontSize: '28px',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.05em',
            }}
          >
            Tech Memos
          </div>

          <div
            style={{
              marginTop: '16px',
              fontSize: '18px',
              color: 'rgba(255,255,255,0.35)',
              maxWidth: '600px',
              lineHeight: 1.5,
            }}
          >
            记录项目、研究与技术笔记的个人空间
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
