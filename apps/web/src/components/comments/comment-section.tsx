'use client'

import { useEffect, useState, useCallback } from 'react'
import { CommentForm } from './comment-form'
import { CommentItem } from './comment-item'
import { API_BASE_URL } from '@/lib/api-base-url'

interface CommentSectionProps {
  slug: string
}

export function CommentSection({ slug }: CommentSectionProps) {
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/comments?slug=${encodeURIComponent(slug)}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data)
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err)
    } finally {
      setIsLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  return (
    <section className="mt-20 pt-10 border-t border-[var(--border)] anim-fade-up">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-bold">评论交流</h2>
        <span className="text-xs text-[var(--muted-foreground)] font-mono">
          {comments.length} Comments
        </span>
      </div>

      <CommentForm slug={slug} onSuccess={fetchComments} />

      <div className="mt-12 divide-y divide-[var(--border)] -mx-4 px-4">
        {isLoading ? (
          <div className="py-10 text-center text-sm text-[var(--muted-foreground)]">加载中...</div>
        ) : comments.length === 0 ? (
          <div className="py-10 text-center text-sm text-[var(--muted-foreground)]">暂无评论，来第一个分享想法吧。</div>
        ) : (
          comments.map((comment: any) => (
            <CommentItem key={comment.id} comment={comment} slug={slug} refresh={fetchComments} />
          ))
        )}
      </div>
    </section>
  )
}
