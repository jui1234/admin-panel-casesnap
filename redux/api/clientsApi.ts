import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { APP_BACKEND_URL } from '@/config/env'

export type ClientStatus = 'active' | 'inactive' | 'prospect' | 'archived'

export interface ClientUserRef {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface Client {
  id: string
  _id?: string
  firstName: string
  lastName: string
  email: string
  phone: string
  fees?: number
  status: ClientStatus
  aadharCardNumber?: string
  aadharImageUrl?: string
  aadharImageSize?: number
  streetAddress?: string
  city?: string
  province?: string
  postalCode?: string
  country?: string
  assignedTo?: string | ClientUserRef
  createdBy?: string | ClientUserRef
  updatedBy?: string | ClientUserRef
  organization?: string
  createdAt?: string
  updatedAt?: string
  fullName?: string
  notes?: string
  deletedAt?: string
  deletedBy?: string | ClientUserRef
}

export interface CreateClientRequest {
  firstName: string
  lastName: string
  phone: string
  fees?: number
  email: string
  streetAddress?: string
  city?: string
  province?: string
  postalCode?: string
  country?: string
  aadharCardNumber?: string
  aadharImageUrl?: string
  aadharImageSize?: number
  status?: ClientStatus
  assignedTo?: string
  notes?: string
}

export interface CreateClientResponse {
  success: boolean
  message: string
  data: Client
  warning?: string
}

export interface GetClientsRequest {
  page?: number
  limit?: number
  status?: ClientStatus
  assignedTo?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  includeDeleted?: boolean
}

export interface GetClientsResponse {
  success: boolean
  count: number
  total: number
  page: number
  pages: number
  data: Client[]
}

export interface GetClientResponse {
  success: boolean
  data: Client
}

export interface UpdateClientRequest {
  firstName?: string
  lastName?: string
  phone?: string
  fees?: number
  email?: string
  streetAddress?: string
  city?: string
  province?: string
  postalCode?: string
  country?: string
  aadharCardNumber?: string
  aadharImageUrl?: string
  aadharImageSize?: number
  status?: ClientStatus
  assignedTo?: string
  notes?: string
}

export interface UpdateClientResponse {
  success: boolean
  message: string
  data: Client
}

export interface DeleteClientResponse {
  success: boolean
  message: string
}

export interface RestoreClientResponse {
  success: boolean
  message: string
  data: Client
}

export interface ArchiveClientResponse {
  success: boolean
  message: string
  data: Client
}

export const clientsApi = createApi({
  reducerPath: 'clientsApi',
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
  tagTypes: ['Clients'],
  endpoints: (builder) => ({
    createClient: builder.mutation<CreateClientResponse, CreateClientRequest>({
      query: (body) => ({
        url: 'api/clients',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Clients'],
    }),

    getClients: builder.query<GetClientsResponse, GetClientsRequest | void>({
      query: (params) => {
        const q: Record<string, string | number | boolean> = {}
        if (params) {
          const p = params as GetClientsRequest
          if (p.page != null) q.page = p.page
          if (p.limit != null) q.limit = p.limit
          if (p.status) q.status = p.status
          if (p.assignedTo) q.assignedTo = p.assignedTo
          if (p.search) q.search = p.search
          if (p.sortBy) q.sortBy = p.sortBy
          if (p.sortOrder) q.sortOrder = p.sortOrder
          if (p.includeDeleted != null) q.includeDeleted = p.includeDeleted ? 'true' : 'false'
        }
        return { url: 'api/clients', method: 'GET', params: Object.keys(q).length ? q : undefined }
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((c) => ({ type: 'Clients' as const, id: c.id })),
              { type: 'Clients', id: 'LIST' },
            ]
          : [{ type: 'Clients', id: 'LIST' }],
    }),

    getClientById: builder.query<GetClientResponse, { clientId: string }>({
      query: ({ clientId }) => ({ url: `api/clients/${clientId}`, method: 'GET' }),
      providesTags: (result, err, { clientId }) => [{ type: 'Clients', id: clientId }],
    }),

    updateClient: builder.mutation<UpdateClientResponse, { clientId: string; data: UpdateClientRequest }>({
      query: ({ clientId, data }) => ({
        url: `api/clients/${clientId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (r, e, { clientId }) => [{ type: 'Clients', id: clientId }, { type: 'Clients', id: 'LIST' }],
    }),

    deleteClient: builder.mutation<DeleteClientResponse, { clientId: string }>({
      query: ({ clientId }) => ({
        url: `api/clients/${clientId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (r, e, { clientId }) => [{ type: 'Clients', id: clientId }, { type: 'Clients', id: 'LIST' }],
    }),

    restoreClient: builder.mutation<RestoreClientResponse, { clientId: string }>({
      query: ({ clientId }) => ({
        url: `api/clients/${clientId}/restore`,
        method: 'PUT',
      }),
      invalidatesTags: (r, e, { clientId }) => [{ type: 'Clients', id: clientId }, { type: 'Clients', id: 'LIST' }],
    }),

    archiveClient: builder.mutation<ArchiveClientResponse, { clientId: string }>({
      query: ({ clientId }) => ({
        url: `api/clients/${clientId}/archive`,
        method: 'PUT',
      }),
      invalidatesTags: (r, e, { clientId }) => [{ type: 'Clients', id: clientId }, { type: 'Clients', id: 'LIST' }],
    }),

    unarchiveClient: builder.mutation<ArchiveClientResponse, { clientId: string }>({
      query: ({ clientId }) => ({
        url: `api/clients/${clientId}/unarchive`,
        method: 'PUT',
      }),
      invalidatesTags: (r, e, { clientId }) => [{ type: 'Clients', id: clientId }, { type: 'Clients', id: 'LIST' }],
    }),
  }),
})

export const {
  useCreateClientMutation,
  useGetClientsQuery,
  useLazyGetClientsQuery,
  useGetClientByIdQuery,
  useLazyGetClientByIdQuery,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useRestoreClientMutation,
  useArchiveClientMutation,
  useUnarchiveClientMutation,
} = clientsApi
