import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithSubscriptionGuard } from './baseQuery'

export interface OnboardingCounts {
  roles: number
  customRoles: number
  approvedUsers: number
  clients: number
  cases: number
}

export interface OnboardingReadiness {
  hasRoles: boolean
  hasCustomRoles: boolean
  hasApprovedUsers: boolean
  hasClients: boolean
  hasCases: boolean
  suggestInviteMoreUsers: boolean
}

export type SuggestedNextStep = 'create_custom_role' | 'create_client' | 'create_case' | null

export interface OnboardingStatusData {
  organizationId: string
  counts: OnboardingCounts
  readiness: OnboardingReadiness
  suggestedNextStep: SuggestedNextStep
}

export interface OnboardingStatusResponse {
  success: boolean
  data: OnboardingStatusData
}

export const onboardingApi = createApi({
  reducerPath: 'onboardingApi',
  baseQuery: baseQueryWithSubscriptionGuard,
  tagTypes: ['OnboardingStatus'],
  endpoints: (builder) => ({
    getOnboardingStatus: builder.query<OnboardingStatusData, void>({
      query: () => ({
        url: 'api/setup/onboarding-status',
        method: 'GET',
      }),
      transformResponse: (response: OnboardingStatusResponse): OnboardingStatusData => {
        if (!response?.success || !response.data) {
          throw new Error('Invalid onboarding status response')
        }
        return response.data
      },
      providesTags: ['OnboardingStatus'],
    }),
  }),
})

export const { useGetOnboardingStatusQuery, useLazyGetOnboardingStatusQuery } = onboardingApi
