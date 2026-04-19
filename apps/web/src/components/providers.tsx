'use client'

import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/components/auth-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}
