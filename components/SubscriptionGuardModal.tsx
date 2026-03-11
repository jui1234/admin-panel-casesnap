'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AlertTriangle, CalendarClock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { SUBSCRIPTION_BLOCK_EVENT, type SubscriptionBlockPayload } from '@/redux/api/baseQuery'

type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'expired'

interface UserSubscriptionData {
  subscriptionStatus?: SubscriptionStatus
  subscriptionExpiresAt?: string
}

const getStoredUserSubscription = (): UserSubscriptionData => {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem('userData')
    if (!raw) return {}
    const parsed = JSON.parse(raw) as UserSubscriptionData
    return {
      subscriptionStatus: parsed.subscriptionStatus,
      subscriptionExpiresAt: parsed.subscriptionExpiresAt,
    }
  } catch {
    return {}
  }
}

const inferExpiredFromDate = (date?: string): boolean => {
  if (!date) return false
  const ts = Date.parse(date)
  if (Number.isNaN(ts)) return false
  return ts < Date.now()
}

const statusToMessage = (status?: SubscriptionStatus) => {
  if (status === 'expired') return 'Your subscription plan has expired. Please renew to continue using CaseSnap.'
  if (status === 'inactive') return 'Your subscription is inactive. Please activate your plan to continue.'
  if (status === 'cancelled') return 'Your subscription is cancelled. Please update your plan to continue.'
  return 'Your subscription is not active. Please update your plan to continue.'
}

export default function SubscriptionGuardModal() {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [blockedMessage, setBlockedMessage] = useState('')
  const [blockedExpiresAt, setBlockedExpiresAt] = useState<string | undefined>(undefined)

  const isPublicRoute = useMemo(
    () =>
      pathname.startsWith('/auth/login') ||
      pathname.startsWith('/setup') ||
      pathname.startsWith('/get-started') ||
      pathname.startsWith('/users/register') ||
      pathname.startsWith('/employees/register'),
    [pathname]
  )

  useEffect(() => {
    if (!isAuthenticated || isPublicRoute) {
      setBlockedMessage('')
      setBlockedExpiresAt(undefined)
      return
    }

    const fromUser = {
      subscriptionStatus: user?.subscriptionStatus as SubscriptionStatus | undefined,
      subscriptionExpiresAt: user?.subscriptionExpiresAt,
    }
    const fromStorage = getStoredUserSubscription()
    const status = fromUser.subscriptionStatus || fromStorage.subscriptionStatus
    const expiresAt = fromUser.subscriptionExpiresAt || fromStorage.subscriptionExpiresAt

    const isBlockedByStatus = status === 'inactive' || status === 'cancelled' || status === 'expired'
    const isBlockedByDate = inferExpiredFromDate(expiresAt)

    if (isBlockedByStatus || isBlockedByDate) {
      setBlockedMessage(isBlockedByDate ? statusToMessage('expired') : statusToMessage(status))
      setBlockedExpiresAt(expiresAt)
    } else {
      setBlockedMessage('')
      setBlockedExpiresAt(undefined)
    }
  }, [isAuthenticated, isPublicRoute, pathname, user?.subscriptionStatus, user?.subscriptionExpiresAt])

  useEffect(() => {
    const onBlocked = (event: Event) => {
      const customEvent = event as CustomEvent<SubscriptionBlockPayload>
      const detail = customEvent.detail
      setBlockedMessage(detail?.message || 'Your plan is inactive or expired. Please update subscription.')
      setBlockedExpiresAt(detail?.subscriptionExpiresAt)
    }

    window.addEventListener(SUBSCRIPTION_BLOCK_EVENT, onBlocked as EventListener)
    return () => window.removeEventListener(SUBSCRIPTION_BLOCK_EVENT, onBlocked as EventListener)
  }, [])

  const show = !isLoading && isAuthenticated && !isPublicRoute && !!blockedMessage
  if (!show) return null

  return (
    <div className="fixed inset-0 z-[3000] bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900 shadow-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-red-100 dark:bg-red-900/40 p-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Subscription Required</h2>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{blockedMessage}</p>
            {blockedExpiresAt && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                <CalendarClock className="h-4 w-4" />
                Expires at: {new Date(blockedExpiresAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => router.push('/settings')}
            className="w-full rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-yellow-600 transition-colors"
          >
            Go to Subscription
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
