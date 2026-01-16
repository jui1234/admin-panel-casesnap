'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface SetupGuardProps {
  children: React.ReactNode
}

export default function SetupGuard({ children }: SetupGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      const organizationData = localStorage.getItem('organizationData')
      
      // Define public paths that don't require authentication
      const publicPaths = [ 
        '/', // Home page
        '/employees/register', // Employee registration
        '/users/register', // User registration (invitation-based)
        '/auth/login', // Login page
        '/get-started', // Get started page
        '/setup', // Setup page
        '/blog' // Blog pages
      ]
      
      // Define protected paths that require authentication
      const protectedPaths = [
        '/dashboard',
        '/users',
        '/clients', 
        '/employees',
        '/permissions',
        '/reports',
        '/analytics',
        '/settings'
      ]
      
      const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
      const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
      
      // Special handling for registration pages - always allow access (they use invitation tokens)
      if (pathname.startsWith('/employees/register') || pathname.startsWith('/users/register')) {
        return // Allow access to registration pages without any redirects
      }
      
      // Only redirect if user is not authenticated and trying to access a protected path
      if (!isAuthenticated && isProtectedPath) {
        router.push('/get-started')
        return
      }
    }
  }, [isAuthenticated, isLoading, router, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
