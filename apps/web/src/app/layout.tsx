import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from '@/components/providers'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { MouseGlow } from '@/components/mouse-glow'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'Tech Memos · 技术备忘录', template: '%s · Tech Memos' },
  description: '技术备忘录 (Tech Memos) — 记录项目、研究与技术笔记的个人空间。',
  metadataBase: new URL('https://pbeta.me'),
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': '/rss.xml' },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'Tech Memos',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <MouseGlow />
          <div className="flex min-h-dvh flex-col">
            <Nav />
            <main className="flex-1 pt-24">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
