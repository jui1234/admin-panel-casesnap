'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import CaseSnapLoader from '@/components/CaseSnapLoader'

interface SetupGuardProps {
  children: React.ReactNode
}

/** Marketing, auth, onboarding, and registration — no session required. */
function isPublicPath(pathname: string | null) {
  if (!pathname) return true
  if (pathname === '/') return true
  const prefixes = [
    '/auth/',
    '/setup',
    '/get-started',
    '/reset-password',
    '/403',
    '/blog',
    '/employees/register',
    '/users/register',
  ]
  return prefixes.some((p) => pathname.startsWith(p))
}

function hasAuthToken() {
  if (typeof window === 'undefined') return false
  const t = localStorage.getItem('authToken') || localStorage.getItem('token')
  return !!t && t.length > 0
}

export default function SetupGuard({ children }: SetupGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [hasChecked, setHasChecked] = useState(false)

  const needsAuth = !isPublicPath(pathname)

  useEffect(() => {
    if (isLoading) return

    setHasChecked(true)

    if (!needsAuth) return

    const tokenOk = hasAuthToken()
    if (!tokenOk || !isAuthenticated) {
      router.replace('/auth/login')
    }
  }, [isAuthenticated, isLoading, router, pathname, needsAuth])

  if (!needsAuth) {
    return <>{children}</>
  }

  const noSession = !hasAuthToken() || !isAuthenticated
  const mustRedirect = !isLoading && hasChecked && noSession
  const showBlock = isLoading || !hasChecked || noSession

  if (showBlock) {
    return (
      <CaseSnapLoader
        fullscreen={false}
        message={mustRedirect ? 'Redirecting to login...' : 'Loading CaseSnap...'}
      />
    )
  }

  return <>{children}</>
}
