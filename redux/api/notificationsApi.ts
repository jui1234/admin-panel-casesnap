import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithSubscriptionGuard } from './baseQuery'

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

export interface MarkNotificationReadResponse {
  success: boolean
  message: string
}

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: baseQueryWithSubscriptionGuard,
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
    /** PATCH /api/notifications/:id/read */
    markNotificationAsRead: builder.mutation<MarkNotificationReadResponse, { notificationId: string }>({
      query: ({ notificationId }) => ({
        url: `api/notifications/${notificationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, { notificationId }) => [
        { type: 'Notifications', id: notificationId },
        { type: 'Notifications', id: 'LIST' },
      ],
    }),
    /** PATCH /api/notifications/read-all */
    markAllNotificationsAsRead: builder.mutation<MarkNotificationReadResponse, void>({
      query: () => ({
        url: 'api/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: [{ type: 'Notifications', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} = notificationsApi
