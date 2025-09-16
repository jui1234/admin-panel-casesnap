'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: string
  organizationId?: string
  organizationName?: string
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
      try {
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
      } catch (error) {
        // localStorage not available (SSR or disabled)
        console.log('localStorage not available')
      } finally {
        setIsLoading(false)
      }
    }

    // Add a small delay to ensure proper hydration
    const timeout = setTimeout(checkAuth, 100)
    
    return () => clearTimeout(timeout)
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

      // Get organization data if available
      let organizationInfo = {}
      try {
        const organizationData = localStorage.getItem('organizationData')
        
        if (organizationData) {
          try {
            const orgData = JSON.parse(organizationData)
            organizationInfo = {
              organizationId: orgData.companyName.toLowerCase().replace(/\s+/g, '-'),
              organizationName: orgData.companyName
            }
          } catch (error) {
            console.error('Error parsing organization data:', error)
          }
        }
      } catch (error) {
        // localStorage not available
        console.log('localStorage not available during login')
      }

      // Mock successful login
      const mockUser: User = {
        id: '1',
        email: email,
        name: email.split('@')[0],
        role: 'admin',
        ...organizationInfo
      }

      // Store auth data
      try {
        localStorage.setItem('authToken', 'mock-jwt-token')
        localStorage.setItem('userData', JSON.stringify(mockUser))
      } catch (error) {
        // localStorage not available, continue without storing
        console.log('localStorage not available for storing auth data')
      }
      
      setUser(mockUser)
      return true
    } catch (error) {
      return false
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      localStorage.removeItem('organizationData')
    } catch (error) {
      // localStorage not available
      console.log('localStorage not available during logout')
    }
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
