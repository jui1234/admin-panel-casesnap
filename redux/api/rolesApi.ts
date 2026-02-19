import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { APP_BACKEND_URL } from '@/config/env'

// Interfaces
export interface RolePermission {
  module: 'employee' | 'client' | 'cases'
  actions: ('create' | 'read' | 'update' | 'delete')[]
}

export interface Role {
  _id: string
  id?: string
  name: string
  description?: string | null
  priority: number
  permissions: RolePermission[]
  isSystemRole: boolean
  organization: string
  createdBy?: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateRoleRequest {
  name: string
  description?: string
  priority: number
  permissions?: RolePermission[]
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
  priority?: number
  permissions?: RolePermission[]
}

export interface GetRolesResponse {
  success: boolean
  count: number
  data: Role[]
  modules?: Array<{
    name: string
    displayName: string
    description: string
  }>
}

export interface GetRoleResponse {
  success: boolean
  data: Role
}

export interface CreateRoleResponse {
  success: boolean
  message: string
  data: {
    role: Role
    suggestedPriority: number
  }
}

export interface UpdateRoleResponse {
  success: boolean
  message: string
  data: {
    role: Role
  }
}

export interface DeleteRoleResponse {
  success: boolean
  message: string
}

export interface SuggestedPriorityResponse {
  success: boolean
  data: {
    suggestedPriority: number
  }
}

export interface Module {
  name: string
  displayName: string
  description: string
  actions?: string[]
}

export interface GetModulesResponse {
  success: boolean
  data: Module[]
}

export const rolesApi = createApi({
  reducerPath: 'rolesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: APP_BACKEND_URL,
    prepareHeaders: (headers) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token')
        if (token) headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('Content-Type', 'application/json')
      headers.set('Accept', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Roles', 'SuggestedPriority'],
  endpoints: (builder) => ({
    // Get suggested priority
    getSuggestedPriority: builder.query<SuggestedPriorityResponse, void>({
      query: () => ({
        url: 'api/roles/suggest-priority',
        method: 'GET',
      }),
      providesTags: ['SuggestedPriority'],
    }),

    // Get all modules
    getModules: builder.query<GetModulesResponse, void>({
      query: () => ({
        url: 'api/modules',
        method: 'GET',
      }),
    }),

    // Get all roles
    getRoles: builder.query<GetRolesResponse, void>({
      query: () => ({
        url: 'api/roles',
        method: 'GET',
      }),
      providesTags: ['Roles'],
    }),

    // Get single role by ID
    getRoleById: builder.query<GetRoleResponse, { roleId: string }>({
      query: ({ roleId }) => ({
        url: `api/roles/${roleId}`,
        method: 'GET',
      }),
      providesTags: ['Roles'],
    }),

    // Create a new role
    createRole: builder.mutation<CreateRoleResponse, CreateRoleRequest>({
      query: (roleData) => ({
        url: 'api/roles',
        method: 'POST',
        body: roleData,
      }),
      invalidatesTags: ['Roles','SuggestedPriority'],
    }),

    // Update a role
    updateRole: builder.mutation<UpdateRoleResponse, { roleId: string; data: UpdateRoleRequest }>({
      query: ({ roleId, data }) => ({
        url: `api/roles/${roleId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Roles'],
    }),

    // Delete a role
    deleteRole: builder.mutation<DeleteRoleResponse, { roleId: string }>({
      query: ({ roleId }) => ({
        url: `api/roles/${roleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Roles', 'SuggestedPriority'], // Also invalidate suggested priority to refetch
    }),
  }),
})

// Export hooks
export const {
  useGetSuggestedPriorityQuery,
  useGetModulesQuery,
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesApi
