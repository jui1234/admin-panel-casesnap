'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Lock, Mail, Shield, ArrowRight, Building2, ArrowLeft, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import ThemeToggle from '@/components/ThemeToggle'
import { useLoginMutation } from '@/redux/api/authApi'
import { onboardingApi } from '@/redux/api/onboardingApi'
import { store } from '@/redux/store'
import toast from 'react-hot-toast'

const APP_BACKEND_URL =
  process.env.NEXT_PUBLIC_APP_BACKEND_URL || 'https://casesnapbackend.onrender.com/'

interface SidebarModule {
  _id: string
  name: string
  displayName: string
  description: string
}

interface SidebarModulesResponse {
  data: SidebarModule[]
}

const MODULES_CACHE_KEY_PREFIX = 'sidebarModulesCache'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [organizationData, setOrganizationData] = useState<any>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const isDark = theme === 'dark'
  
  // RTK Query mutation
  const [loginMutation, { isLoading, error: loginError }] = useLoginMutation()

  const warmSidebarModulesCache = async (cacheScope: string) => {
    try {
      const backendUrl = APP_BACKEND_URL.replace(/\/$/, '')
      const response = await fetch(`${backendUrl}/api/modules`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) return

      const modulesResponse: SidebarModulesResponse = await response.json()
      const modulesData = Array.isArray(modulesResponse?.data) ? modulesResponse.data : []
      const cacheKey = `${MODULES_CACHE_KEY_PREFIX}:${cacheScope}`
      localStorage.setItem(cacheKey, JSON.stringify({
        data: modulesData,
        cachedAt: Date.now(),
      }))
    } catch (error) {
      console.warn('Failed to warm sidebar modules cache:', error)
    }
  }

  // Redirect to cases if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/cases')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    // Check if organization data exists
    try {
      const orgData = localStorage.getItem('organizationData')
      if (orgData) {
        try {
          setOrganizationData(JSON.parse(orgData))
        } catch (error) {
          console.error('Error parsing organization data:', error)
        }
      }
    } catch (error) {
      // localStorage not available
      console.log('localStorage not available')
    }

    // Check for URL parameters to pre-fill email
    const emailParam = searchParams.get('email')
    const messageParam = searchParams.get('message')
    
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
      
      // Show appropriate message based on the redirect reason
      if (messageParam === 'email_already_registered') {
        toast.success('Email pre-filled. Please enter your password to sign in.')
        setError('This email is already registered. Please sign in with your password.')
      } else if (messageParam === 'account_active') {
        toast.success('Your account is active! Please sign in with your credentials.')
        setError('Your account is active. Please sign in with your password.')
      } else if (messageParam === 'registration_completed_pending') {
        toast.success('Registration completed! Your status is pending.')
        setError('Your registration has been completed. Your status is pending.')
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const result = await loginMutation({ email, password }).unwrap()

      if (result.success) {
        // Save token + organization in localStorage with correct keys for AuthContext
        localStorage.setItem('authToken', result.token)
        localStorage.setItem('token', result.token) // Keep both for compatibility
        
        // Store user data in the format expected by AuthContext
        // Construct name from firstName and lastName if name is not available
        const userName = result.user.name || 
          (result.user.firstName && result.user.lastName 
            ? `${result.user.firstName} ${result.user.lastName}`.trim()
            : result.user.firstName || result.user.lastName || result.user.email.split('@')[0])
        
        const userData = {
          id: result.user.id,
          email: result.user.email,
          name: userName,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role, // Can be string or Role object
          subscriptionPlan: result.user.subscriptionPlan, // Store subscription plan
          subscriptionStatus: result.user.subscriptionStatus,
          subscriptionExpiresAt: result.user.subscriptionExpiresAt,
          assigneePermissions: result.user.assigneePermissions ?? undefined, // Store from login; used for Assigned To (client/cases)
          organizationId: result.user.organizationId || result.user.organization?._id,
          organizationName: result.user.organization?.companyName
        }
        localStorage.setItem('userData', JSON.stringify(userData))
        const cacheScope = userData.organizationId || userData.id || 'default'
        void warmSidebarModulesCache(cacheScope)
        
        // Store organization data
        if (result.user?.organization) {
          localStorage.setItem('organizationData', JSON.stringify(result.user.organization))
          setOrganizationData(result.user.organization)
        }
        
        toast.success('Login successful!')

        store.dispatch(onboardingApi.endpoints.getOnboardingStatus.initiate(undefined, { forceRefetch: true }))

        // Set redirecting state
        setIsRedirecting(true)

        // Use AuthContext login to update the state properly
        const loginSuccess = await login(email, password)

        router.replace('/cases')
      }
    } catch (err: any) {
      const rawErrorMessage = err?.data?.error || err?.data?.message || err?.message || 'Login failed. Please try again.'
      let errorMessage = rawErrorMessage
      
      // Format pending approval messages to remove "admin" reference
      if (errorMessage.toLowerCase().includes('pending approval') || errorMessage.toLowerCase().includes('admin approval')) {
        errorMessage = 'Your status is pending. Please wait before logging in.'
      }

      if (err?.status === 403) {
        const lower = rawErrorMessage.toLowerCase()
        if (lower.includes('expired') || lower.includes('inactive') || lower.includes('cancelled') || lower.includes('plan') || lower.includes('subscription')) {
          errorMessage = rawErrorMessage
        }
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
      setIsRedirecting(false)
    }
  }

  // Don't render login form if already authenticated (will redirect)
  if (authLoading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-white to-yellow-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null // Will redirect to dashboard
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-white to-yellow-50'} flex items-center justify-center p-4 relative`}>
      {/* Loading Overlay */}
      {(isLoading || isRedirecting) && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {isLoading ? 'Signing in...' : 'Redirecting...'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Back Button */}
      <div className="fixed top-4 left-4 z-10">
        <button
          onClick={() => router.push('/get-started')}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-yellow-500 dark:to-yellow-600 rounded-full flex items-center justify-center mb-6">
            <Shield className="h-8 w-8 text-yellow-400 dark:text-gray-900" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Sign in to your admin account
          </p>
          
          {/* Pre-filled email notification */}
          {searchParams.get('email') && searchParams.get('message') === 'email_already_registered' && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-800 dark:text-blue-200">
                  Email pre-filled from setup
                </span>
              </div>
            </div>
          )}

          {/* Account active notification */}
          {searchParams.get('email') && searchParams.get('message') === 'account_active' && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-800 dark:text-green-200">
                  Your account is active! Please sign in with your credentials.
                </span>
              </div>
            </div>
          )}
          
          {/* Organization Info */}
          {organizationData && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {organizationData.companyName}
                </span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-300">
                {organizationData.industry} • {organizationData.city}, {organizationData.province}
              </p>
            </div>
          )}
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => router.push('/auth/forgot-password')}
                  className="font-medium text-yellow-600 hover:text-yellow-500 transition-colors duration-200"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isRedirecting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-gray-900 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading || isRedirecting ? (
                <div className="flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  {isLoading ? 'Signing in...' : 'Redirecting...'}
                </div>
              ) : (
                <div className="flex items-center">
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
             
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/setup')}
              className="font-medium text-yellow-600 hover:text-yellow-500 transition-colors duration-200"
            >
              Create organization
            </button>
          </p>
          {!organizationData && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Or{' '}
              <button
                onClick={() => router.push('/get-started')}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                get started
              </button>
              {' '}with CaseSnap
            </p>
          )}
        </div>
      </div>
    </div>
  )
}