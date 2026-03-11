import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithSubscriptionGuard } from './baseQuery'
import { decryptResponseIfNeeded } from '@/utils/responseDecryption'

export const COURT_NAMES = [
  'District Court Delhi',
  'High Court Delhi',
  'Supreme Court',
  'Consumer Forum',
  'Labour Court',
  'Family Court',
  'Other',
] as const

export const COURT_PREMISES = [
  'District Court',
  'High Court',
  'Supreme Court',
  'Tribunal',
  'Other',
] as const

export const CASE_TYPES = [
  'Civil',
  'Criminal',
  'Corporate',
  'Family',
  'Labour',
  'Consumer',
  'Writ',
  'Arbitration',
  'Other',
] as const

export type CourtName = (typeof COURT_NAMES)[number]
export type CourtPremises = (typeof COURT_PREMISES)[number]

export interface CaseUserRef {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface CaseClientRef {
  id: string
  _id?: string
  firstName?: string
  lastName?: string
  email?: string
  fullName?: string
}

export interface Case {
  id: string
  _id?: string
  caseNumber: string
  caseType: string
  partyName: string
  stage?: string
  courtName?: CourtName
  courtPremises?: CourtPremises
  assignedTo?: string | CaseUserRef
  clientCount?: number
  clients?: string[] | CaseClientRef[]
  notes?: string
  status?: 'active' | 'archived'
  createdAt?: string
  updatedAt?: string
  deletedAt?: string
  deletedBy?: string | CaseUserRef
}

export interface CreateCaseRequest {
  caseNumber: string
  caseType: string
  partyName: string
  stage?: string
  courtName?: CourtName | string
  courtPremises?: CourtPremises | string
  assignedTo?: string
  clientCount?: number
  clients?: string[]
  notes?: string
}

export interface UpdateCaseRequest {
  caseNumber?: string
  caseType?: string
  partyName?: string
  stage?: string
  courtName?: CourtName | string
  courtPremises?: CourtPremises | string
  assignedTo?: string
  clientCount?: number
  clients?: string[]
  notes?: string
}

export interface GetCasesRequest {
  page?: number
  limit?: number
  status?: 'active' | 'archived'
  assignedTo?: string
  search?: string
  caseType?: string
  caseNumber?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  includeDeleted?: boolean
}

export interface GetCasesResponse {
  success: boolean
  count: number
  total: number
  page: number
  pages: number
  data: Case[]
}

export interface GetCaseResponse {
  success: boolean
  data: Case
}

export interface CreateCaseResponse {
  success: boolean
  message: string
  data: Case
}

export interface UpdateCaseResponse {
  success: boolean
  message: string
  data: Case
}

export interface DeleteCaseResponse {
  success: boolean
  message: string
}

export interface RestoreCaseResponse {
  success: boolean
  message: string
  data: Case
}

export interface ArchiveCaseResponse {
  success: boolean
  message: string
  data: Case
}

export const casesApi = createApi({
  reducerPath: 'casesApi',
  baseQuery: baseQueryWithSubscriptionGuard,
  tagTypes: ['Cases'],
  endpoints: (builder) => ({
    createCase: builder.mutation<CreateCaseResponse, CreateCaseRequest>({
      query: (body) => ({
        url: 'api/cases',
        method: 'POST',
        body,
      }),
      transformResponse: async (response: CreateCaseResponse & { encrypted?: boolean; iv?: string; authTag?: string }) => {
        return await decryptResponseIfNeeded(response)
      },
      invalidatesTags: ['Cases'],
    }),

    getCases: builder.query<GetCasesResponse, GetCasesRequest | void>({
      query: (params) => {
        const q: Record<string, string | number | boolean> = {}
        if (params) {
          const p = params as GetCasesRequest
          if (p.page != null) q.page = p.page
          if (p.limit != null) q.limit = p.limit
          if (p.status) q.status = p.status
          if (p.assignedTo) q.assignedTo = p.assignedTo
          if (p.search) q.search = p.search
          if (p.caseType) q.caseType = p.caseType
          if (p.caseNumber) q.caseNumber = p.caseNumber
          if (p.sortBy) q.sortBy = p.sortBy
          if (p.sortOrder) q.sortOrder = p.sortOrder
          if (p.includeDeleted != null) q.includeDeleted = p.includeDeleted ? 'true' : 'false'
        }
        return { url: 'api/cases', method: 'GET', params: Object.keys(q).length ? q : undefined }
      },
      transformResponse: async (response: GetCasesResponse & { encrypted?: boolean; iv?: string; authTag?: string }) => {
        return await decryptResponseIfNeeded(response)
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((c) => ({ type: 'Cases' as const, id: c.id })),
              { type: 'Cases', id: 'LIST' },
            ]
          : [{ type: 'Cases', id: 'LIST' }],
    }),

    getCaseById: builder.query<GetCaseResponse, { caseId: string }>({
      query: ({ caseId }) => ({ url: `api/cases/${caseId}`, method: 'GET' }),
      transformResponse: async (response: GetCaseResponse & { encrypted?: boolean; iv?: string; authTag?: string }) => {
        return await decryptResponseIfNeeded(response)
      },
      providesTags: (result, err, { caseId }) => [{ type: 'Cases', id: caseId }],
    }),

    updateCase: builder.mutation<UpdateCaseResponse, { caseId: string; data: UpdateCaseRequest }>({
      query: ({ caseId, data }) => ({
        url: `api/cases/${caseId}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: async (response: UpdateCaseResponse & { encrypted?: boolean; iv?: string; authTag?: string }) => {
        return await decryptResponseIfNeeded(response)
      },
      invalidatesTags: (r, e, { caseId }) => [{ type: 'Cases', id: caseId }, { type: 'Cases', id: 'LIST' }],
    }),

    deleteCase: builder.mutation<DeleteCaseResponse, { caseId: string }>({
      query: ({ caseId }) => ({
        url: `api/cases/${caseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (r, e, { caseId }) => [{ type: 'Cases', id: caseId }, { type: 'Cases', id: 'LIST' }],
    }),

    restoreCase: builder.mutation<RestoreCaseResponse, { caseId: string }>({
      query: ({ caseId }) => ({
        url: `api/cases/${caseId}/restore`,
        method: 'PUT',
      }),
      transformResponse: async (response: RestoreCaseResponse & { encrypted?: boolean; iv?: string; authTag?: string }) => {
        return await decryptResponseIfNeeded(response)
      },
      invalidatesTags: (r, e, { caseId }) => [{ type: 'Cases', id: caseId }, { type: 'Cases', id: 'LIST' }],
    }),

    archiveCase: builder.mutation<ArchiveCaseResponse, { caseId: string }>({
      query: ({ caseId }) => ({
        url: `api/cases/${caseId}/archive`,
        method: 'PUT',
      }),
      transformResponse: async (response: ArchiveCaseResponse & { encrypted?: boolean; iv?: string; authTag?: string }) => {
        return await decryptResponseIfNeeded(response)
      },
      invalidatesTags: (r, e, { caseId }) => [{ type: 'Cases', id: caseId }, { type: 'Cases', id: 'LIST' }],
    }),

    unarchiveCase: builder.mutation<ArchiveCaseResponse, { caseId: string }>({
      query: ({ caseId }) => ({
        url: `api/cases/${caseId}/unarchive`,
        method: 'PUT',
      }),
      transformResponse: async (response: ArchiveCaseResponse & { encrypted?: boolean; iv?: string; authTag?: string }) => {
        return await decryptResponseIfNeeded(response)
      },
      invalidatesTags: (r, e, { caseId }) => [{ type: 'Cases', id: caseId }, { type: 'Cases', id: 'LIST' }],
    }),
  }),
})

export const {
  useCreateCaseMutation,
  useGetCasesQuery,
  useLazyGetCasesQuery,
  useGetCaseByIdQuery,
  useLazyGetCaseByIdQuery,
  useUpdateCaseMutation,
  useDeleteCaseMutation,
  useRestoreCaseMutation,
  useArchiveCaseMutation,
  useUnarchiveCaseMutation,
} = casesApi
