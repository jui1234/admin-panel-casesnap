'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

export default function NotFound() {
  const pathname = usePathname()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${
        isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-white to-yellow-50'
      }`}
    >
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto mb-6 w-28 h-28 relative">
          <div className={`absolute inset-0 rounded-3xl blur-xl animate-pulse ${isDark ? 'bg-yellow-500/15' : 'bg-yellow-500/20'}`} />
          <div
            className={`absolute inset-0 rounded-3xl border backdrop-blur flex items-center justify-center ${
              isDark
                ? 'border-yellow-500/25 bg-gray-800/70'
                : 'border-yellow-500/30 bg-white/70'
            }`}
          >
            <div className="relative">
              <div className={`text-5xl font-extrabold tracking-tight animate-[float_2.4s_ease-in-out_infinite] ${isDark ? 'text-white' : 'text-gray-900'}`}>
                404
              </div>
              <div className="absolute -right-7 -top-2 w-7 h-7 rounded-full border-4 border-yellow-500 animate-[pop_1.6s_ease-in-out_infinite]" />
              <div className="absolute -right-3 top-6 w-7 h-1.5 bg-yellow-500 rounded-full rotate-45 origin-left animate-[pop_1.6s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>

        <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Page not found
        </h1>
        <p className={`mt-2 text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          We couldn’t find <span className="font-semibold">{pathname || 'this page'}</span>. It may have been moved,
          renamed, or no longer exists.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className={`inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
              isDark
                ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            Go to Home
          </Link>
        
        </div>

        <style jsx>{`
          @keyframes float {
            0% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-6px);
            }
            100% {
              transform: translateY(0px);
            }
          }
          @keyframes pop {
            0%,
            100% {
              transform: scale(1);
              opacity: 0.9;
            }
            50% {
              transform: scale(1.08);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </div>
  )
}

