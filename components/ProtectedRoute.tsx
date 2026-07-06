'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ContentBlockSkeleton, StatTilesSkeleton, TableSkeleton, CardGridSkeleton } from '@/components/Skeletons'

interface ProtectedRouteProps {
  children: React.ReactNode
  variant?: 'stats' | 'table' | 'cards'
}

function LoadingSkeleton({ variant }: { variant?: ProtectedRouteProps['variant'] }) {
  if (variant === 'stats') return <StatTilesSkeleton />
  if (variant === 'table') return <TableSkeleton />
  if (variant === 'cards') return <CardGridSkeleton />
  return <ContentBlockSkeleton />
}

export default function ProtectedRoute({ children, variant }: ProtectedRouteProps) {
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
    return <LoadingSkeleton variant={variant} />
  }

  // Don't render children if not authenticated (SetupGuard will redirect)
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
