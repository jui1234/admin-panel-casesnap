import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithSubscriptionGuard } from './baseQuery'

// Types
export interface LoginRequest {
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  resetToken: string
  password: string
  confirmPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface AuthMessageResponse {
  success: boolean
  message: string
}

export interface AssigneePermissions {
  canAssignClient?: boolean
  canAssignCase?: boolean
}

export interface LoginResponse {
  success: boolean
  token: string
  user: {
    id: string
    email: string
    name?: string
    firstName?: string
    lastName?: string
    role: string | Role  // Can be string (legacy) or Role object (new)
    subscriptionPlan?: string  // Valid values: "free", "base", "popular"
    subscriptionStatus?: 'active' | 'inactive' | 'cancelled' | 'expired'
    subscriptionExpiresAt?: string
    assigneePermissions?: AssigneePermissions
    organization?: {
      _id: string
      companyName: string
      companyEmail: string
      companyPhone: string
      streetAddress: string
      city: string
      province: string
      postalCode: string
      country: string
      companyWebsite: string
      industry: string
      practiceAreas: string[]
      createdAt: string
      updatedAt: string
      __v: number
      superAdmin: string
    }
    organizationId?: string
  }
}

export interface OrganizationData {
  companyName: string
  companyEmail: string
  companyPhone: string
  streetAddress: string
  city: string
  province: string
  postalCode: string
  country: string
  companyWebsite: string
  industry: string
  practiceAreas: string[]
  subscriptionPlan?: string  // Valid values: "free" (default), "base", "popular"
  subscriptionStatus?: 'active' | 'inactive' | 'cancelled'
  subscriptionExpiresAt?: string
}

export interface SuperAdminData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export interface SetupRequest {
  organization: OrganizationData
  superAdmin: SuperAdminData
}

export interface RolePermission {
  module: string
  actions: string[]
}

export interface Role {
  id: string
  name: string
  priority: number
  permissions: RolePermission[]
  isSystemRole: boolean
  description: string
}

export interface SetupResponse {
  success: boolean
  message: string
  token: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: Role
    organizationId: string
  }
}

// Create the API slice
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithSubscriptionGuard,
  tagTypes: ['User', 'Organization'],
  endpoints: (builder) => ({
    // Login endpoint
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'api/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    // Setup/Initialize endpoint
    setupOrganization: builder.mutation<SetupResponse, SetupRequest>({
      query: (setupData) => ({
        url: 'api/setup/initialize',
        method: 'POST',
        body: setupData,
      }),
      invalidatesTags: ['Organization'],
    }),

    // Get current user (if you have this endpoint)
    getCurrentUser: builder.query<LoginResponse, void>({
      query: () => 'api/auth/me',
      providesTags: ['User'],
    }),

    // Logout endpoint (if you have this endpoint)
    logout: builder.mutation<void, void>({
      query: () => ({
        url: 'api/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    forgotPassword: builder.mutation<AuthMessageResponse, ForgotPasswordRequest>({
      query: (body) => ({
        url: 'api/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    resetPassword: builder.mutation<AuthMessageResponse, ResetPasswordRequest>({
      query: ({ resetToken, password, confirmPassword }) => ({
        url: `api/auth/reset-password/${encodeURIComponent(resetToken)}`,
        method: 'PUT',
        body: { password, confirmPassword },
      }),
    }),

    changePassword: builder.mutation<AuthMessageResponse, ChangePasswordRequest>({
      query: (body) => ({
        url: 'api/auth/change-password',
        method: 'PUT',
        body,
      }),
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useLoginMutation,
  useSetupOrganizationMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
} = authApi
