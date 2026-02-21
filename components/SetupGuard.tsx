'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import CaseSnapLoader from '@/components/CaseSnapLoader'

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

  const isRegistration = isRegistrationPath(pathname)
  const isProtected = isProtectedPath(pathname) && !isRegistration
  const mustRedirect = isProtected && (!isLoading && !isAuthenticated)
  const showBlock = isProtected && (isLoading || !hasChecked || !isAuthenticated)

  if (showBlock) {
    return <CaseSnapLoader fullscreen={false} message={mustRedirect ? 'Redirecting to login...' : 'Loading CaseSnap...'} />
  }

  return <>{children}</>
}
