import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { APP_BACKEND_URL } from '@/config/env'

export interface InviteUserRequest {
  firstName: string
  lastName: string
  email: string
  phone: string // 10 digits
  roleId: string // Role ID
  userType: 'advocate' | 'intern' | 'non'
  salary: number
}

export interface InviteUserResponse {
  success: boolean
  message: string
  data: {
    user: {
      id: string
      firstName: string
      lastName: string
      email: string
      phone: string
      role: {
        id: string
        name: string
        priority: number
      }
      invitationStatus: 'pending'
      invitationExpires: string
    }
    invitationLink: string
    emailSent: boolean
  }
}

export interface User {
  _id: string
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: string | {
    _id: string
    id: string
    name: string
    priority: number
  }
  roleId?: string
  userType?: 'advocate' | 'intern' | 'non'
  salary?: number
  status: 'pending' | 'approved' | 'inactive' | 'terminated'
  createdAt: string
  updatedAt: string
}

export interface GetUsersRequest {
  status?: string // Can be comma-separated
  roleId?: string
  search?: string
  page?: number
  limit?: number
}

export interface GetUsersResponse {
  success: boolean
  count: number
  data: User[]
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  roleId?: string
  userType?: 'advocate' | 'intern' | 'non'
  salary?: number
  status?: 'pending' | 'approved' | 'inactive' | 'terminated'
}

export interface UpdateUserResponse {
  success: boolean
  message: string
  data: User
}

export interface ApproveUserResponse {
  success: boolean
  message: string
  data: User
}

export interface DeleteUserResponse {
  success: boolean
  message: string
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: APP_BACKEND_URL,
    prepareHeaders: (headers, { endpoint }) => {
      // Don't send auth token for public registration endpoints
      if (endpoint === 'completeUserRegistration' || endpoint === 'getUserByToken') {
        headers.set('Content-Type', 'application/json')
        headers.set('Accept', 'application/json')
        return headers
      }
      
      // For other endpoints, use auth token
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token')
        if (token) headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('Content-Type', 'application/json')
      headers.set('Accept', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Users'],
  endpoints: (builder) => ({
    // Invite user
    inviteUser: builder.mutation<InviteUserResponse, InviteUserRequest>({
      query: (body) => ({
        url: 'api/users/invite',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Users'],
    }),

    // Get all users with filters
    getUsers: builder.query<GetUsersResponse, GetUsersRequest | void>({
      query: (params) => {
        const queryParams: Record<string, string | number> = {}
        
        if (params) {
          const requestParams = params as GetUsersRequest
          if (requestParams.status) queryParams.status = requestParams.status
          if (requestParams.roleId) queryParams.roleId = requestParams.roleId
          if (requestParams.search) queryParams.search = requestParams.search
          if (requestParams.page) queryParams.page = requestParams.page
          if (requestParams.limit) queryParams.limit = requestParams.limit
        }
        
        return {
          url: 'api/users',
          method: 'GET',
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        }
      },
      providesTags: ['Users'],
    }),

    // Get single user by ID
    getUserById: builder.query<{ success: boolean; data: User }, { userId: string }>({
      query: ({ userId }) => ({
        url: `api/users/${userId}`,
        method: 'GET',
      }),
      providesTags: (result, error, { userId }) => [{ type: 'Users', id: userId }],
    }),

    // Update user
    updateUser: builder.mutation<UpdateUserResponse, { userId: string; data: UpdateUserRequest }>({
      query: ({ userId, data }) => ({
        url: `api/users/${userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'Users', id: userId },
        'Users',
      ],
    }),

    // Approve user
    approveUser: builder.mutation<ApproveUserResponse, { userId: string }>({
      query: ({ userId }) => ({
        url: `api/users/${userId}/approve`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'Users', id: userId },
        'Users',
      ],
    }),

    // Delete user (soft delete)
    deleteUser: builder.mutation<DeleteUserResponse, { userId: string }>({
      query: ({ userId }) => ({
        url: `api/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),

    // Get user by invitation token (public endpoint - auth optional)
    getUserByToken: builder.query<{
      success: boolean
      data: {
        user: {
          id: string
          firstName: string
          lastName: string
          email: string
          phone: string
          userType?: 'advocate' | 'intern' | 'non'
          role: {
            id: string
            name: string
            priority: number
          }
          organization: {
            _id: string
            companyName: string
            companyEmail: string
          }
        }
      }
    }, { token: string }>({
      query: ({ token }) => ({
        url: `api/users/register/${token}`,
        method: 'GET',
      }),
      // Public endpoint - auth token is optional (added automatically if available)
    }),

    // Complete user registration (public endpoint - should NOT use auth token)
    completeUserRegistration: builder.mutation<{
      success: boolean
      message: string
      data: {
        user: {
          id: string
          firstName: string
          lastName: string
          email: string
          phone: string
          role: {
            id: string
            name: string
            priority: number
          }
          invitationStatus: 'completed'
        }
      }
    }, { token: string; password: string; confirmPassword: string }>({
      query: ({ token, password, confirmPassword }) => ({
        url: `api/users/register/${token}`,
        method: 'POST',
        body: { password, confirmPassword },
      }),
      // Public endpoint - auth token will not be sent due to prepareHeaders logic
      invalidatesTags: ['Users'],
    }),
  }),
})

export const {
  useInviteUserMutation,
  useGetUsersQuery,
  useLazyGetUsersQuery,
  useGetUserByIdQuery,
  useLazyGetUserByIdQuery,
  useUpdateUserMutation,
  useApproveUserMutation,
  useDeleteUserMutation,
  useGetUserByTokenQuery,
  useLazyGetUserByTokenQuery,
  useCompleteUserRegistrationMutation,
} = userApi
