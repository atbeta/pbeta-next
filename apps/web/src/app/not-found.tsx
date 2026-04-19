import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-32 flex flex-col items-center text-center">
      <div className="relative mb-8">
        <span className="font-mono text-[120px] font-bold leading-none text-[var(--muted-foreground)]/10 select-none">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="space-y-2">
            <p className="font-mono text-4xl font-bold tracking-tight">404</p>
          </div>
        </div>
      </div>

      <h1 className="text-xl font-semibold mb-3 text-[var(--foreground)]">
        页面不存在
      </h1>
      <p className="text-sm text-[var(--muted-foreground)] max-w-sm leading-relaxed mb-10">
        你访问的页面已被移走、删除，或者从未存在过。
      </p>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="px-5 py-2 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          回到首页
        </Link>
        <Link
          href="/notes"
          className="px-5 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          浏览随笔
        </Link>
      </div>
    </div>
  )
}
