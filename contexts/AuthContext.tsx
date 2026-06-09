'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { clearAuthStorage } from '@/lib/clearAuthStorage'

const APP_BACKEND_URL =
  process.env.NEXT_PUBLIC_APP_BACKEND_URL || 'https://casesnapbackend.onrender.com/'

interface Role {
  id: string
  name: string
  priority: number
  permissions: Array<{
    module: string
    actions: string[]
  }>
  isSystemRole: boolean
  description: string
}

interface AssigneePermissions {
  canAssignClient?: boolean
  canAssignCase?: boolean
}

interface User {
  id: string
  email: string
  name?: string
  firstName?: string
  lastName?: string
  role: string | Role  // Can be string (legacy) or Role object (new)
  subscriptionPlan?: string  // Valid values: "free", "base", "popular"
  subscriptionStatus?: 'active' | 'inactive' | 'cancelled' | 'expired'
  subscriptionExpiresAt?: string
  canManageSubscription?: boolean
  assigneePermissions?: AssigneePermissions  // From login; controls Assigned To for client/cases
  organizationId?: string
  organizationName?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const fetchCurrentUser = async (token: string): Promise<User | null> => {
    if (typeof window === 'undefined' || !token) return null

    try {
      const base = APP_BACKEND_URL.replace(/\/$/, '')
      const response = await fetch(`${base}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      if (!data) return null

      // If the backend wraps the user object
      if (typeof data === 'object' && 'user' in data && data.user) {
        return data.user as User
      }

      return data as User
    } catch (error) {
      console.error('Failed to fetch current user:', error)
      return null
    }
  }

  useEffect(() => {
    // Check for existing auth token on mount
    const checkAuth = async () => {
      try {
        const token = sessionStorage.getItem('authToken') || sessionStorage.getItem('token')
        const userData = sessionStorage.getItem('userData')

        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData)
            if (token.length > 0) {
              setUser(parsedUser)
              return
            }
          } catch (error) {
            console.error('Error parsing user data:', error)
          }
        }

        if (token) {
          const recoveredUser = await fetchCurrentUser(token)
          if (recoveredUser) {
            try {
              sessionStorage.setItem('userData', JSON.stringify(recoveredUser))
            } catch (error) {
              console.warn('Unable to persist recovered user data:', error)
            }
            setUser(recoveredUser)
            return
          }
        }

        sessionStorage.removeItem('authToken')
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('userData')
        sessionStorage.removeItem('organizationData')
        setUser(null)
      } catch (error) {
        console.log('sessionStorage not available:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    // Run immediately - don't delay as it causes redirect issues
    void checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      try {
        const authToken = sessionStorage.getItem('authToken') || sessionStorage.getItem('token')
        const userData = sessionStorage.getItem('userData')

        if (authToken && userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          return true
        }

        if (authToken) {
          const recoveredUser = await fetchCurrentUser(authToken)
          if (recoveredUser) {
            try {
              sessionStorage.setItem('userData', JSON.stringify(recoveredUser))
            } catch (error) {
              console.warn('Unable to persist recovered user data:', error)
            }
            setUser(recoveredUser)
            return true
          }
        }
      } catch (error) {
        console.error('Error reading stored auth data:', error)
      }

      // Fallback: Basic validation for mock login
      if (!email || !password) {
        return false
      }

      if (!email.includes('@')) {
        return false
      }

      // Get organization data if available
      let organizationInfo = {}
      try {
        const organizationData = sessionStorage.getItem('organizationData')
        
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
        console.log('sessionStorage not available during login')
      }

      // Mock successful login (fallback)
      const mockUser: User = {
        id: '1',
        email: email,
        name: email.split('@')[0],
        role: 'admin',
        ...organizationInfo
      }

      try {
        sessionStorage.setItem('authToken', 'mock-jwt-token')
        sessionStorage.setItem('userData', JSON.stringify(mockUser))
      } catch (error) {
        console.log('sessionStorage not available for storing auth data')
      }
      
      setUser(mockUser)
      return true
    } catch (error) {
      return false
    }
  }

  const logout = async () => {
    const token = typeof window !== 'undefined'
      ? sessionStorage.getItem('authToken') || sessionStorage.getItem('token')
      : null

    if (token) {
      try {
        const base = APP_BACKEND_URL.replace(/\/$/, '')
        await fetch(`${base}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
      } catch (e) {
        console.warn('Logout API call failed:', e)
      }
    }

    try {
      clearAuthStorage()
    } catch (error) {
      console.warn('sessionStorage not available during logout', error)
    }
    setUser(null)

    if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login') {
      router.replace('/auth/login')
    }
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
