'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login page
    router.push('/auth/login')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-tile-50 via-white to-primary-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-tile-600">Redirecting to login...</p>
      </div>
    </div>
  )
} 