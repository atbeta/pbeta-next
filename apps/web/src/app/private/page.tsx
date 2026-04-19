'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-context'
import { Logo } from '@/components/logo'
import { API_BASE_URL } from '@/lib/api-base-url'
import type { CommentEntry, ServiceEntry } from '@pbeta/shared'

const DEFAULT_LINKS = [
  { id: '1', name: 'NAS 控制台', url: '#', icon: '💾', description: '个人文件存储与备份管理' },
  { id: '2', name: '监控面板', url: '#', icon: '📊', description: '家庭网络与服务器实时监控' },
  { id: '3', name: '私有云盘', url: '#', icon: '☁️', description: 'Nextcloud 私有部署' },
  { id: '4', name: '代码托管', url: '#', icon: '💻', description: 'Gitea 自建实例' },
  { id: '5', name: '家庭中控', url: '#', icon: '🏠', description: 'Home Assistant 智能家居' },
  { id: '6', name: '软路由', url: '#', icon: '🚀', description: 'OpenWrt 网络管理' },
]

const STORAGE_KEY = 'pbeta:private-links'

interface PrivateLink {
  id: string
  name: string
  url: string
  icon: string
  description: string
}


const emptyForm = { name: '', url: '', icon: '🔗', description: '' }

export default function PrivatePage() {
  const { isAuthenticated, token } = useAuth()
  const router = useRouter()
  const [comments, setComments] = useState<CommentEntry[]>([])
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [serviceStats, setServiceStats] = useState<{ up: number; total: number } | null>(null)

  // Link config state
  const [links, setLinks] = useState<PrivateLink[]>(DEFAULT_LINKS)
  const [isEditMode, setIsEditMode] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<PrivateLink | null>(null)
  const [form, setForm] = useState(emptyForm)

  // Load persisted links
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setLinks(JSON.parse(stored))
    } catch {}
  }, [])

  const saveLinks = (next: PrivateLink[]) => {
    setLinks(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const openAdd = () => {
    setEditingLink(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (link: PrivateLink) => {
    setEditingLink(link)
    setForm({ name: link.name, url: link.url, icon: link.icon, description: link.description })
    setFormOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim() || !form.url.trim()) return
    if (editingLink) {
      saveLinks(links.map(l => l.id === editingLink.id ? { ...editingLink, ...form } : l))
    } else {
      saveLinks([...links, { ...form, id: Date.now().toString() }])
    }
    setFormOpen(false)
  }

  const handleDelete = (id: string) => {
    if (!confirm('确定删除这个链接？')) return
    saveLinks(links.filter(l => l.id !== id))
  }

  const exitEditMode = () => {
    setIsEditMode(false)
    setFormOpen(false)
  }

  const fetchAllComments = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/comments?all=true`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) setComments(await res.json())
    } catch (err) {
      console.error(err)
    }
  }, [token])

  const fetchServiceStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/services`)
      if (res.ok) {
        const services: ServiceEntry[] = await res.json()
        setServiceStats({ up: services.filter(s => s.status === 'up').length, total: services.length })
      }
    } catch {}
  }, [])

  const deleteComment = async (id: string) => {
    if (!confirm('确定要删除这条评论吗？')) return
    setIsDeleting(id)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/comments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) fetchAllComments()
    } catch (err) {
      console.error(err)
    } finally {
      setIsDeleting(null)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    } else {
      fetchAllComments()
      fetchServiceStats()
    }
  }, [isAuthenticated, router, fetchAllComments, fetchServiceStats])

  if (!isAuthenticated) return null

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="mb-12 anim-fade-up">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Logo className="w-8 h-8 opacity-80" />
              <h1 className="text-3xl font-bold tracking-tight">内网入口</h1>
            </div>
            <p className="text-[var(--muted-foreground)] leading-relaxed max-w-2xl">
              这里放你的私有网络服务入口。管理服务监控、反馈和评论请前往管理工作台。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)] hover:text-[var(--foreground)] transition-all"
            >
              前往管理台
            </Link>
            <button
              onClick={isEditMode ? exitEditMode : () => setIsEditMode(true)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                isEditMode
                  ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5'
                  : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {isEditMode ? '完成配置' : '配置链接'}
            </button>
          </div>
        </div>
      </div>

      {/* Link Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link, i) => (
          <div key={link.id} className="relative group">
            <a
              href={isEditMode ? undefined : link.url}
              onClick={isEditMode ? (e) => e.preventDefault() : undefined}
              className={`block p-5 rounded-2xl glass border border-[var(--border)] transition-all duration-300 anim-fade-up delay-${(i % 6) + 1} ${
                isEditMode
                  ? 'cursor-default opacity-80'
                  : 'hover:border-[var(--accent)] cursor-pointer'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <span className={`text-2xl transition-all duration-500 ${isEditMode ? '' : 'grayscale group-hover:grayscale-0 transform group-hover:scale-110'}`}>
                  {link.icon}
                </span>
                {!isEditMode && (
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent)]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17l9.2-9.2M17 17V7H7" />
                    </svg>
                  </span>
                )}
              </div>
              <h3 className={`text-sm font-bold mb-1.5 transition-colors ${isEditMode ? '' : 'group-hover:text-[var(--accent)]'}`}>
                {link.name}
              </h3>
              <p className="text-[11px] text-[var(--muted-foreground)] leading-snug">
                {link.description}
              </p>
            </a>

            {/* Edit mode controls */}
            {isEditMode && (
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => openEdit(link)}
                  className="p-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-all text-xs"
                  title="编辑"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(link.id)}
                  className="p-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-red-500 hover:border-red-500 transition-all text-xs"
                  title="删除"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add new card (edit mode only) */}
        {isEditMode && (
          <button
            onClick={openAdd}
            className="p-5 rounded-2xl border-2 border-dashed border-[var(--border)] hover:border-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-all duration-300 flex flex-col items-center justify-center gap-2 min-h-[120px]"
          >
            <span className="text-2xl">+</span>
            <span className="text-xs font-medium">添加链接</span>
          </button>
        )}
      </div>

      {/* Link Edit Form */}
      {formOpen && (
        <div className="mt-6 glass p-6 rounded-2xl border border-[var(--accent)]/30 anim-fade-up">
          <h3 className="text-sm font-semibold mb-4">{editingLink ? '编辑链接' : '新增链接'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">名称</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="服务名称"
                className="w-full px-3 py-2 text-sm bg-[var(--muted)]/50 border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">图标（Emoji）</label>
              <input
                value={form.icon}
                onChange={e => setForm({ ...form, icon: e.target.value })}
                placeholder="🔗"
                className="w-full px-3 py-2 text-sm bg-[var(--muted)]/50 border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">URL</label>
              <input
                value={form.url}
                onChange={e => setForm({ ...form, url: e.target.value })}
                placeholder="https://"
                className="w-full px-3 py-2 text-sm bg-[var(--muted)]/50 border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] transition-colors font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">描述</label>
              <input
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="简短描述"
                className="w-full px-3 py-2 text-sm bg-[var(--muted)]/50 border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button
              onClick={() => setFormOpen(false)}
              className="px-3 py-1.5 text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!form.name.trim() || !form.url.trim()}
              className="px-4 py-1.5 text-sm bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              保存
            </button>
          </div>
        </div>
      )}

      {/* Status summary */}
      <div className="mt-16 p-6 rounded-2xl bg-[var(--muted)]/50 border border-[var(--border)] border-dashed anim-fade-up delay-6">
        <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)] mb-3">系统状态摘要</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <span className="text-[10px] text-[var(--muted-foreground)] block">服务运行</span>
            <span className={`text-lg font-mono font-bold ${serviceStats && serviceStats.up < serviceStats.total ? 'text-red-500' : 'text-[var(--accent)]'}`}>
              {serviceStats ? `${serviceStats.up} / ${serviceStats.total}` : '— / —'}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-[var(--muted-foreground)] block">内网流量</span>
            <span className="text-lg font-mono font-bold uppercase">12.8 Gbps</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-[var(--muted-foreground)] block">平均延迟</span>
            <span className="text-lg font-mono font-bold">2ms</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-[var(--muted-foreground)] block">证书状态</span>
            <span className="text-lg font-mono font-bold text-green-500">正常</span>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="mt-12 anim-fade-up delay-6">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          评论管理
        </h2>
        <div className="glass rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--muted)]/50 border-b border-[var(--border)] text-[var(--muted-foreground)] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 font-bold">作者</th>
                  <th className="px-6 py-3 font-bold">内容</th>
                  <th className="px-6 py-3 font-bold">位置</th>
                  <th className="px-6 py-3 font-bold">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {comments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-[var(--muted-foreground)]">暂无评论</td>
                  </tr>
                ) : (
                  comments.map((c: CommentEntry) => (
                    <tr key={c.id} className="hover:bg-[var(--muted)]/20 transition-colors">
                      <td className="px-6 py-4 font-medium">{c.author}</td>
                      <td className="px-6 py-4 max-w-xs truncate">{c.content}</td>
                      <td className="px-6 py-4 text-[var(--muted-foreground)] font-mono">{c.slug}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteComment(c.id)}
                          disabled={isDeleting === c.id}
                          className="text-red-500 hover:text-red-600 font-bold uppercase transition-colors disabled:opacity-50"
                        >
                          {isDeleting === c.id ? '...' : '删除'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
