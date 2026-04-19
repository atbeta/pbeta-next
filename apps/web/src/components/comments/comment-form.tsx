'use client'

import { useState } from 'react'
import { API_BASE_URL } from '@/lib/api-base-url'

interface CommentFormProps {
  slug: string
  parentId?: string
  onSuccess?: () => void
  onCancel?: () => void
  isReply?: boolean
}

export function CommentForm({ slug, parentId, onSuccess, onCancel, isReply }: CommentFormProps) {
  const [author, setAuthor] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [website, setWebsite] = useState('') // Honeypot
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!author || !content) return

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          author,
          email: email || undefined,
          content,
          parentId,
          website, // Honeypot
        }),
      })

      if (!res.ok) {
        throw new Error('发送失败，请稍后再试')
      }

      setAuthor('')
      setEmail('')
      setContent('')
      setWebsite('')
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${isReply ? 'mt-4' : ''}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="昵称 *"
          required
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full px-4 py-2 text-sm glass rounded-lg border border-[var(--border)] focus:border-[var(--accent)] outline-none transition-all"
        />
        <input
          type="email"
          placeholder="邮箱 (可选，不公开)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 text-sm glass rounded-lg border border-[var(--border)] focus:border-[var(--accent)] outline-none transition-all"
        />
      </div>
      
      {/* Honeypot field - hidden from users */}
      <div className="absolute opacity-0 -z-50 pointer-events-none h-0 w-0 overflow-hidden">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <textarea
        placeholder={isReply ? "写下你的回复..." : "写下你的评论..."}
        required
        rows={isReply ? 3 : 4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full px-4 py-3 text-sm glass rounded-xl border border-[var(--border)] focus:border-[var(--accent)] outline-none transition-all resize-none"
      />

      <div className="flex items-center justify-between">
        {error && <span className="text-xs text-red-500">{error}</span>}
        <div className="flex items-center gap-2 ml-auto">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              取消
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 text-xs font-bold bg-[var(--foreground)] text-[var(--background)] rounded-lg hover:scale-105 transition-all disabled:opacity-50"
          >
            {isSubmitting ? '发送中...' : (isReply ? '回复' : '发布评论')}
          </button>
        </div>
      </div>
    </form>
  )
}
