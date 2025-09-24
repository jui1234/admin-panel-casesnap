import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { APP_BACKEND_URL } from '@/config/env'

export interface InviteEmployeeRequest {
  firstName: string
  lastName: string
  email: string
  // Optional fields temporarily filled for backend requirements
  dateOfBirth?: string
  gender?: string
  address?: string
  phone?: string
}

export interface InviteEmployeeResponse {
  success: boolean
  message: string
}

export const employeesApi = createApi({
  reducerPath: 'employeesApi',
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
    }
  }),
  tagTypes: ['Employees'],
  endpoints: (builder) => ({
    inviteEmployee: builder.mutation<InviteEmployeeResponse, InviteEmployeeRequest>({
      query: (body) => ({
        url: 'api/employees/invite',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Employees']
    })
  })
})

export const { useInviteEmployeeMutation } = employeesApi


