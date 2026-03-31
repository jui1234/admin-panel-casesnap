'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import CaseSnapLoader from '@/components/CaseSnapLoader'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    // Only mark as checked after auth loading completes.
    // Redirecting is handled globally by `SetupGuard` in `app/layout.tsx` to avoid redirect loops
    // (e.g., route -> /auth/login -> immediately back to /dashboard).
    if (!isLoading) {
      setHasChecked(true)
    }
  }, [isLoading])

  // Show loading state while checking authentication
  if (isLoading || !hasChecked) {
    return <CaseSnapLoader fullscreen={false} message="Loading CaseSnap..." />
  }

  // Don't render children if not authenticated (SetupGuard will redirect)
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
