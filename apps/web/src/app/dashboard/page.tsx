'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-context'
import { useRouter } from 'next/navigation'
import type { ServiceEntry, FeedbackEntry, CommentEntry } from '@pbeta/shared'

export default function DashboardPage() {
  const { token, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'services' | 'feedback' | 'comments'>('services')
  
  const [services, setServices] = useState<ServiceEntry[]>([])
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([])
  const [comments, setComments] = useState<CommentEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Form state for creating/editing service
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '', url: '', category: 'general' })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchData()
  }, [isAuthenticated, token])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      
      // Fetch services
      const servicesRes = await fetch(`${apiUrl}/api/v1/services`)
      if (servicesRes.ok) {
        setServices(await servicesRes.json())
      }

      // Fetch feedback (private)
      const feedbackRes = await fetch(`${apiUrl}/api/v1/feedback`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (feedbackRes.ok) {
        setFeedbacks(await feedbackRes.json())
      }

      // Fetch comments (private admin)
      const commentsRes = await fetch(`${apiUrl}/api/v1/comments?all=true`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (commentsRes.ok) {
        setComments(await commentsRes.json())
      }
    } catch (err) {
      console.error('Failed to fetch data', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteService = async (id: string) => {
    if (!confirm('确定要删除这个服务吗？')) return
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const res = await fetch(`${apiUrl}/api/v1/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.ok) {
        setServices(services.filter(s => s.id !== id))
      }
    } catch (err) {
      alert('删除失败')
    }
  }

  const handleDeleteComment = async (id: string) => {
    if (!confirm('确定要删除这条评论吗？')) return
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const res = await fetch(`${apiUrl}/api/v1/comments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.ok) {
        setComments(comments.filter(c => c.id !== id))
      }
    } catch (err) {
      alert('删除失败')
    }
  }

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const url = editingId 
        ? `${apiUrl}/api/v1/services/${editingId}`
        : `${apiUrl}/api/v1/services`
      
      const method = editingId ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setIsEditing(false)
        setEditingId(null)
        setFormData({ name: '', description: '', url: '', category: 'general' })
        fetchData() // Refresh list
      } else {
        const err = await res.json()
        alert(`保存失败: ${err.message || 'Unknown error'}`)
      }
    } catch (err) {
      alert('保存失败')
    }
  }

  const startEdit = (service?: ServiceEntry) => {
    if (service) {
      setEditingId(service.id)
      setFormData({ name: service.name, description: service.description || '', url: service.url, category: service.category })
    } else {
      setEditingId(null)
      setFormData({ name: '', description: '', url: '', category: 'general' })
    }
    setIsEditing(true)
  }

  if (!isAuthenticated) return null

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 space-y-8 anim-fade-up">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">管理工作台</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            管理公开服务、反馈和评论。私有网络服务入口在内网页。
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/private"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            前往内网入口
          </Link>
          <button 
            onClick={logout}
            className="text-sm text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
          >
            退出登录
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'services' 
              ? 'bg-[var(--foreground)] text-[var(--background)] shadow-sm' 
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          服务监控
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'feedback' 
              ? 'bg-[var(--foreground)] text-[var(--background)] shadow-sm' 
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          反馈列表
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'comments' 
              ? 'bg-[var(--foreground)] text-[var(--background)] shadow-sm' 
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          评论管理
        </button>
      </div>

      {/* Services Panel */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => startEdit()}
              className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              + 新增服务
            </button>
          </div>

          {isEditing && (
            <div className="glass p-6 rounded-xl border border-[var(--border)] anim-fade-in">
              <h3 className="font-medium mb-4">{editingId ? '编辑服务' : '新增服务'}</h3>
              <form onSubmit={handleSaveService} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[var(--muted-foreground)] mb-1">名称</label>
                    <input
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 bg-[var(--muted)]/50 border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--muted-foreground)] mb-1">分类</label>
                    <input
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 bg-[var(--muted)]/50 border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-[var(--muted-foreground)] mb-1">URL</label>
                    <input
                      required
                      type="url"
                      value={formData.url}
                      onChange={e => setFormData({...formData, url: e.target.value})}
                      className="w-full px-3 py-2 bg-[var(--muted)]/50 border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-[var(--muted-foreground)] mb-1">描述</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 bg-[var(--muted)]/50 border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] resize-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-sm bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    保存
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid gap-3">
            {services.map(svc => (
              <div key={svc.id} className="glass p-4 rounded-xl flex items-center justify-between group">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{svc.name}</h3>
                    <span className={`w-2 h-2 rounded-full ${
                      svc.status === 'up' ? 'bg-green-500' : 
                      svc.status === 'down' ? 'bg-red-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mt-0.5 font-mono">
                    <span className="truncate max-w-[200px]">{svc.url}</span>
                    <span>•</span>
                    <span>上次检查: {svc.checkedAt ? new Date(svc.checkedAt).toLocaleTimeString() : '从未'}</span>
                  </div>
                  {svc.description && (
                    <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-1 max-w-md">
                      {svc.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(svc)}
                    className="p-2 hover:bg-[var(--muted)] rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteService(svc.id)}
                    className="p-2 hover:bg-[var(--muted)] rounded-lg text-[var(--muted-foreground)] hover:text-red-500"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            {services.length === 0 && !isLoading && (
              <div className="text-center py-12 text-[var(--muted-foreground)] text-sm border-2 border-dashed border-[var(--border)] rounded-xl">
                暂无服务
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback Panel */}
      {activeTab === 'feedback' && (
        <div className="space-y-6 anim-fade-up">
          <h2 className="text-xl font-semibold">用户反馈</h2>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--muted)]/50 border-b border-[var(--border)]">
                <tr>
                  <th className="px-4 py-3 font-medium text-[var(--muted-foreground)]">时间</th>
                  <th className="px-4 py-3 font-medium text-[var(--muted-foreground)]">内容</th>
                  <th className="px-4 py-3 font-medium text-[var(--muted-foreground)]">联系方式</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {feedbacks.map(fb => (
                  <tr key={fb.id} className="hover:bg-[var(--muted)]/20">
                    <td className="px-4 py-3 text-[var(--muted-foreground)] w-48">
                      {new Date(fb.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{fb.message}</td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)] font-mono">
                      {fb.contact || '-'}
                    </td>
                  </tr>
                ))}
                {feedbacks.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-[var(--muted-foreground)]">
                      暂无反馈数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comments Panel */}
      {activeTab === 'comments' && (
        <div className="space-y-6 anim-fade-up">
          <h2 className="text-xl font-semibold">评论管理</h2>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--muted)]/50 border-b border-[var(--border)]">
                <tr>
                  <th className="px-4 py-3 font-medium text-[var(--muted-foreground)]">时间</th>
                  <th className="px-4 py-3 font-medium text-[var(--muted-foreground)]">作者</th>
                  <th className="px-4 py-3 font-medium text-[var(--muted-foreground)]">内容</th>
                  <th className="px-4 py-3 font-medium text-[var(--muted-foreground)]">文章 Slug</th>
                  <th className="px-4 py-3 font-medium text-[var(--muted-foreground)] text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {comments.map(c => (
                  <tr key={c.id} className="hover:bg-[var(--muted)]/20">
                    <td className="px-4 py-3 text-[var(--muted-foreground)] w-40 whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 w-40">
                      <div className="font-medium">{c.author}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{c.email}</div>
                    </td>
                    <td className="px-4 py-3 min-w-[300px]">{c.content}</td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)] font-mono text-xs w-32">
                      {c.slug}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleDeleteComment(c.id)}
                        className="text-xs text-rose-500 hover:text-rose-400 hover:underline"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
                {comments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[var(--muted-foreground)]">
                      暂无评论数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
