import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithSubscriptionGuard } from './baseQuery'

export type NotificationType =
  | 'success' | 'info' | 'warning' | 'error'
  | 'client' | 'case'
  | 'client_created' | 'client_assigned' | 'client_bulk_imported'
  | 'case_created' | 'case_assigned' | 'case_bulk_imported'
  | 'case_stage_needs_confirmation'
  | 'case_stage_reminder_5_days' | 'case_stage_reminder_2_days' | 'case_stage_reminder_1_day'
  | 'case_stage_followup_after_date'

export interface Notification {
  /** MongoDB _id from the backend */
  _id?: string
  /** Some responses may map _id → id */
  id?: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  readAt?: string | null
  createdAt: string
  relatedEntityId?: string
  relatedEntityType?: string
}

export interface GetNotificationsRequest {
  read?: boolean
  page?: number
  limit?: number
}

export interface GetNotificationsResponse {
  success: boolean
  data: Notification[]
  count?: number
  total?: number
  unreadCount?: number
}

export interface UnreadCountResponse {
  success: boolean
  unreadCount: number
}

export interface MarkNotificationReadResponse {
  success: boolean
  message: string
}

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: baseQueryWithSubscriptionGuard,
  tagTypes: ['Notifications', 'UnreadCount'],
  endpoints: (builder) => ({
    /** GET /api/notifications */
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
              ...result.data.map((n) => ({ type: 'Notifications' as const, id: n._id || n.id })),
              { type: 'Notifications', id: 'LIST' },
            ]
          : [{ type: 'Notifications', id: 'LIST' }],
    }),

    /** GET /api/notifications/unread-count */
    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => ({ url: 'api/notifications/unread-count', method: 'GET' }),
      providesTags: [{ type: 'UnreadCount', id: 'BADGE' }],
    }),

    /** PATCH /api/notifications/:id/read */
    markNotificationAsRead: builder.mutation<MarkNotificationReadResponse, { notificationId: string }>({
      query: ({ notificationId }) => ({
        url: `api/notifications/${notificationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: (_r, _e, { notificationId }) => [
        { type: 'Notifications', id: notificationId },
        { type: 'Notifications', id: 'LIST' },
        { type: 'UnreadCount', id: 'BADGE' },
      ],
    }),

    /** PATCH /api/notifications/read-all */
    markAllNotificationsAsRead: builder.mutation<MarkNotificationReadResponse, void>({
      query: () => ({ url: 'api/notifications/read-all', method: 'PATCH' }),
      invalidatesTags: [
        { type: 'Notifications', id: 'LIST' },
        { type: 'UnreadCount', id: 'BADGE' },
      ],
    }),
  }),
})

export const {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} = notificationsApi
