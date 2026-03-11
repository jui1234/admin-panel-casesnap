import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query'
import { APP_BACKEND_URL } from '@/config/env'

export const SUBSCRIPTION_BLOCK_EVENT = 'casesnap:subscription-blocked'

export interface SubscriptionBlockPayload {
  message: string
  subscriptionStatus?: 'active' | 'inactive' | 'cancelled' | 'expired'
  subscriptionExpiresAt?: string
}

const baseQuery = fetchBaseQuery({
  baseUrl: APP_BACKEND_URL,
  prepareHeaders: (headers, { endpoint }) => {
    const publicEndpoints = new Set(['completeUserRegistration', 'getUserByToken'])
    if (typeof window !== 'undefined' && !publicEndpoints.has(endpoint)) {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
    }
    headers.set('Content-Type', 'application/json')
    headers.set('Accept', 'application/json')
    return headers
  },
})

const SUBSCRIPTION_TERMS = [
  'subscription',
  'expired',
  'inactive',
  'cancelled',
  'canceled',
] as const

const looksLikeSubscriptionMessage = (message: string): boolean => {
  const lower = message.toLowerCase()
  return SUBSCRIPTION_TERMS.some((term) => lower.includes(term))
}

const getErrorMessage = (errorData: unknown): string => {
  if (!errorData) return ''
  if (typeof errorData === 'string') return errorData
  if (typeof errorData === 'object') {
    const maybe = errorData as { error?: string; message?: string }
    if (typeof maybe.error === 'string') return maybe.error
    if (typeof maybe.message === 'string') return maybe.message
  }
  return ''
}

const emitSubscriptionBlock = (payload: SubscriptionBlockPayload) => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<SubscriptionBlockPayload>(SUBSCRIPTION_BLOCK_EVENT, { detail: payload }))
}

const shouldSkipForLogin = (args: string | FetchArgs): boolean => {
  const url = typeof args === 'string' ? args : args.url
  return url.includes('/api/auth/login') || url.includes('api/auth/login')
}

export const baseQueryWithSubscriptionGuard: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await baseQuery(args, api, extraOptions)

  if (shouldSkipForLogin(args)) {
    return result
  }

  if (result.error?.status === 403) {
    const message = getErrorMessage(result.error.data)
    if (looksLikeSubscriptionMessage(message)) {
      const errorData = (result.error.data || {}) as {
        subscriptionStatus?: 'active' | 'inactive' | 'cancelled' | 'expired'
        subscriptionExpiresAt?: string
      }
      emitSubscriptionBlock({
        message,
        subscriptionStatus: errorData.subscriptionStatus,
        subscriptionExpiresAt: errorData.subscriptionExpiresAt,
      })
    }
  }

  return result
}
