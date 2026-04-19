export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted-foreground)] border border-[var(--border)] rounded bg-[var(--muted)] hover:border-[var(--border-strong)] transition-colors">
      {children}
    </span>
  )
}
