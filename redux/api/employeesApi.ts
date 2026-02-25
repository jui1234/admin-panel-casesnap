import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { APP_BACKEND_URL } from '@/config/env'

export interface InviteEmployeeRequest {
  firstName: string
  lastName: string
  email: string
  salary: string
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

export interface RegisterEmployeeRequest {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  gender: string
  dateOfBirth: string
  age: number
  aadharCardNumber: string
  employeeType: string
  advocateLicenseNumber?: string
  internYear?: number
  salary: number
  department: string
  position: string
  startDate: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelation: string
  password: string
  confirmPassword: string
}

export interface RegisterEmployeeRequestWithToken {
  data: RegisterEmployeeRequest
  token: string
}

export interface RegisterEmployeeResponse {
  success: boolean
  message: string
}

export interface Employee {
  _id: string
  id: string
  adminId: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  salary: number
  organization: string
  invitationStatus: 'pending' | 'completed' | 'expired'
  status: 'pending' | 'active' | 'inactive'
  isDeleted: boolean
  deletedAt: string | null
  invitationExpires: string
  createdAt: string
  updatedAt: string
  aadharCardNumber: string
  address: string
  advocateLicenseNumber?: string
  age: number
  dateOfBirth: string
  department: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelation: string
  employeeType: 'advocate' | 'intern' | 'staff'
  gender: 'Male' | 'Female' | 'Other'
  position: string
  startDate: string
}

export interface GetEmployeesRequest {
  page?: number
  limit?: number
  search?: string
  role?: string
  department?: string
  status?: string
  employeeType?: string
}

export interface GetEmployeesResponse {
  success: boolean
  count: number
  totalCount: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage: number | null
  prevPage: number | null
  data: Employee[]
  filters: {
    includeDeleted: boolean
    status: string
    search: string | null
  }
  pagination: {
    page: number
    limit: number
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }
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
    // Admin: get single employee by id
    getEmployeeByAdmin: builder.query<Employee, { id: string }>({
      query: ({ id }) => ({
        url: `api/employees/admin/${id}`,
        method: 'GET',
      }),
      providesTags: ['Employees']
    }),
    getEmployees: builder.query<GetEmployeesResponse, GetEmployeesRequest>({
      query: ({ page = 1, limit = 10, search, role, department, status, employeeType }) => {
        const params: Record<string, string | number> = { page, limit }
        
        if (search) params.search = search
        if (role) params.role = role
        if (department) params.department = department
        if (status) params.status = status
        if (employeeType) params.type = employeeType // Map employeeType to 'type' in URL
        
        return {
          url: 'api/employees/admin/all',
          params,
        }
      },
      providesTags: ['Employees']
    }),
    // Admin: update employee by id
    updateEmployeeByAdmin: builder.mutation<
      { success: boolean; message?: string },
      { id: string; data: Partial<RegisterEmployeeRequest> }>({
      query: ({ id, data }) => ({
        url: `api/employees/admin/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Employees']
    }),
    // Admin: soft delete employee by id
    softDeleteEmployeeByAdmin: builder.mutation<
      { success: boolean; message?: string },
      { id: string }
    >({
      query: ({ id }) => ({
        url: `api/employees/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Employees']
    }),
    updateEmployeeStatus: builder.mutation<
      { success: boolean; message?: string },
      { employeeId: string; status: 'active' | 'inactive' | 'pending'; reason?: string; notes?: string }
    >({
      query: ({ employeeId, status, reason, notes }) => ({
        url: `api/employees/${employeeId}/status`,
        method: 'POST',
        body: { status, reason, notes },
      }),
      invalidatesTags: ['Employees']
    }),
    inviteEmployee: builder.mutation<InviteEmployeeResponse, InviteEmployeeRequest>({
      query: (body) => ({
        url: 'api/employees/invite',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Employees']
    }),
    registerEmployee: builder.mutation<RegisterEmployeeResponse, RegisterEmployeeRequestWithToken>({
      query: ({ data, token }) => ({
        url: `api/employees/register/${token}`,
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }),
      invalidatesTags: ['Employees']
    })
  })
})

export const { 
  useGetEmployeeByAdminQuery,
  useLazyGetEmployeeByAdminQuery,
  useGetEmployeesQuery,
  useUpdateEmployeeStatusMutation,
  useUpdateEmployeeByAdminMutation,
  useSoftDeleteEmployeeByAdminMutation,
  useInviteEmployeeMutation, 
  useRegisterEmployeeMutation 
} = employeesApi


