import Link from 'next/link'

export function Footer() {
  const year = new Date().getFullYear()
  
  return (
    <footer className="mt-24 py-12 border-t border-[var(--border)] bg-[var(--background)] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[var(--accent)] opacity-[0.02] blur-[100px] pointer-events-none rounded-full" />
      
      <div className="relative mx-auto max-w-4xl px-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <span className="font-semibold text-sm tracking-tight text-[var(--foreground)]">Tech Memos</span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] max-w-xs leading-relaxed">
            记录、研究与技术笔记的个人空间。
          </p>
          <div className="mt-2 text-[10px] text-[var(--muted-foreground)]/60 font-mono uppercase tracking-wider">
            © {year} 保留所有权利.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-2">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider mb-1">社交</span>
            <a href="https://github.com/atbeta" target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">GitHub</a>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider mb-1">站点</span>
            <a href="/rss.xml" className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">RSS 订阅</a>
            <Link href="/about" className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">关于</Link>
            <Link href="/login" className="text-[10px] text-[var(--muted-foreground)]/40 hover:text-[var(--foreground)] transition-colors mt-auto">管理入口</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
