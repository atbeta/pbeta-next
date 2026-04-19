'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/format'
import { CommentForm } from './comment-form'
import type { CommentEntry } from '@pbeta/shared'

interface CommentItemProps {
  comment: CommentEntry
  slug: string
  refresh: () => void
}

export function CommentItem({ comment, slug, refresh }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false)

  return (
    <div className="group py-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${comment.isAdmin ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}>
            {comment.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[var(--foreground)]">{comment.author}</span>
              {comment.isAdmin && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 uppercase font-bold tracking-wider">
                  Admin
                </span>
              )}
            </div>
            <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
              {formatDate(comment.createdAt)}
            </span>
          </div>
        </div>
        {!isReplying && (
          <button
            onClick={() => setIsReplying(true)}
            className="text-[10px] uppercase font-bold tracking-widest text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors"
          >
            Reply
          </button>
        )}
      </div>

      <div className="pl-11 pr-2 text-sm leading-relaxed text-[var(--muted-foreground)] whitespace-pre-wrap">
        {comment.content}
      </div>

      {isReplying && (
        <div className="pl-11">
          <CommentForm
            slug={slug}
            parentId={comment.id}
            isReply
            onSuccess={() => {
              setIsReplying(false)
              refresh()
            }}
            onCancel={() => setIsReplying(false)}
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-6 md:pl-11 space-y-2 border-l border-[var(--border)] ml-4 md:ml-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} slug={slug} refresh={refresh} />
          ))}
        </div>
      )}
    </div>
  )
}
