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
    const raw = sessionStorage.getItem('userData')
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
  const [warningMessage, setWarningMessage] = useState('')
  const [warningExpiresAt, setWarningExpiresAt] = useState<string | undefined>(undefined)
  const [dismissedWarning, setDismissedWarning] = useState(false)

  const isPublicRoute = useMemo(
    () =>
      pathname.startsWith('/auth/login') ||
      pathname.startsWith('/setup') ||
      pathname.startsWith('/get-started') ||
      pathname.startsWith('/users/register') ||
      pathname.startsWith('/employees/register') ||
      pathname.startsWith('/subscription'),
    [pathname]
  )

  const isSubscriptionPage = pathname.startsWith('/subscription')

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
      // clear any expiring-soon warning if user is already blocked
      setWarningMessage('')
      setWarningExpiresAt(undefined)
    } else {
      setBlockedMessage('')
      setBlockedExpiresAt(undefined)

      // Show expiring-soon warning if subscription expires within next X days
      const EXPIRING_SOON_DAYS = 7
      const now = Date.now()
      if (expiresAt) {
        const ts = Date.parse(expiresAt)
        if (!Number.isNaN(ts)) {
          const daysLeft = (ts - now) / (1000 * 60 * 60 * 24)
          if (daysLeft > 0 && daysLeft <= EXPIRING_SOON_DAYS) {
            setWarningMessage(`Your subscription will expire in ${Math.ceil(daysLeft)} day${Math.ceil(daysLeft) > 1 ? 's' : ''}. Please renew soon.`)
            setWarningExpiresAt(expiresAt)
          } else {
            setWarningMessage('')
            setWarningExpiresAt(undefined)
          }
        }
      }
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
  const showWarning = !isLoading && isAuthenticated && !isPublicRoute && !!warningMessage && !blockedMessage && !dismissedWarning

  if (!show && !showWarning) return null
   if(show){
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

  // Non-blocking expiring-soon warning popup
  if (showWarning) {
    return (
      <div className="fixed bottom-6 right-6 z-[3000] w-full max-w-sm rounded-xl bg-yellow-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-amber-100 dark:bg-amber-900/40 p-2">
            <CalendarClock className="h-5 w-5 text-amber-700 dark:text-amber-300" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Subscription Expiring Soon</h3>
            <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">{warningMessage}</p>
            {warningExpiresAt && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-md bg-amber-100 dark:bg-amber-900/10 px-3 py-1 text-xs text-amber-700 dark:text-amber-300">
                <CalendarClock className="h-4 w-4" />
                Expires at: {new Date(warningExpiresAt).toLocaleString()}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.push('/settings')}
              className="rounded-md bg-yellow-500 px-3 py-1 text-xs font-medium text-gray-900 hover:bg-yellow-600"
            >
              Renew
            </button>
            <button
              onClick={() => setDismissedWarning(true)}
              className="rounded-md px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    )
  }
}
