'use client'

import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  Check,
  Crown,
  CalendarClock,
  ArrowUp,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import {
  useGetOrganizationSubscriptionQuery,
  useGetSubscriptionPlansQuery,
  useAssignSubscriptionPlanMutation,
} from '@/redux/api/subscriptionApi'

export default function SubscriptionPage() {
  const { user, isAuthenticated, isLoading } = useAuth()

  const isSuperAdmin = useMemo(() => {
    if (!user) return false
    const roleName = typeof user.role === 'string' ? user.role : user.role?.name
    return roleName === 'super-admin' || roleName === 'SUPER_ADMIN'
  }, [user])

  const router = useRouter()

  const [assignError, setAssignError] = useState('')
  const [canManageTemp, setCanManageTemp] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  const orgId =
    user?.organizationId ||
    (user as any)?.organization?._id ||
    undefined

  const {
    data: apiPlansData,
    isLoading: plansLoading,
    isError: plansError,
  } = useGetSubscriptionPlansQuery(undefined)

  const {
    data: orgSubscriptionData,
    isLoading: orgSubscriptionLoading,
  } = useGetOrganizationSubscriptionQuery(orgId ?? '', {
    skip: !orgId,
  })

  const [assignSubscriptionPlan, { isLoading: assignLoading }] =
    useAssignSubscriptionPlanMutation()

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      setCanManageTemp(sessionStorage.getItem('canManageSubscriptionTemp') === '1')
    } catch {
      setCanManageTemp(false)
    }
  }, [])

  const allowedToView = canManageTemp || isSuperAdmin || (!!user && !!(user as any).canManageSubscription)

  const accessMessage = !allowedToView
    ? !isAuthenticated
      ? 'Please sign in to continue.'
      : 'Subscription management is not available for your account.'
    : undefined

  const userName = user?.name || user?.email || 'Subscription user'
  const userRole = typeof user?.role === 'string' ? user.role : user?.role?.name || 'Unknown role'
  const displayUserInfo = !!user

  // Redirect to 403 for authenticated users who are not allowed
  // Allow unauthenticated users who have canManageTemp (they can view renewal flow)
  useEffect(() => {
    if (isAuthenticated && !allowedToView) {
      setRedirecting(true)
      router.replace('/403')
    }
  }, [isAuthenticated, allowedToView, router])

  const subscription = useMemo(() => {
    const status =
      orgSubscriptionData?.status || user?.subscriptionStatus || 'expired'
    const plan =
      orgSubscriptionData?.planName || user?.subscriptionPlan || 'free'
    const expiresAt =
      orgSubscriptionData?.expiresAt || user?.subscriptionExpiresAt

    return {
      status,
      plan,
      expiresAt,
    }
  }, [orgSubscriptionData, user])

  const plans = apiPlansData?.length
    ? apiPlansData.map((plan) => ({
        id: plan.planName,
        billingCycle: plan.billingCycle,
        name: plan.displayName || plan.planName,
        price:
          plan.price === 0
            ? 'Free'
            : `${plan.currency === 'INR' ? '₹' : plan.currency} ${plan.price}/${plan.billingCycle}`,
        features: plan.features || [],
        recommended: plan.planName === 'professional_monthly',
      }))
    : []

  const getPlanName = (plan?: string) => {
    switch (plan) {
      case 'free':
        return 'Free'
      case 'base':
      case 'basic_monthly':
        return 'Basic'
      case 'popular':
      case 'professional_monthly':
        return 'Professional'
      default:
        return plan ? plan.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Free Trial'
    }
  }

  const isExpired =
    subscription.status === 'expired' ||
    subscription.status === 'inactive' ||
    subscription.status === 'cancelled'

  const calculateExpirationDate = (planName: string, billingCycle?: string) => {
    const expiration = new Date()
    const cycle = billingCycle?.toLowerCase() || ''

    if (planName === 'free') {
      expiration.setDate(expiration.getDate() + 14)
    } else if (cycle.includes('year') || cycle.includes('annual')) {
      expiration.setFullYear(expiration.getFullYear() + 1)
    } else {
      expiration.setMonth(expiration.getMonth() + 1)
    }

    return expiration.toISOString()
  }

  const handleChoosePlan = async (planName: string, billingCycle?: string) => {
    setAssignError('')

    if (!orgId) {
      toast.error('Organization ID not available')
      return
    }

    try {
      const response = await assignSubscriptionPlan({
        organizationId: orgId,
        planName,
        expiresAt: calculateExpirationDate(billingCycle),
        status: 'active',
      }).unwrap()

      toast.success(response.message || 'Subscription plan assigned successfully')
    } catch (error: any) {
      const message =
        error?.data?.message || error?.message || 'Failed to assign subscription plan'
      setAssignError(message)
      toast.error(message)
    }
  }

  return (
    <>
      <Head>
        <title>Subscription Management | CaseSnap</title>
      </Head>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Subscription Management
          </h1>

          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your plan, billing, and subscription details.
          </p>

          {/* {(displayUserInfo || canManageTemp) && (
            <div className="mt-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {displayUserInfo ? 'Signed in as' : 'Subscription access token detected'}
              </p>
              <div className="mt-3 flex flex-col gap-1">
                <span className="font-semibold text-gray-900 dark:text-white">{userName}</span>
                {displayUserInfo && (
                  <>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{user?.email}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Role: {userRole}</span>
                  </>
                )}
                {!displayUserInfo && (
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Valid token received from backend. User details will be recovered automatically.
                  </span>
                )}
              </div>
            </div>
          )} */}
        </div>

        {accessMessage ? (
          <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-5">
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
                <div>
                  <h2 className="font-semibold text-red-700 dark:text-red-300">
                    Access Restricted
                  </h2>
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {accessMessage}
                  </p>
                </div>
              </div>

              {!isAuthenticated && (
                <a
                  href="/auth/login"
                  className="inline-flex items-center justify-center rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-yellow-600 transition-colors"
                >
                  Sign in to continue
                </a>
              )}
            </div>
          </div>
        ) : isExpired ? (
          <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-5">
            <div className="flex gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
              <div>
                <h2 className="font-semibold text-red-700 dark:text-red-300">
                  Subscription Expired
                </h2>
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  Your subscription is no longer active. Renew or upgrade your
                  plan to continue using CaseSnap.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Current Subscription */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Crown className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Current Subscription
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div>
              <p className="text-sm text-gray-500">Current Plan</p>

              <p className="font-semibold text-lg text-gray-900 dark:text-white">
                {getPlanName(subscription.plan)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Status</p>

              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  isExpired
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {subscription.status}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-500">Expiry Date</p>

              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-gray-400" />

                <p className="font-medium text-gray-900 dark:text-white">
                  {subscription.expiresAt
                    ? new Date(subscription.expiresAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Plans */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Available Plans
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-xl border p-6 shadow-sm ${
                  plan.recommended
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-yellow-500 text-black text-xs px-3 py-1 rounded-full font-semibold">
                      Recommended
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>

                <p className="text-3xl font-bold mt-3 text-gray-900 dark:text-white">
                  {plan.price}
                </p>

                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleChoosePlan(plan.id, plan.billingCycle)}
                  className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-gray-900 py-3 font-medium transition-colors"
                >
                  <ArrowUp className="h-4 w-4" />
                  {isExpired ? 'Renew Subscription' : 'Choose Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}