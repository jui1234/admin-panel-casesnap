'use client'

import { useRouter } from 'next/navigation'
import { Shield, ArrowLeft, Home } from 'lucide-react'
import { Button, Box, Typography } from '@mui/material'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/ThemeToggle'

export default function AccessDeniedPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-white to-yellow-50'} flex items-center justify-center p-4`}>
      {/* Theme Toggle */}
      <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className={`p-4 rounded-full ${isDark ? 'bg-red-900/20' : 'bg-red-100'}`}>
            <Shield className="h-16 w-16 text-red-500" />
          </div>
        </div>

        {/* Error Code */}
        <div>
          <Typography variant="h1" className={`text-6xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            403
          </Typography>
          <Typography variant="h4" className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Access Denied
          </Typography>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Typography variant="body1" className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            You do not have permission to access this resource.
          </Typography>
          <Typography variant="body2" className={isDark ? 'text-gray-500' : 'text-gray-500'}>
            Please contact your administrator if you believe this is an error.
          </Typography>
        </div>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={18} />}
            onClick={() => router.back()}
            sx={{
              borderColor: isDark ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
              color: isDark ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
              '&:hover': {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
              }
            }}
          >
            Go Back
          </Button>
          <Button
            variant="contained"
            startIcon={<Home size={18} />}
            onClick={() => router.push('/dashboard')}
            sx={{
              bgcolor: '#f59e0b',
              color: '#1f2937',
              '&:hover': {
                bgcolor: '#d97706',
              }
            }}
          >
            Go to Dashboard
          </Button>
        </Box>
      </div>
    </div>
  )
}
