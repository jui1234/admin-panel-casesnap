import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { APP_BACKEND_URL } from '@/config/env'

export type NotificationType = 'success' | 'info' | 'warning' | 'error' | 'client' | 'case'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
  /** e.g. client_abc – use with relatedEntityType to link to /clients/client_abc */
  relatedEntityId?: string
  /** e.g. "client" | "case" – used to build link: /clients/:id or /cases/:id */
  relatedEntityType?: string
}

export interface GetNotificationsRequest {
  /** true = only read, false = only unread. Omit = all */
  read?: boolean
  page?: number
  limit?: number
}

export interface GetNotificationsResponse {
  success: boolean
  data: Notification[]
  count?: number
  total?: number
  /** Use this for the notification badge */
  unreadCount?: number
}

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
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
  tagTypes: ['Notifications'],
  endpoints: (builder) => ({
    /** GET /api/notifications. Use ?read=false for unread only. Use data for list, unreadCount for badge. */
    getNotifications: builder.query<GetNotificationsResponse, GetNotificationsRequest | void>({
      query: (params) => {
        const q: Record<string, string | number | boolean> = {}
        if (params) {
          if (params.read !== undefined) q.read = params.read
          if (params.page != null) q.page = params.page
          if (params.limit != null) q.limit = params.limit
        }
        return {
          url: 'api/notifications',
          method: 'GET',
          params: Object.keys(q).length > 0 ? q : undefined,
        }
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((n) => ({ type: 'Notifications' as const, id: n.id })),
              { type: 'Notifications', id: 'LIST' },
            ]
          : [{ type: 'Notifications', id: 'LIST' }],
    }),
  }),
})

export const { useGetNotificationsQuery, useLazyGetNotificationsQuery } = notificationsApi
