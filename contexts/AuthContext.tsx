'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { APP_BACKEND_URL } from '@/config/env'

const MODULES_CACHE_KEY_PREFIX = 'sidebarModulesCache:'

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
        const token = localStorage.getItem('authToken') || localStorage.getItem('token')
        const userData = localStorage.getItem('userData')
        
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
              localStorage.removeItem('authToken')
              localStorage.removeItem('token')
              localStorage.removeItem('userData')
              localStorage.removeItem('organizationData')
              setUser(null)
            }
          } catch (error) {
            // Invalid user data, clear it
            console.error('Error parsing user data:', error)
            localStorage.removeItem('authToken')
            localStorage.removeItem('token')
            localStorage.removeItem('userData')
            localStorage.removeItem('organizationData')
            setUser(null)
          }
        } else {
          // No valid auth data found
          setUser(null)
        }
      } catch (error) {
        // localStorage not available (SSR or disabled)
        console.log('localStorage not available:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    // Run immediately - don't delay as it causes redirect issues
    checkAuth()
  }, [])

  const clearSidebarModulesCache = () => {
    try {
      for (let index = localStorage.length - 1; index >= 0; index--) {
        const key = localStorage.key(index)
        if (key?.startsWith(MODULES_CACHE_KEY_PREFIX)) {
          localStorage.removeItem(key)
        }
      }
    } catch (error) {
      console.warn('Failed to clear sidebar modules cache', error)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check if we already have real API data in localStorage
      try {
        const authToken = localStorage.getItem('authToken')
        const userData = localStorage.getItem('userData')
        
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

  const logout = async () => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('authToken') || localStorage.getItem('token')
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
      localStorage.removeItem('authToken')
      localStorage.removeItem('token')
      localStorage.removeItem('userData')
      localStorage.removeItem('organizationData')
      localStorage.removeItem('user')
      localStorage.removeItem('organization')
      localStorage.removeItem('role')
      localStorage.removeItem('permissions')
      clearSidebarModulesCache()
    } catch (error) {
      console.warn('localStorage not available during logout', error)
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
