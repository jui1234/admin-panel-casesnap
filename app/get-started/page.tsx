'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building2, 
  LogIn, 
  ArrowRight, 
  ArrowLeft,
  Shield,
  Users,
  CheckCircle
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/ThemeToggle'

export default function GetStartedPage() {
  const [hasOrganization, setHasOrganization] = useState(false)
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    // Check if organization already exists
    try {
      const organizationData = localStorage.getItem('organizationData')
      setHasOrganization(!!organizationData)
    } catch (error) {
      // localStorage not available
      setHasOrganization(false)
    }
  }, [])

  // Auto-redirect if organization exists and user is authenticated
  useEffect(() => {
    try {
      const authToken = localStorage.getItem('authToken')
      const organizationData = localStorage.getItem('organizationData')
      
      if (authToken && organizationData) {
        // User is authenticated and organization exists, redirect to dashboard
        router.push('/dashboard')
      }
    } catch (error) {
      // localStorage not available, continue normally
    }
  }, [router])

  const handleCreateOrganization = () => {
    router.push('/setup')
  }

  const handleLogin = () => {
    router.push('/auth/login')
  }

  const handleBackToFeatures = () => {
    router.push('/')
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-white to-yellow-50'} flex items-center justify-center p-3 sm:p-4 lg:p-6`}>
      {/* Theme Toggle */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center px-2 sm:px-0">
          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-yellow-500 dark:to-yellow-600 rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 dark:text-gray-900" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 px-2">
            Get Started with CaseSnap
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-2 sm:px-0">
            Choose how you'd like to begin your legal practice management journey
          </p>
        </div>

        {/* Options */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-200 dark:border-gray-700">
          <div className="space-y-4 sm:space-y-6">
            {/* Login Option - Show first if organization exists */}
            {hasOrganization && (
              <div className="border-2 border-blue-500 dark:border-blue-400 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-blue-600 dark:hover:border-blue-300 transition-all duration-300 hover:shadow-lg group bg-blue-50/50 dark:bg-blue-900/20">
                <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <LogIn className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1 w-full text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Welcome Back! Login to Your Organization
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
                      Your organization is already set up. Sign in to access your dashboard and continue managing your legal practice.
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>Access your existing dashboard</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>Continue where you left off</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>All your data and settings</span>
                      </div>
                    </div>
                    <button
                      onClick={handleLogin}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105 hover:shadow-lg cursor-pointer text-sm sm:text-base"
                    >
                      <span>Login to Dashboard</span>
                      <LogIn className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Create Organization Option */}
            <div className={`border-2 ${hasOrganization ? 'border-gray-200 dark:border-gray-700' : 'border-yellow-500 dark:border-yellow-400'} rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-yellow-500 dark:hover:border-yellow-400 transition-all duration-300 hover:shadow-lg group ${hasOrganization ? '' : 'bg-yellow-50/50 dark:bg-yellow-900/20'}`}>
              <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
                <div className="flex-1 w-full text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Create New Organization
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
                    Set up your law firm or legal practice with CaseSnap. Create your organization profile and super admin account.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>Set up company details and profile</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>Create super admin account</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>Access to all CaseSnap features</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCreateOrganization}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105 hover:shadow-lg cursor-pointer text-sm sm:text-base"
                  >
                    <span>Create Organization</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>


            {/* Info message */}
            {!hasOrganization ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mx-auto sm:mx-0" />
                  <div className="text-center sm:text-left">
                    <h4 className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200">
                      New to CaseSnap?
                    </h4>
                    <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-300 mt-1">
                      Create your organization to get started with our legal practice management system.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 flex-shrink-0 mx-auto sm:mx-0" />
                  <div className="text-center sm:text-left">
                    <h4 className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-200">
                      Organization Found!
                    </h4>
                    <p className="text-xs sm:text-sm text-green-600 dark:text-green-300 mt-1">
                      Your organization is already set up. You can login above or create a new organization if needed.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="flex justify-center pt-4 sm:pt-6">
            <button
              onClick={handleBackToFeatures}
              className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 hover:scale-105 hover:shadow-lg cursor-pointer text-sm sm:text-base"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Back to Features</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
