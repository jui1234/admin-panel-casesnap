import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithSubscriptionGuard } from './baseQuery'

export interface SubscriptionPlan {
  _id: string
  planName: string
  billingCycle: string
  currency: string
  price: number
  displayName: string
  description?: string
  features?: string[]
  isActive?: boolean
  isCurrentPlan?: boolean
}

export interface OrganizationSubscription {
  organizationId: string
  planName: string
  status?: string
  expiresAt?: string
  startedAt?: string
}

export interface AssignSubscriptionRequest {
  organizationId: string
  planName: string
  status: 'active'
}

export interface AssignSubscriptionResponse {
  success: boolean
  message?: string
  data?: OrganizationSubscription
}

export const subscriptionApi = createApi({
  reducerPath: 'subscriptionApi',
  baseQuery: baseQueryWithSubscriptionGuard,
  tagTypes: ['SubscriptionPlan', 'OrgSubscription'],
  endpoints: (builder) => ({
    getSubscriptionPlans: builder.query<SubscriptionPlan[], void>({
      query: () => 'api/subscriptions/plans',
      transformResponse: (response: { success: boolean; count: number; data?: SubscriptionPlan[] } | SubscriptionPlan[]) =>
        Array.isArray(response) ? response : response.data || [],
      providesTags: ['SubscriptionPlan'],
    }),

    getOrganizationSubscription: builder.query<OrganizationSubscription, string>({
      query: (organizationId) => `api/subscriptions/org/${encodeURIComponent(organizationId)}`,
      providesTags: (result, error, organizationId) =>
        result ? [{ type: 'OrgSubscription' as const, id: organizationId }] : [],
    }),

    assignSubscriptionPlan: builder.mutation<AssignSubscriptionResponse, AssignSubscriptionRequest>({
      query: ({ organizationId, planName, status }) => ({
        url: `api/subscriptions/organizations/${encodeURIComponent(organizationId)}/assign`,
        method: 'PUT',
        body: { planName, status },
      }),
      invalidatesTags: (result, error, { organizationId }) =>
        [
          { type: 'OrgSubscription' as const, id: organizationId },
          'SubscriptionPlan',
        ],
    }),
  }),
})

export const {
  useGetSubscriptionPlansQuery,
  useGetOrganizationSubscriptionQuery,
  useAssignSubscriptionPlanMutation,
} = subscriptionApi
