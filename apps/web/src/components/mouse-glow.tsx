'use client'

import React, { useState, useEffect } from 'react'

export function MouseGlow() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 opacity-50"
      style={{
        background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, var(--accent), transparent 80%)`,
        opacity: 0.05,
      }}
    />
  )
}
