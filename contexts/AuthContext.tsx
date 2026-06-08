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

  useEffect(() => {
    // Check for existing auth token on mount
    const checkAuth = () => {
      try {
        const token = sessionStorage.getItem('authToken') || sessionStorage.getItem('token')
        const userData = sessionStorage.getItem('userData')
        
        // Only require token and userData - organizationData is optional
        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData)
            
            // Validate token format (basic check)
            // In production, you might want to decode and check expiration
            if (token && token.length > 0) {
              setUser(parsedUser)
            } else {
              // Invalid token, clear everything
              sessionStorage.removeItem('authToken')
              sessionStorage.removeItem('token')
              sessionStorage.removeItem('userData')
              sessionStorage.removeItem('organizationData')
              setUser(null)
            }
          } catch (error) {
            // Invalid user data, clear it
            console.error('Error parsing user data:', error)
            sessionStorage.removeItem('authToken')
            sessionStorage.removeItem('token')
            sessionStorage.removeItem('userData')
            sessionStorage.removeItem('organizationData')
            setUser(null)
          }
        } else {
          // No valid auth data found
          setUser(null)
        }
      } catch (error) {
        // sessionStorage not available (SSR or disabled)
        console.log('sessionStorage not available:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    // Run immediately - don't delay as it causes redirect issues
    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check if we already have real API data in sessionStorage
      try {
        const authToken = sessionStorage.getItem('authToken')
        const userData = sessionStorage.getItem('userData')
        
        if (authToken && userData) {
          // We have real API data, use it
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          return true
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error)
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
        // sessionStorage not available
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

      // Store auth data
      try {
        sessionStorage.setItem('authToken', 'mock-jwt-token')
        sessionStorage.setItem('userData', JSON.stringify(mockUser))
      } catch (error) {
        // sessionStorage not available, continue without storing
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
