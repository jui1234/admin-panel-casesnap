'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing auth token on mount
    const checkAuth = () => {
      const token = localStorage.getItem('authToken')
      const userData = localStorage.getItem('userData')
      const organizationData = localStorage.getItem('organizationData')
      
      if (token && userData && organizationData) {
        try {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
        } catch (error) {
          // Invalid user data, clear it
          localStorage.removeItem('authToken')
          localStorage.removeItem('userData')
          localStorage.removeItem('organizationData')
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Basic validation
      if (!email || !password) {
        return false
      }

      if (!email.includes('@')) {
        return false
      }

      // Mock successful login
      const mockUser: User = {
        id: '1',
        email: email,
        name: email.split('@')[0],
        role: 'admin'
      }

      // Store auth data
      localStorage.setItem('authToken', 'mock-jwt-token')
      localStorage.setItem('userData', JSON.stringify(mockUser))
      
      setUser(mockUser)
      return true
    } catch (error) {
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('organizationData')
    setUser(null)
    router.push('/auth/login')
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
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
