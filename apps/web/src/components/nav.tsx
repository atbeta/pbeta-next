'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo } from '@/components/logo'
import { useAuth } from '@/components/auth-context'

const links = [
  { href: '/projects', label: '项目' },
  { href: '/notes', label: '随笔' },
  { href: '/research', label: '研究' },
  { href: '/services', label: '服务' },
  { href: '/playground', label: 'Playground' },
]

export function Nav() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  const allLinks = [
    ...links,
    ...(isAuthenticated
      ? [
          { href: '/private', label: '个人' },
          { href: '/dashboard', label: '管理' },
        ]
      : []),
  ]

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <div className="glass rounded-full px-4 h-12 flex items-center justify-between shadow-sm transition-all duration-300 hover:shadow-md hover:border-[var(--border-strong)]">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 font-mono text-sm font-semibold tracking-tight text-[var(--foreground)] transition-opacity hover:opacity-80 pl-2"
        >
          <Logo className="w-5 h-5" />
          <span className="ml-1 uppercase tracking-[0.15em] text-[11px] font-bold opacity-90">Tech Memos</span>
        </Link>

        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-1 mr-1">
            {allLinks.map((l) => {
              const active = pathname.startsWith(l.href)
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative px-3 py-1.5 text-[13px] tracking-wide font-medium transition-all rounded-full ${
                    active
                      ? 'text-[var(--foreground)] bg-[var(--muted)]'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50'
                  }`}
                >
                  {l.label}
                </Link>
              )
            })}
          </nav>

          <div className="w-px h-4 bg-[var(--border)] mx-1" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
