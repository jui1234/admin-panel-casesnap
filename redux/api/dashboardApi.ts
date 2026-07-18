import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithSubscriptionGuard } from './baseQuery'

export interface DashboardOrganization {
  id: string
  companyName: string
  companyEmail: string
  industry: string
}

export interface DashboardSubscriptionLimits {
  maxUsers?: number | null
  maxClients?: number | null
  maxCases?: number | null
  maxRoles?: number | null
  maxAssignees?: number | null
  maxExcelImportRows?: number | null
  [key: string]: unknown
}

export interface DashboardSubscription {
  subscriptionPlan: string
  subscriptionLabel: string
  isSubscriptionActive: boolean
  subscriptionLimits?: DashboardSubscriptionLimits
}

export interface DashboardClientStats {
  total: number
  active: number
  prospect: number
}

export interface DashboardCaseStats {
  total: number
  active: number
  archived: number
  needsStageConfirmation: number
}

export interface DashboardEmployeeStats {
  total: number
  active: number
  pending: number
}

export interface DashboardNotificationStats {
  unread: number
}

export interface DashboardStats {
  clients: DashboardClientStats
  cases: DashboardCaseStats
  employees: DashboardEmployeeStats
  notifications: DashboardNotificationStats
}

export interface DashboardUpcomingHearing {
  caseId: string
  caseNumber: string
  stageName: string
  nextDate: string
}

export interface DashboardRecentCase {
  id?: string
  _id?: string
  caseNumber?: string
  caseType?: string
  partyName?: string
  status?: string
  createdAt?: string
  [key: string]: unknown
}

export interface DashboardRecentClient {
  id?: string
  _id?: string
  firstName?: string
  lastName?: string
  fullName?: string
  email?: string
  status?: string
  createdAt?: string
  [key: string]: unknown
}

export interface DashboardData {
  organization: DashboardOrganization
  subscription: DashboardSubscription
  stats: DashboardStats
  upcomingHearings: DashboardUpcomingHearing[]
  recentCases: DashboardRecentCase[]
  recentClients: DashboardRecentClient[]
}

export interface GetDashboardResponse {
  success: boolean
  data: DashboardData
}

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: baseQueryWithSubscriptionGuard,
  tagTypes: ['Dashboard'],
  endpoints: (builder) => ({
    /** GET /api/dashboard */
    getDashboard: builder.query<GetDashboardResponse, void>({
      query: () => ({ url: 'api/dashboard', method: 'GET' }),
      providesTags: ['Dashboard'],
    }),
  }),
})

export const { useGetDashboardQuery } = dashboardApi
