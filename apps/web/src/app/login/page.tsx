'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-context'
import { Logo } from '@/components/logo'

export default function LoginPage() {
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setError('')
    try {
      await login(apiKey)
    } catch (err) {
      setError('认证失败，请检查 API Key')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-[60dvh] flex items-center justify-center p-6">
      <div className="w-full max-w-sm glass p-8 rounded-2xl space-y-8 anim-fade-up">
        <div className="flex flex-col items-center text-center">
          <Logo className="w-12 h-12 mb-4" />
          <h1 className="text-2xl font-bold tracking-tight">管理后台</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            请输入 API Key 以进入管理台和私有入口
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl outline-none focus:border-[var(--accent)] transition-all text-center tracking-widest"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 text-center animate-shake">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-[var(--foreground)] text-[var(--background)] font-medium rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {isPending ? '正在验证...' : '进入备忘录'}
          </button>
        </form>
      </div>
    </div>
  )
}
