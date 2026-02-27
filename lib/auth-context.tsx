'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from './types'
import { supabase } from './supabase'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: string | null
  logout: () => Promise<void>
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already logged in (demo: use localStorage)
    const storedUser = localStorage.getItem('carpoolUser')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (err) {
        setError('Failed to load user session')
      }
    }
    setIsLoading(false)
  }, [])

  const logout = async () => {
    localStorage.removeItem('carpoolUser')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, error, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
