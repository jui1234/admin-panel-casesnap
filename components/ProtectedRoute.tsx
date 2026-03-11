'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import CaseSnapLoader from '@/components/CaseSnapLoader'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    // Only redirect after we've finished loading and confirmed user is not authenticated
    if (!isLoading) {
      setHasChecked(true)
      if (!isAuthenticated) {
        // Don't redirect if already on login page
        if (pathname !== '/auth/login') {
          // Use replace instead of push to prevent back button navigation
          router.replace('/auth/login')
        }
      }
    }
  }, [isAuthenticated, isLoading, router, pathname])

  // Show loading state while checking authentication
  if (isLoading || !hasChecked) {
    return <CaseSnapLoader fullscreen={false} message="Loading CaseSnap..." />
  }

  // Don't render children if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
