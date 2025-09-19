import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { APP_BACKEND_URL } from '@/config/env'

// Types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  token: string
  user: {
    id: string
    email: string
    name: string
    role: string
    organization: {
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

export interface SetupResponse {
  success: boolean
  message: string
  organization?: any
  superAdmin?: any
}

// Create the API slice
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: APP_BACKEND_URL,
    prepareHeaders: (headers) => {
      // Get token from localStorage if available
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token')
        if (token) {
          headers.set('authorization', `Bearer ${token}`)
        }
      }
      headers.set('Content-Type', 'application/json')
      headers.set('Accept', 'application/json')
      return headers
    },
  }),
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
  }),
})

// Export hooks for usage in functional components
export const {
  useLoginMutation,
  useSetupOrganizationMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
} = authApi
