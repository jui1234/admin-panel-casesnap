'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface SetupGuardProps {
  children: React.ReactNode
}

const protectedPaths = [
  '/dashboard',
  '/users',
  '/roles',
  '/clients',
  '/employees',
  '/permissions',
  '/reports',
  '/analytics',
  '/settings',
]

function isProtectedPath(pathname: string) {
  return protectedPaths.some(path => pathname.startsWith(path))
}

function isRegistrationPath(pathname: string) {
  return pathname.startsWith('/employees/register') || pathname.startsWith('/users/register')
}

export default function SetupGuard({ children }: SetupGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setHasChecked(true)
      if (isRegistrationPath(pathname)) return

      const isProtected = isProtectedPath(pathname)
      const noToken =
        typeof window !== 'undefined' &&
        !localStorage.getItem('authToken') &&
        !localStorage.getItem('token')

      if (isProtected && (noToken || !isAuthenticated)) {
        router.replace('/auth/login')
      }
    }
  }, [isAuthenticated, isLoading, router, pathname])

  const isProtected = isProtectedPath(pathname)
  const mustRedirect = isProtected && (!isLoading && !isAuthenticated)
  const showBlock = isLoading || !hasChecked || (isProtected && !isAuthenticated)

  if (showBlock) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {mustRedirect ? 'Redirecting to login...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
