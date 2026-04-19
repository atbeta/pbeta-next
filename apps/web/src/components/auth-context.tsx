'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  token: string | null
  isAuthenticated: boolean
  login: (apiKey: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Only access localStorage on the client side
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('auth_token')
      if (savedToken) {
        setToken(savedToken)
      }
      setIsLoading(false)
    }
  }, [])

  const login = async (apiKey: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('Login failed:', errorData)
        throw new Error(errorData.message || 'Login failed')
      }

      const data = await res.json()
      if (!data.access_token) {
         throw new Error('No access token received')
      }

      setToken(data.access_token)
      localStorage.setItem('auth_token', data.access_token)
      // Authenticated users land in the management dashboard first.
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem('auth_token')
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
