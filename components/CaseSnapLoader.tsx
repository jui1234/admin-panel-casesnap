'use client'

import { Shield } from 'lucide-react'

interface CaseSnapLoaderProps {
  message?: string
  fullscreen?: boolean
}

export default function CaseSnapLoader({
  message = 'Loading CaseSnap...',
  fullscreen = true,
}: CaseSnapLoaderProps) {
  const wrapperClass = fullscreen
    ? 'fixed inset-0 z-[100] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm'
    : 'min-h-screen bg-gray-50 dark:bg-gray-900'

  return (
    <div className={`${wrapperClass} flex items-center justify-center`}>
      <div className="text-center">
        <div className="mx-auto h-14 w-14 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-yellow-500 dark:to-yellow-600 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-7 w-7 text-yellow-400 dark:text-gray-900 animate-pulse" />
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-3" />
        <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
      </div>
    </div>
  )
}
