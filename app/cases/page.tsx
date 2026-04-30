'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  FolderOpen,
  Plus,
  ListPlus,
  Search,
  Eye,
  Edit as EditIcon,
  Delete as DeleteIcon,
  X,
  MoreVertical,
  RotateCcw,
  Archive,
  ArchiveRestore,
  Trash2,
  Scale,
  Upload,
  Download,
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useModulePermissions } from '@/hooks/useModulePermissions'
import type { GridColDef } from '@mui/x-data-grid'
import {
  Box,
  Button,
  Card,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  CircularProgress,
  Menu,
  ListItemIcon,
  ListItemText,
  Autocomplete,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  useGetCasesQuery,
  useGetCaseByIdQuery,
  useCreateCaseMutation,
  useUpdateCaseMutation,
  useDeleteCaseMutation,
  useRestoreCaseMutation,
  useArchiveCaseMutation,
  useUnarchiveCaseMutation,
  useGetCaseAssigneesQuery,
  useAddCaseStageMutation,
  useUpdateCaseStageMutation,
  useConfirmCaseStageMutation,
  COURT_NAMES,
  COURT_PREMISES,
  CASE_TYPES,
  type CaseStage,
  type CaseAssignee,
  type Case as CaseType,
  type CreateCaseRequest,
  type UpdateCaseRequest,
  type AddCaseStageRequest,
  type GetCasesRequest,
} from '@/redux/api/casesApi'
import { useGetClientsQuery } from '@/redux/api/clientsApi'
import { useGetAssignableUsersQuery, type User } from '@/redux/api/userApi'
import { useGetOnboardingStatusQuery, onboardingApi } from '@/redux/api/onboardingApi'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import ExcelImportDialog from '@/components/ExcelImportDialog'
import { downloadExcelFile } from '@/utils/excelApi'

const DataGrid = dynamic(() => import('@mui/x-data-grid').then((m) => m.DataGrid), {
  ssr: false,
})

function getAssignedToName(a: string | { id?: string; firstName?: string; lastName?: string; email?: string } | undefined): string {
  if (!a) return '—'
  if (typeof a === 'string') return a
  const n = [a.firstName, a.lastName].filter(Boolean).join(' ')
  return n || a.email || '—'
}

function getClientDisplayName(c: { fullName?: string; firstName?: string; lastName?: string; email?: string } | string): string {
  if (!c) return '—'
  if (typeof c === 'string') return c
  return c.fullName || [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email || '—'
}

type AssignableOption = User & { _id?: string }
type CaseAssigneeOption = CaseAssignee & { _id?: string }

function getAssignableOptionLabel(opt: AssignableOption, currentUserId?: string): string {
  const name = [opt.firstName, opt.lastName].filter(Boolean).join(' ').trim() || opt.email || ''
  const id = opt.id || opt._id
  return id === currentUserId ? `${name} (Me)` : `${name} (${opt.email || ''})`
}

function getConfirmedByName(v: string | { firstName?: string; lastName?: string; email?: string } | undefined): string {
  if (!v) return '—'
  if (typeof v === 'string') return v
  return [v.firstName, v.lastName].filter(Boolean).join(' ') || v.email || '—'
}

function getCaseStageId(s: CaseStage): string | undefined {
  return s.id || s._id
}

function getStageConfirmedByUserId(s: CaseStage): string | undefined {
  const v = s.confirmedBy
  if (!v) return undefined
  if (typeof v === 'string') return v
  return (v as { id?: string; _id?: string }).id || (v as { _id?: string })._id
}

function caseStageToRequest(s: CaseStage): AddCaseStageRequest {
  const cb = s.confirmedBy
  const confirmedBy =
    typeof cb === 'string'
      ? cb
      : cb && typeof cb === 'object'
        ? (cb as { id?: string; _id?: string }).id || (cb as { _id?: string })._id || ''
        : ''
  let nextDate = s.nextDate || ''
  if (nextDate.includes('T')) nextDate = nextDate.slice(0, 10)
  else if (nextDate.length > 10) nextDate = nextDate.slice(0, 10)
  return {
    stageName: s.stageName || '',
    todaySummary: s.todaySummary || '',
    nextDate,
    nextDatePurpose: s.nextDatePurpose || '',
    nextDatePreparation: s.nextDatePreparation || '',
    confirmedBy,
  }
}

export default function CasesPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user: currentUser } = useAuth()
  const { data: onboarding } = useGetOnboardingStatusQuery(undefined, { skip: !currentUser })
  const { canRead, canCreate, canUpdate, canDelete, canAssignee } = useModulePermissions('case')
  const canShowAssignedTo = canAssignee || currentUser?.assigneePermissions?.canAssignCase === true

  const [caseNumberSearch, setCaseNumberSearch] = useState('')
  const [debouncedCaseNumber, setDebouncedCaseNumber] = useState('')
  const [caseTypeFilter, setCaseTypeFilter] = useState<string>('')
  const [viewTab, setViewTab] = useState<'active' | 'archived' | 'deleted'>('active')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [deletedPaginationModel, setDeletedPaginationModel] = useState({ page: 0, pageSize: 10 })

  const [openCreate, setOpenCreate] = useState(false)
  const [openExcelImport, setOpenExcelImport] = useState(false)
  const [showImportNote, setShowImportNote] = useState(true)
  const [openAddStage, setOpenAddStage] = useState(false)
  const [showCreateStages, setShowCreateStages] = useState(false)
  const [showEditStages, setShowEditStages] = useState(false)
  const [editStageRowId, setEditStageRowId] = useState<string | null>(null)
  const [editModalPendingRows, setEditModalPendingRows] = useState<AddCaseStageRequest[]>([])
  const [stageTargetCaseId, setStageTargetCaseId] = useState<string | null>(null)
  const [viewId, setViewId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteCase, setDeleteCase] = useState<CaseType | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuCase, setMenuCase] = useState<CaseType | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedCaseNumber(caseNumberSearch), 400)
    return () => clearTimeout(t)
  }, [caseNumberSearch])

  useEffect(() => {
    if (viewTab === 'deleted') setDeletedPaginationModel((p) => ({ ...p, page: 0 }))
  }, [viewTab])

  useEffect(() => {
    setPaginationModel((p) => ({ ...p, page: 0 }))
  }, [debouncedCaseNumber, caseTypeFilter])

  const [assignableSearchInput, setAssignableSearchInput] = useState('')
  const [assignableSearchDebounced, setAssignableSearchDebounced] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setAssignableSearchDebounced(assignableSearchInput), 400)
    return () => clearTimeout(t)
  }, [assignableSearchInput])

  const { data: assignableData } = useGetAssignableUsersQuery(
    canShowAssignedTo ? { search: assignableSearchDebounced || undefined, limit: 50 } : undefined,
    { skip: !canShowAssignedTo }
  )

  const { data: clientsData } = useGetClientsQuery(
    canShowAssignedTo ? { status: 'active', limit: 200 } : undefined,
    { skip: !canShowAssignedTo }
  )
  const clientsOptions = clientsData?.data ?? []
  const { data: caseAssigneesData, isLoading: caseAssigneesLoading } = useGetCaseAssigneesQuery(undefined, {
    skip: !openAddStage && !showCreateStages && !(!!editId && showEditStages),
  })

  useEffect(() => {
    if (openCreate || editId) setAssignableSearchInput('')
  }, [openCreate, editId])

  const isDeletedView = viewTab === 'deleted'
  const casesParams = useMemo((): GetCasesRequest => {
    const p: GetCasesRequest = {
      page: isDeletedView ? 1 : paginationModel.page + 1,
      limit: isDeletedView ? 500 : paginationModel.pageSize,
      status: isDeletedView ? undefined : (viewTab === 'active' ? 'active' : viewTab === 'archived' ? 'archived' : undefined),
      sortBy: 'createdAt',
      sortOrder: 'desc',
      includeDeleted: isDeletedView ? true : undefined,
    }
    const cn = debouncedCaseNumber?.trim()
    const ct = caseTypeFilter?.trim()
    if (cn) p.caseNumber = cn
    if (ct) p.caseType = ct
    return p
  }, [isDeletedView, paginationModel.page, paginationModel.pageSize, viewTab, debouncedCaseNumber, caseTypeFilter])

  const {
    data: casesRes,
    isLoading: casesLoading,
    error: casesError,
    refetch: refetchCases,
  } = useGetCasesQuery(casesParams)

  const rawCases = casesRes?.data ?? []
  const deletedCases = rawCases.filter((c) => c.deletedAt != null)
  const caseTypeOptions = useMemo(() => {
    const fromData = Array.from(new Set(rawCases.map((c) => c.caseType).filter(Boolean))) as string[]
    // Widen to string set so we can safely check any backend-provided caseType values.
    const known = new Set<string>(CASE_TYPES)
    const extra = fromData.filter((t) => !known.has(t))
    return [...CASE_TYPES, ...extra]
  }, [rawCases])
  const totalCases = isDeletedView ? deletedCases.length : (casesRes?.total ?? 0)
  const cases = isDeletedView
    ? deletedCases.slice(
        deletedPaginationModel.page * deletedPaginationModel.pageSize,
        deletedPaginationModel.page * deletedPaginationModel.pageSize + deletedPaginationModel.pageSize
      )
    : rawCases

  const { data: singleRes, isLoading: singleLoading } = useGetCaseByIdQuery(
    { caseId: viewId || editId || '' },
    { skip: !viewId && !editId }
  )
  const singleCase = singleRes?.data

  const assignableOptions = useMemo((): AssignableOption[] => {
    if (!canShowAssignedTo) return []
    const list: AssignableOption[] = []
    const seen = new Set<string>()
    if (currentUser?.id) {
      list.push({
        id: currentUser.id,
        _id: currentUser.id,
        firstName: currentUser.firstName ?? '',
        lastName: currentUser.lastName ?? '',
        email: currentUser.email || '',
        role: '' as User['role'],
        status: 'approved',
        createdAt: '',
        updatedAt: '',
      } as AssignableOption)
      seen.add(currentUser.id)
    }
    ;(assignableData?.data ?? []).forEach((u) => {
      const id = u.id || (u as { _id?: string })._id
      if (id && !seen.has(id)) {
        seen.add(id)
        list.push(u as AssignableOption)
      }
    })
    return list
  }, [canShowAssignedTo, currentUser, assignableData?.data])

  const confirmedByOptions = useMemo((): CaseAssigneeOption[] => {
    return (caseAssigneesData?.data ?? []).map((u) => ({ ...u, _id: u._id || u.id }))
  }, [caseAssigneesData?.data])

  const [createCase, { isLoading: creating }] = useCreateCaseMutation()
  const [updateCase, { isLoading: updating }] = useUpdateCaseMutation()
  const [addCaseStage, { isLoading: addingStage }] = useAddCaseStageMutation()
  const [updateCaseStage, { isLoading: updatingStage }] = useUpdateCaseStageMutation()
  const [confirmCaseStage, { isLoading: confirmingStage }] = useConfirmCaseStageMutation()
  const [deleteCaseFn, { isLoading: deleting }] = useDeleteCaseMutation()
  const [restoreCaseFn, { isLoading: restoring }] = useRestoreCaseMutation()
  const [archiveCaseFn] = useArchiveCaseMutation()
  const [unarchiveCaseFn] = useUnarchiveCaseMutation()

  useEffect(() => {
    if (!casesLoading && casesError && 'status' in casesError) {
      const status = (casesError as { status?: number }).status
      const msg = String((casesError as { data?: { error?: string; message?: string } })?.data?.error ?? '')
      if (status === 403 || /permission|access denied/i.test(msg)) {
        router.push('/403')
      }
    }
  }, [casesError, casesLoading, router])

  const [createForm, setCreateForm] = useState<CreateCaseRequest>({
    caseNumber: '',
    caseType: '',
    partyName: '',
    courtName: '',
    courtPremises: '',
    assignedTo: '',
    clientCount: 1,
    clients: [],
    notes: '',
  })
  const [createErrors, setCreateErrors] = useState<Partial<Record<keyof CreateCaseRequest, string>>>({})
  const [stageForm, setStageForm] = useState<AddCaseStageRequest>({
    stageName: '',
    todaySummary: '',
    nextDate: '',
    nextDatePurpose: '',
    nextDatePreparation: '',
    confirmedBy: '',
  })
  const [stageErrors, setStageErrors] = useState<Partial<Record<keyof AddCaseStageRequest, string>>>({})
  const [createStageRows, setCreateStageRows] = useState<AddCaseStageRequest[]>([])
  const [pendingStageRows, setPendingStageRows] = useState<AddCaseStageRequest[]>([])

  const [editForm, setEditForm] = useState<UpdateCaseRequest>({})
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  const resetCreateForm = () => {
    setCreateForm({
      caseNumber: '',
      caseType: '',
      partyName: '',
      courtName: '',
      courtPremises: '',
      assignedTo: '',
      clientCount: 1,
      clients: [],
      notes: '',
    })
    setCreateErrors({})
  }

  const resetCreateStageRows = () => {
    setCreateStageRows([])
  }

  const resetPendingStageRows = () => {
    setPendingStageRows([])
  }

  const resetStageForm = () => {
    setStageForm({
      stageName: '',
      todaySummary: '',
      nextDate: '',
      nextDatePurpose: '',
      nextDatePreparation: '',
      confirmedBy: '',
    })
    setStageErrors({})
  }

  const resetEditStageSection = () => {
    setShowEditStages(false)
    setEditStageRowId(null)
    setEditModalPendingRows([])
    resetStageForm()
  }

  const validateCreate = (): boolean => {
    const e: typeof createErrors = {}
    if (!createForm.caseNumber?.trim()) e.caseNumber = 'Case number is required'
    if (!createForm.caseType?.trim()) e.caseType = 'Case type is required'
    if (!createForm.partyName?.trim()) e.partyName = 'Party name is required'
    const cc = createForm.clientCount ?? 0
    const cl = createForm.clients ?? []
    if (cl.length > cc) e.clients = `Cannot link more than ${cc} client(s)`
    setCreateErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreateSubmit = async () => {
    if (!canCreate) {
      toast.error("You don't have permission to create cases")
      return
    }
    if (!validateCreate()) return
    const payload: CreateCaseRequest = {
      caseNumber: createForm.caseNumber!.trim(),
      caseType: createForm.caseType!.trim(),
      partyName: createForm.partyName!.trim(),
      courtName: createForm.courtName || undefined,
      courtPremises: createForm.courtPremises || undefined,
      notes: createForm.notes?.trim() || undefined,
    }
    if (canShowAssignedTo) {
      if (createForm.assignedTo) payload.assignedTo = createForm.assignedTo
      payload.clientCount = createForm.clientCount ?? 1
      payload.clients = (createForm.clients ?? []).slice(0, createForm.clientCount ?? 1)
    }
    try {
      const created = await createCase(payload).unwrap()
      const createdCaseId = created?.data?.id || (created?.data as { _id?: string } | undefined)?._id
      if (createdCaseId && createStageRows.length > 0) {
        try {
          await addCaseStage({
            caseId: createdCaseId,
            data: createStageRows.length === 1 ? createStageRows[0] : createStageRows,
          }).unwrap()
        } catch {
          toast.error('Case created, but stage(s) failed to save')
        }
      }
      toast.success('Case created')
      dispatch(onboardingApi.util.invalidateTags(['OnboardingStatus']))
      setOpenCreate(false)
      setShowCreateStages(false)
      resetCreateForm()
      resetCreateStageRows()
      resetStageForm()
      refetchCases()
    } catch (err: unknown) {
      const et = err as { status?: number; data?: { error?: string; message?: string } }
      toast.error(et?.status === 403 ? "You don't have permission" : (et?.data?.error ?? et?.data?.message ?? 'Create failed'))
    }
  }

  const handleEditSubmit = async () => {
    if (!editId || !canUpdate) return
    const e: Record<string, string> = {}
    const payload: UpdateCaseRequest = { ...editForm }
    const cc = payload.clientCount ?? 1
    const cl = payload.clients ?? []
    if (cl.length > cc) e.clients = `Cannot link more than ${cc} client(s)`
    setEditErrors(e)
    if (Object.keys(e).length) return
    if (!canShowAssignedTo) {
      delete payload.assignedTo
      delete payload.clientCount
      delete payload.clients
    }
    try {
      await updateCase({ caseId: editId, data: payload }).unwrap()
      toast.success('Case updated')
      setEditId(null)
      setEditForm({})
      resetEditStageSection()
      refetchCases()
    } catch (err: unknown) {
      const et = err as { status?: number; data?: { error?: string; message?: string } }
      toast.error(et?.status === 403 ? "You don't have permission" : (et?.data?.error ?? et?.data?.message ?? 'Update failed'))
    }
  }

  const validateStageForm = (): boolean => {
    const e: typeof stageErrors = {}
    if (!stageForm.stageName.trim()) e.stageName = 'Stage name is required'
    if (!stageForm.todaySummary.trim()) e.todaySummary = 'Today summary is required'
    if (!stageForm.nextDate) e.nextDate = 'Next date is required'
    if (!stageForm.nextDatePurpose.trim()) e.nextDatePurpose = 'Next date purpose is required'
    if (!stageForm.nextDatePreparation.trim()) e.nextDatePreparation = 'Preparation details are required'
    if (!stageForm.confirmedBy) e.confirmedBy = 'Confirm By is required'
    setStageErrors(e)
    return Object.keys(e).length === 0
  }

  const pushStageRow = (setter: React.Dispatch<React.SetStateAction<AddCaseStageRequest[]>>) => {
    if (!validateStageForm()) return
    setter((prev) => [
      ...prev,
      {
        stageName: stageForm.stageName.trim(),
        todaySummary: stageForm.todaySummary.trim(),
        nextDate: stageForm.nextDate,
        nextDatePurpose: stageForm.nextDatePurpose.trim(),
        nextDatePreparation: stageForm.nextDatePreparation.trim(),
        confirmedBy: stageForm.confirmedBy,
      },
    ])
    resetStageForm()
  }

  const handleAddStageSubmit = async () => {
    if (!canUpdate) return
    const caseId = stageTargetCaseId || singleCase?.id || (singleCase as { _id?: string } | undefined)?._id
    if (!caseId) return
    try {
      if (pendingStageRows.length === 0) {
        toast.error('Add at least one stage row')
        return
      }
      await addCaseStage({
        caseId,
        data: pendingStageRows.length === 1 ? pendingStageRows[0] : pendingStageRows,
      }).unwrap()
      toast.success('Stages saved')
      setOpenAddStage(false)
      resetStageForm()
      resetPendingStageRows()
      setStageTargetCaseId(null)
      refetchCases()
    } catch (err: unknown) {
      const et = err as { status?: number; data?: { error?: string; message?: string } }
      toast.error(et?.status === 403 ? "You don't have permission" : (et?.data?.error ?? et?.data?.message ?? 'Save stages failed'))
    }
  }

  const handleUpdateEditStage = async () => {
    if (!editId || !editStageRowId || !canUpdate) return
    if (!validateStageForm()) return
    try {
      await updateCaseStage({
        caseId: editId,
        stageId: editStageRowId,
        data: {
          stageName: stageForm.stageName.trim(),
          todaySummary: stageForm.todaySummary.trim(),
          nextDate: stageForm.nextDate,
          nextDatePurpose: stageForm.nextDatePurpose.trim(),
          nextDatePreparation: stageForm.nextDatePreparation.trim(),
          confirmedBy: stageForm.confirmedBy,
        },
      }).unwrap()
      toast.success('Stage updated')
      setEditStageRowId(null)
      resetStageForm()
      refetchCases()
    } catch (err: unknown) {
      const et = err as { status?: number; data?: { error?: string; message?: string } }
      toast.error(et?.status === 403 ? "You don't have permission" : (et?.data?.error ?? et?.data?.message ?? 'Update stage failed'))
    }
  }

  const handleSaveEditModalNewStages = async () => {
    if (!editId || !canUpdate || editModalPendingRows.length === 0) return
    try {
      await addCaseStage({
        caseId: editId,
        data: editModalPendingRows.length === 1 ? editModalPendingRows[0] : editModalPendingRows,
      }).unwrap()
      toast.success('New stages saved')
      setEditModalPendingRows([])
      resetStageForm()
      refetchCases()
    } catch (err: unknown) {
      const et = err as { status?: number; data?: { error?: string; message?: string } }
      toast.error(et?.status === 403 ? "You don't have permission" : (et?.data?.error ?? et?.data?.message ?? 'Save stages failed'))
    }
  }

  const handleConfirmStage = async (caseId: string, stageId: string) => {
    try {
      await confirmCaseStage({ caseId, stageId }).unwrap()
      toast.success('Stage confirmed')
      refetchCases()
    } catch (err: unknown) {
      const et = err as { status?: number; data?: { error?: string; message?: string } }
      toast.error(et?.status === 403 ? "You can't confirm this stage" : (et?.data?.error ?? et?.data?.message ?? 'Confirm failed'))
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteCase || !canDelete) return
    const id = deleteCase.id || (deleteCase as { _id?: string })._id
    if (!id) return
    try {
      await deleteCaseFn({ caseId: id }).unwrap()
      toast.success('Case deleted')
      setDeleteCase(null)
      refetchCases()
    } catch (err: unknown) {
      const et = err as { status?: number; data?: { error?: string; message?: string } }
      toast.error(et?.status === 403 ? "You don't have permission" : (et?.data?.error ?? et?.data?.message ?? 'Delete failed'))
    }
  }

  const handleRestore = async (c: CaseType): Promise<boolean> => {
    if (!canUpdate) return false
    const id = c.id || (c as { _id?: string })._id
    if (!id) return false
    try {
      await restoreCaseFn({ caseId: id }).unwrap()
      toast.success('Case restored')
      setMenuCase(null)
      setAnchorEl(null)
      refetchCases()
      return true
    } catch (err: unknown) {
      const et = err as { status?: number; data?: { error?: string; message?: string } }
      toast.error(et?.status === 403 ? "You don't have permission to restore this case" : (et?.data?.error ?? et?.data?.message ?? 'Restore failed'))
      return false
    }
  }

  const handleArchive = async (c: CaseType) => {
    if (!canUpdate) return
    const id = c.id || (c as { _id?: string })._id
    if (!id) return
    try {
      await archiveCaseFn({ caseId: id }).unwrap()
      toast.success('Case archived')
      setMenuCase(null)
      setAnchorEl(null)
      refetchCases()
    } catch (err: unknown) {
      const et = err as { status?: number; data?: { error?: string; message?: string } }
      toast.error(et?.data?.error ?? et?.data?.message ?? 'Archive failed')
    }
  }

  const handleUnarchive = async (c: CaseType) => {
    if (!canUpdate) return
    const id = c.id || (c as { _id?: string })._id
    if (!id) return
    try {
      await unarchiveCaseFn({ caseId: id }).unwrap()
      toast.success('Case unarchived')
      setMenuCase(null)
      setAnchorEl(null)
      refetchCases()
    } catch (err: unknown) {
      const et = err as { status?: number; data?: { error?: string; message?: string } }
      toast.error(et?.data?.error ?? et?.data?.message ?? 'Unarchive failed')
    }
  }

  const openMenu = (ev: React.MouseEvent<HTMLElement>, row: CaseType) => {
    setAnchorEl(ev.currentTarget)
    setMenuCase(row)
  }
  const closeMenu = () => {
    setAnchorEl(null)
    setMenuCase(null)
  }

  const openView = (id: string) => {
    setViewId(id)
    setOpenAddStage(false)
    resetStageForm()
    closeMenu()
  }
  const openEdit = (id: string) => {
    setEditId(id)
    setEditForm({})
    setEditErrors({})
    resetEditStageSection()
    closeMenu()
  }
  const openDelete = (c: CaseType) => {
    setDeleteCase(c)
    closeMenu()
  }

  useEffect(() => {
    if (!singleCase || !editId) return
    const assignedId = typeof singleCase.assignedTo === 'string'
      ? singleCase.assignedTo
      : (singleCase.assignedTo?.id || (singleCase.assignedTo as { _id?: string })?._id)
    const clientsArr = singleCase.clients ?? []
    const clientIds = clientsArr.map((cl) => (typeof cl === 'string' ? cl : (cl as { id?: string; _id?: string }).id || (cl as { _id?: string })._id || '')).filter(Boolean)
    setEditForm({
      caseNumber: singleCase.caseNumber,
      caseType: singleCase.caseType,
      partyName: singleCase.partyName,
      courtName: singleCase.courtName ?? '',
      courtPremises: singleCase.courtPremises ?? '',
      assignedTo: assignedId || undefined,
      clientCount: singleCase.clientCount ?? 1,
      clients: clientIds,
      notes: singleCase.notes ?? '',
    })
  }, [singleCase, editId])

  const formatDeletedDate = (deletedAt: string | undefined) => {
    if (!deletedAt) return '—'
    try {
      return new Date(deletedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })
    } catch {
      return deletedAt
    }
  }

  const getClientsDisplay = (clients: string[] | CaseType['clients'] | undefined): string => {
    if (!clients || !Array.isArray(clients)) return '—'
    const names = clients.slice(0, 3).map((c) => (typeof c === 'string' ? c : getClientDisplayName(c as { fullName?: string; firstName?: string; lastName?: string; email?: string })))
    return names.join(', ') + (clients.length > 3 ? ` +${clients.length - 3}` : '')
  }

  const formatShortDate = (d: string | undefined): string => {
    if (!d) return '—'
    try {
      return new Date(d).toLocaleDateString('en-IN')
    } catch {
      return d
    }
  }

  const caseStages = (singleCase?.stages ?? []) as CaseStage[]

  const columns: GridColDef[] = [
    {
      field: 'caseNumber',
      headerName: 'Case No.',
      width: 140,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>{(params.row as CaseType).caseNumber}</Typography>
          {isDeletedView && (params.row as CaseType).deletedAt && (
            <Chip label="Deleted" size="small" color="error" variant="outlined" sx={{ height: 18, fontSize: '0.65rem', mt: 0.25 }} />
          )}
        </Box>
      ),
    },
    {
      field: 'partyName',
      headerName: 'Party',
      width: 180,
      renderCell: (params) => <Typography variant="body2">{(params.row as CaseType).partyName || '—'}</Typography>,
    },
    {
      field: 'caseType',
      headerName: 'Type',
      width: 100,
      renderCell: (params) => <Typography variant="body2">{(params.row as CaseType).caseType || '—'}</Typography>,
    },
    {
      field: 'courtName',
      headerName: 'Court',
      width: 140,
      renderCell: (params) => <Typography variant="body2">{(params.row as CaseType).courtName || '—'}</Typography>,
    },
    ...(canRead || canShowAssignedTo
      ? [
          {
            field: 'assignedTo',
            headerName: 'Assigned To',
            width: 140,
            renderCell: (params) => (
              <Typography variant="body2" color="text.secondary">
                {getAssignedToName((params.row as CaseType).assignedTo)}
              </Typography>
            ),
          } as GridColDef,
        ]
      : []),
    ...(canShowAssignedTo
      ? [
          {
            field: 'clients',
            headerName: 'Clients',
            width: 160,
            renderCell: (params) => (
              <Typography variant="body2" color="text.secondary">
                {getClientsDisplay((params.row as CaseType).clients)}
              </Typography>
            ),
          } as GridColDef,
        ]
      : []),
    ...(isDeletedView
      ? [
          {
            field: 'deletedAt',
            headerName: 'Deleted on',
            width: 120,
            renderCell: (params) => (
              <Typography variant="body2" color="text.secondary">
                {formatDeletedDate((params.row as CaseType).deletedAt)}
              </Typography>
            ),
          } as GridColDef,
        ]
      : []),
    ...(isDeletedView
      ? (canRead || canUpdate)
        ? [
            {
              field: 'actions',
              headerName: 'Actions',
              width: 160,
              sortable: false,
              filterable: false,
              renderCell: (params: { row: CaseType }) => {
                const c = params.row
                const id = c.id || (c as { _id?: string })._id || ''
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {canRead && (
                      <Button size="small" variant="outlined" startIcon={<Eye size={16} />} onClick={() => openView(id)}>
                        View
                      </Button>
                    )}
                    {canUpdate && (
                      <Button size="small" variant="outlined" color="success" startIcon={<RotateCcw size={16} />} onClick={() => handleRestore(c)} disabled={restoring}>
                        Restore
                      </Button>
                    )}
                  </Box>
                )
              },
            } as GridColDef,
          ]
        : []
      : canRead || canUpdate || canDelete
      ? [
          {
            field: 'actions',
            headerName: 'Actions',
            width: 70,
            sortable: false,
            filterable: false,
            renderCell: (params: { row: CaseType }) => (
              <IconButton size="small" onClick={(e) => openMenu(e, params.row)}>
                <MoreVertical size={18} />
              </IconButton>
            ),
          } as GridColDef,
        ]
      : []),
  ]

  return (
    <ProtectedRoute>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Case List
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage cases and court matters
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
            {canRead && (
              <Button
                variant="outlined"
                startIcon={<Download size={18} />}
                onClick={async () => {
                  try {
                    await downloadExcelFile('/api/cases/excel/template', 'cases-template.xlsx')
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Template download failed')
                  }
                }}
              >
                Template
              </Button>
            )}
            {canCreate && (
              <Button variant="outlined" startIcon={<Upload size={18} />} onClick={() => setOpenExcelImport(true)}>
                Import
              </Button>
            )}
            {canRead && (
              <Button
                variant="outlined"
                startIcon={<Download size={18} />}
                onClick={async () => {
                  try {
                    await downloadExcelFile('/api/cases/excel/export', 'cases-export.xlsx')
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Export failed')
                  }
                }}
              >
                Export
              </Button>
            )}
            {canCreate && viewTab === 'active' && (
              <Button
                variant="contained"
                startIcon={<Plus />}
                onClick={() => {
                  setOpenCreate(true)
                  setOpenAddStage(false)
                  setShowCreateStages(false)
                  resetCreateForm()
                  resetCreateStageRows()
                  resetStageForm()
                }}
                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
              >
                Add Case
              </Button>
            )}
          </Box>
        </Box>

        <Tabs value={viewTab} onChange={(_, v: 'active' | 'archived' | 'deleted') => setViewTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Active" value="active" icon={<Scale size={18} />} iconPosition="start" />
          <Tab label="Archive" value="archived" icon={<Archive size={18} />} iconPosition="start" />
          <Tab label="Deleted" value="deleted" icon={<Trash2 size={18} />} iconPosition="start" />
        </Tabs>

        {showImportNote && (canCreate || canRead) && (
          <Alert severity="info" onClose={() => setShowImportNote(false)} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Cases bulk import note (with clients) — Important (Read before upload)
            </Typography>
            <Box component="ul" sx={{ pl: 2, my: 0 }}>
              <li>
                <Typography variant="body2">
                  Please upload only the Excel file downloaded from <strong>Template</strong>.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Do not rename, delete, add, or reorder columns (otherwise upload will fail).
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Fill required case fields: <strong>caseNumber</strong>, <strong>caseType</strong>, <strong>partyName</strong>.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Each row can include a client. We recommend using <strong>clientPhone</strong> (10-digit) (and/or <strong>clientEmail</strong>) to link an existing client.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  If the client is not found, the system will create a new client automatically only when you provide:
                  <strong> clientPhone or clientEmail</strong>, <strong>clientFirstName</strong>, <strong>clientLastName</strong>, <strong>full address fields</strong>, and <strong>clientFees</strong>.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Multiple rows with the same <strong>caseNumber</strong> will be merged into one case with multiple clients.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Use <strong>Preview</strong> to see what will be created/linked and to fix row errors before importing.
                </Typography>
              </li>
            </Box>
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by case number..."
                value={caseNumberSearch}
                onChange={(e) => setCaseNumberSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: caseNumberSearch ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setCaseNumberSearch('')}>
                        <X size={18} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Case type</InputLabel>
                <Select
                  value={caseTypeFilter}
                  label="Case type"
                  onChange={(e) => setCaseTypeFilter(e.target.value)}
                  displayEmpty
                  renderValue={(v) => (v ? v : 'All types')}
                >
                  <MenuItem value="">
                    <em>All types</em>
                  </MenuItem>
                  {caseTypeOptions.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={5} />
          </Grid>
        </Box>

        {(viewTab === 'active' || viewTab === 'archived') && (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            {viewTab === 'active' && <Scale size={20} style={{ opacity: 0.7 }} />}
            {viewTab === 'archived' && <Archive size={20} style={{ opacity: 0.7 }} />}
            <Typography variant="body2" color="text.secondary">
              {totalCases} {viewTab === 'active' ? 'active' : 'archived'} case{totalCases !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}

        {isDeletedView && totalCases > 0 && (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Trash2 size={20} style={{ opacity: 0.7 }} />
            <Typography variant="body2" color="text.secondary">{totalCases} deleted case{totalCases !== 1 ? 's' : ''}</Typography>
          </Box>
        )}

        <Card sx={{ p: 0 }}>
        <Box sx={{ height: 600, width: '100%' }}>
          {casesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : casesError ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: 2 }}>
              <Alert severity="error">{(casesError as { data?: { error?: string; message?: string } })?.data?.error ?? 'Failed to load cases'}</Alert>
              <Button variant="contained" onClick={() => refetchCases()}>Retry</Button>
            </Box>
          ) : cases.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 1 }}>
              {isDeletedView ? (
                <>
                  <Trash2 size={48} style={{ opacity: 0.4 }} />
                  <Typography variant="body1" color="text.secondary">No deleted cases</Typography>
                </>
              ) : viewTab === 'archived' ? (
                <>
                  <Archive size={48} style={{ opacity: 0.4 }} />
                  <Typography variant="body1" color="text.secondary">No archived cases</Typography>
                </>
              ) : (
                <>
                  <FolderOpen size={48} style={{ opacity: 0.4 }} />
                  <Typography variant="body1" color="text.secondary" align="center">
                    {canShowAssignedTo ? 'No active cases or no cases assigned to you' : 'No active cases'}
                  </Typography>
                  {onboarding && onboarding.readiness && !onboarding.readiness.hasClients && (
                    <Box sx={{ textAlign: 'center', maxWidth: 440, mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        Add at least one client before you create cases.
                      </Typography>
                      <Button variant="outlined" onClick={() => router.push('/clients')}>
                        Go to Clients
                      </Button>
                    </Box>
                  )}
                  {onboarding?.suggestedNextStep === 'create_case' && onboarding.readiness?.hasClients && (
                    <Box sx={{ textAlign: 'center', maxWidth: 440, mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        Create your first case to start tracking matters and hearings.
                      </Typography>
                      {canCreate && (
                        <Button
                          variant="contained"
                          startIcon={<Plus />}
                          onClick={() => {
                            setOpenCreate(true)
                            setShowCreateStages(false)
                            resetCreateForm()
                            resetCreateStageRows()
                            resetStageForm()
                          }}
                        >
                          Add your first case
                        </Button>
                      )}
                    </Box>
                  )}
                </>
              )}
            </Box>
          ) : (
            <DataGrid
              rows={cases}
              columns={columns}
              getRowId={(r) => (r as CaseType).id || (r as CaseType)._id || ''}
              rowCount={totalCases}
              paginationMode={isDeletedView ? 'client' : 'server'}
              paginationModel={isDeletedView ? deletedPaginationModel : paginationModel}
              onPaginationModelChange={isDeletedView ? setDeletedPaginationModel : setPaginationModel}
              pageSizeOptions={[5, 10, 25, 50]}
              disableRowSelectionOnClick
              sx={{ '& .MuiDataGrid-cell:focus': { outline: 'none' } }}
            />
          )}
        </Box>
        </Card>

        {/* Create Modal */}
        <Dialog
          open={openCreate}
          onClose={() => {
            setOpenCreate(false)
            setShowCreateStages(false)
            resetCreateForm()
            resetCreateStageRows()
            resetStageForm()
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Add Case</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Case Number *" value={createForm.caseNumber} onChange={(e) => setCreateForm((p) => ({ ...p, caseNumber: e.target.value }))} error={!!createErrors.caseNumber} helperText={createErrors.caseNumber} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Case Type *" value={createForm.caseType} onChange={(e) => setCreateForm((p) => ({ ...p, caseType: e.target.value }))} error={!!createErrors.caseType} helperText={createErrors.caseType} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Party Name *" value={createForm.partyName} onChange={(e) => setCreateForm((p) => ({ ...p, partyName: e.target.value }))} error={!!createErrors.partyName} helperText={createErrors.partyName} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Court Premises</InputLabel>
                  <Select
                    value={createForm.courtName || ''}
                    label="Court Premises"
                    onChange={(e) => setCreateForm((p) => ({ ...p, courtName: e.target.value || undefined }))}
                  >
                    <MenuItem value="">—</MenuItem>
                    {COURT_NAMES.map((cn) => (
                      <MenuItem key={cn} value={cn}>{cn}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Court Name"
                  value={createForm.courtPremises || ''}
                  onChange={(e) =>
                    setCreateForm((p) => ({
                      ...p,
                      courtPremises: e.target.value.slice(0, 100) || undefined,
                    }))
                  }
                  inputProps={{ maxLength: 100 }}
                />
              </Grid>
              {canShowAssignedTo && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      options={assignableOptions}
                      getOptionLabel={(opt) => getAssignableOptionLabel(opt, currentUser?.id)}
                      value={assignableOptions.find((o) => (o.id || o._id) === createForm.assignedTo) ?? null}
                      onChange={(_, v) => setCreateForm((p) => ({ ...p, assignedTo: v ? (v.id || (v as { _id?: string })._id) || '' : '' }))}
                      renderInput={(params) => <TextField {...params} label="Assigned To" />}
                      isOptionEqualToValue={(o, v) => (o.id || o._id) === (v?.id || (v as { _id?: string })?._id)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField type="number" fullWidth label="Max Clients to Link" value={createForm.clientCount ?? 1} onChange={(e) => setCreateForm((p) => ({ ...p, clientCount: Math.max(1, parseInt(e.target.value, 10) || 1) }))} inputProps={{ min: 1 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      options={clientsOptions}
                      getOptionLabel={(opt) => getClientDisplayName(opt)}
                      value={clientsOptions.filter((c) => (createForm.clients ?? []).includes(c.id || (c as { _id?: string })._id || ''))}
                      onChange={(_, v) => setCreateForm((p) => ({ ...p, clients: v.map((c) => c.id || (c as { _id?: string })._id || '').slice(0, p.clientCount ?? 1) }))}
                      renderInput={(params) => <TextField {...params} label="Linked Clients" placeholder="Select clients" error={!!createErrors.clients} helperText={createErrors.clients} />}
                      isOptionEqualToValue={(o, v) => (o.id || (o as { _id?: string })._id) === (v?.id || (v as { _id?: string })?._id)}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <TextField fullWidth label="Notes" multiline rows={2} value={createForm.notes} onChange={(e) => setCreateForm((p) => ({ ...p, notes: e.target.value }))} />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2">Stage</Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ListPlus size={16} />}
                    onClick={() => setShowCreateStages((v) => !v)}
                  >
                    Stage
                  </Button>
                </Box>

                {showCreateStages && (
                  <Box sx={{ mt: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                    <Box sx={{ px: 1, py: 0.5, display: 'flex', justifyContent: 'flex-end', bgcolor: 'action.hover' }}>
                      <IconButton size="small" onClick={() => { setShowCreateStages(false); resetStageForm(); setStageErrors({}); }}>
                        <X size={16} />
                      </IconButton>
                    </Box>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ width: 180, color: 'text.secondary', fontWeight: 600 }}>Stage Name *</TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={stageForm.stageName}
                              onChange={(e) => setStageForm((p) => ({ ...p, stageName: e.target.value }))}
                              error={!!stageErrors.stageName}
                              helperText={stageErrors.stageName}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ width: 180, color: 'text.secondary', fontWeight: 600 }}>Today Summary *</TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              multiline
                              minRows={2}
                              value={stageForm.todaySummary}
                              onChange={(e) => setStageForm((p) => ({ ...p, todaySummary: e.target.value }))}
                              error={!!stageErrors.todaySummary}
                              helperText={stageErrors.todaySummary}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ width: 180, color: 'text.secondary', fontWeight: 600 }}>Next Date *</TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              type="date"
                              value={stageForm.nextDate}
                              onChange={(e) => setStageForm((p) => ({ ...p, nextDate: e.target.value }))}
                              error={!!stageErrors.nextDate}
                              helperText={stageErrors.nextDate}
                              InputLabelProps={{ shrink: true }}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ width: 180, color: 'text.secondary', fontWeight: 600 }}>Confirm By *</TableCell>
                          <TableCell>
                            <Autocomplete
                              options={confirmedByOptions}
                              loading={caseAssigneesLoading}
                              value={confirmedByOptions.find((u) => (u.id || u._id) === stageForm.confirmedBy) ?? null}
                              onChange={(_, v) => setStageForm((p) => ({ ...p, confirmedBy: v ? (v.id || v._id || '') : '' }))}
                              getOptionLabel={(opt) => [opt.firstName, opt.lastName].filter(Boolean).join(' ') || opt.email || ''}
                              isOptionEqualToValue={(o, v) => (o.id || o._id) === (v?.id || v?._id)}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  error={!!stageErrors.confirmedBy}
                                  helperText={stageErrors.confirmedBy}
                                />
                              )}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ width: 180, color: 'text.secondary', fontWeight: 600 }}>Next Date Purpose *</TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              multiline
                              minRows={2}
                              value={stageForm.nextDatePurpose}
                              onChange={(e) => setStageForm((p) => ({ ...p, nextDatePurpose: e.target.value }))}
                              error={!!stageErrors.nextDatePurpose}
                              helperText={stageErrors.nextDatePurpose}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ width: 180, color: 'text.secondary', fontWeight: 600 }}>Preparation For Next Date *</TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              multiline
                              minRows={2}
                              value={stageForm.nextDatePreparation}
                              onChange={(e) => setStageForm((p) => ({ ...p, nextDatePreparation: e.target.value }))}
                              error={!!stageErrors.nextDatePreparation}
                              helperText={stageErrors.nextDatePreparation}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell />
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ListPlus size={16} />}
                              onClick={() => {
                                pushStageRow(setCreateStageRows)
                              }}
                            >
                              Add Stage Row
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>
                )}

                {createStageRows.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No stage rows added yet.</Typography>
                ) : (
                  <Box sx={{ mt: 1, maxHeight: 220, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Stage</TableCell>
                          <TableCell>Next Date</TableCell>
                          <TableCell>Confirm By</TableCell>
                          <TableCell align="right">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {createStageRows.map((s, idx) => (
                          <TableRow key={`${s.stageName}-${idx}`}>
                            <TableCell>{s.stageName}</TableCell>
                            <TableCell>{formatShortDate(s.nextDate)}</TableCell>
                            <TableCell>{getConfirmedByName(confirmedByOptions.find((u) => (u.id || u._id) === s.confirmedBy))}</TableCell>
                            <TableCell align="right">
                              <Button size="small" color="error" onClick={() => setCreateStageRows((prev) => prev.filter((_, i) => i !== idx))}>
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenCreate(false)
                setShowCreateStages(false)
                resetCreateForm()
                resetCreateStageRows()
                resetStageForm()
              }}
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={handleCreateSubmit} disabled={creating}>Create</Button>
          </DialogActions>
        </Dialog>

        {/* View Modal */}
        <Dialog
          open={!!viewId}
          onClose={() => {
            setViewId(null)
            setOpenAddStage(false)
            resetStageForm()
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Case Details</Typography>
              {singleCase?.deletedAt && <Chip label={`Deleted on ${formatDeletedDate(singleCase.deletedAt)}`} size="small" color="error" variant="outlined" />}
              <IconButton
                onClick={() => {
                  setViewId(null)
                  setOpenAddStage(false)
                  resetStageForm()
                }}
                size="small"
              >
                <X />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {singleLoading || !singleCase ? (
              <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
            ) : (
              <Grid container spacing={2} sx={{ pt: 1 }}>
                <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Case Number</Typography><Typography variant="body1" fontWeight={500}>{singleCase.caseNumber}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Case Type</Typography><Typography variant="body1">{singleCase.caseType || '—'}</Typography></Grid>
                <Grid item xs={12}><Typography variant="caption" color="text.secondary">Party Name</Typography><Typography variant="body1">{singleCase.partyName || '—'}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Court Name</Typography><Typography variant="body1">{singleCase.courtName || '—'}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Court Premises</Typography><Typography variant="body1">{singleCase.courtPremises || '—'}</Typography></Grid>
                {(canRead || canShowAssignedTo) && (
                  <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Assigned To</Typography><Typography variant="body1">{getAssignedToName(singleCase.assignedTo)}</Typography></Grid>
                )}
                {canShowAssignedTo && (
                  <Grid item xs={12}><Typography variant="caption" color="text.secondary">Linked Clients</Typography><Typography variant="body1">{getClientsDisplay(singleCase.clients)}</Typography></Grid>
                )}
                {singleCase.notes && <Grid item xs={12}><Typography variant="caption" color="text.secondary">Notes</Typography><Typography variant="body1">{singleCase.notes}</Typography></Grid>}
                <Grid item xs={12}>
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2">Case Stages</Typography>
                    </Box>
                    {caseStages.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No stage entries yet.</Typography>
                    ) : (
                      <Box sx={{ maxHeight: 260, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>Stage</TableCell>
                              <TableCell>Today Summary</TableCell>
                              <TableCell>Next Date</TableCell>
                              <TableCell>Purpose</TableCell>
                              <TableCell>Preparation</TableCell>
                              <TableCell>Confirmed By</TableCell>
                              <TableCell align="right">Confirmation</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {caseStages.map((s, idx) => {
                              const sid = getCaseStageId(s)
                              const detailCaseId = singleCase.id || (singleCase as { _id?: string })._id
                              const canConfirmStage =
                                !!detailCaseId &&
                                !!sid &&
                                !s.confirmedAt &&
                                !!currentUser?.id &&
                                getStageConfirmedByUserId(s) === currentUser.id
                              return (
                              <TableRow key={s.id || s._id || `${s.stageName}-${idx}`}>
                                <TableCell>{s.stageName || '—'}</TableCell>
                                <TableCell>{s.todaySummary || '—'}</TableCell>
                                <TableCell>{formatShortDate(s.nextDate)}</TableCell>
                                <TableCell>{s.nextDatePurpose || '—'}</TableCell>
                                <TableCell>{s.nextDatePreparation || '—'}</TableCell>
                                <TableCell>{getConfirmedByName(s.confirmedBy as string | { firstName?: string; lastName?: string; email?: string } | undefined)}</TableCell>
                                <TableCell align="right">
                                  {s.confirmedAt ? (
                                    <Chip size="small" label="Confirmed" color="success" variant="outlined" />
                                  ) : canConfirmStage && detailCaseId && sid ? (
                                    <Button
                                      size="small"
                                      variant="contained"
                                      disabled={confirmingStage}
                                      onClick={() => handleConfirmStage(detailCaseId, sid)}
                                    >
                                      Confirm
                                    </Button>
                                  ) : (
                                    <Typography variant="caption" color="text.secondary">Pending</Typography>
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                          </TableBody>
                        </Table>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            {singleCase?.deletedAt && canUpdate && (
              <Button variant="contained" color="success" startIcon={<RotateCcw size={16} />} onClick={async () => { if (singleCase && (await handleRestore(singleCase))) setViewId(null) }} disabled={restoring}>Restore</Button>
            )}
            <Button
              onClick={() => {
                setViewId(null)
                setOpenAddStage(false)
                resetStageForm()
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openAddStage}
          onClose={() => {
            setOpenAddStage(false)
            resetStageForm()
            resetPendingStageRows()
            setStageTargetCaseId(null)
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Add Stages</Typography>
              <IconButton
                size="small"
                onClick={() => {
                  setOpenAddStage(false)
                  resetStageForm()
                  resetPendingStageRows()
                  setStageTargetCaseId(null)
                }}
              >
                <X />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ width: 180, color: 'text.secondary', fontWeight: 600 }}>Stage Name *</TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={stageForm.stageName}
                        onChange={(e) => setStageForm((p) => ({ ...p, stageName: e.target.value }))}
                        error={!!stageErrors.stageName}
                        helperText={stageErrors.stageName}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ width: 180, color: 'text.secondary', fontWeight: 600 }}>Today Summary *</TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        minRows={2}
                        value={stageForm.todaySummary}
                        onChange={(e) => setStageForm((p) => ({ ...p, todaySummary: e.target.value }))}
                        error={!!stageErrors.todaySummary}
                        helperText={stageErrors.todaySummary}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ width: 180, color: 'text.secondary', fontWeight: 600 }}>Next Date *</TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        value={stageForm.nextDate}
                        onChange={(e) => setStageForm((p) => ({ ...p, nextDate: e.target.value }))}
                        error={!!stageErrors.nextDate}
                        helperText={stageErrors.nextDate}
                        InputLabelProps={{ shrink: true }}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ width: 180, color: 'text.secondary', fontWeight: 600 }}>Confirm By *</TableCell>
                    <TableCell>
                      <Autocomplete
                        options={confirmedByOptions}
                        loading={caseAssigneesLoading}
                        value={confirmedByOptions.find((u) => (u.id || u._id) === stageForm.confirmedBy) ?? null}
                        onChange={(_, v) => setStageForm((p) => ({ ...p, confirmedBy: v ? (v.id || v._id || '') : '' }))}
                        getOptionLabel={(opt) => [opt.firstName, opt.lastName].filter(Boolean).join(' ') || opt.email || ''}
                        isOptionEqualToValue={(o, v) => (o.id || o._id) === (v?.id || v?._id)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            error={!!stageErrors.confirmedBy}
                            helperText={stageErrors.confirmedBy}
                          />
                        )}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ width: 180, color: 'text.secondary', fontWeight: 600 }}>Next Date Purpose *</TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        minRows={2}
                        value={stageForm.nextDatePurpose}
                        onChange={(e) => setStageForm((p) => ({ ...p, nextDatePurpose: e.target.value }))}
                        error={!!stageErrors.nextDatePurpose}
                        helperText={stageErrors.nextDatePurpose}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ width: 180, color: 'text.secondary', fontWeight: 600 }}>Preparation For Next Date *</TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        minRows={2}
                        value={stageForm.nextDatePreparation}
                        onChange={(e) => setStageForm((p) => ({ ...p, nextDatePreparation: e.target.value }))}
                        error={!!stageErrors.nextDatePreparation}
                        helperText={stageErrors.nextDatePreparation}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell />
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ListPlus size={16} />}
                        onClick={() => pushStageRow(setPendingStageRows)}
                      >
                        Add Stage Row
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            {pendingStageRows.length > 0 && (
              <Box sx={{ mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Stage</TableCell>
                      <TableCell>Next Date</TableCell>
                      <TableCell>Confirm By</TableCell>
                      <TableCell align="right">Delete</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingStageRows.map((r, idx) => (
                      <TableRow key={`${r.stageName}-${idx}`}>
                        <TableCell>{r.stageName}</TableCell>
                        <TableCell>{formatShortDate(r.nextDate)}</TableCell>
                        <TableCell>{getConfirmedByName(confirmedByOptions.find((u) => (u.id || u._id) === r.confirmedBy))}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="error" onClick={() => setPendingStageRows((p) => p.filter((_, i) => i !== idx))}>
                            <X size={16} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenAddStage(false)
                resetStageForm()
                resetPendingStageRows()
                setStageTargetCaseId(null)
              }}
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={handleAddStageSubmit} disabled={addingStage || pendingStageRows.length === 0}>
              {addingStage ? 'Saving...' : 'Save All Stages'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Modal */}
        <Dialog
          open={!!editId}
          onClose={() => {
            setEditId(null)
            setEditForm({})
            setEditErrors({})
            resetEditStageSection()
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Case</DialogTitle>
          <DialogContent>
            {singleLoading || !singleCase ? (
              <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
            ) : (
              <Grid container spacing={2} sx={{ pt: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Case Number *" value={editForm.caseNumber ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, caseNumber: e.target.value }))} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Case Type *" value={editForm.caseType ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, caseType: e.target.value }))} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Party Name *" value={editForm.partyName ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, partyName: e.target.value }))} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Court Premises</InputLabel>
                    <Select
                      value={editForm.courtName ?? ''}
                      label="Court Premises"
                      onChange={(e) => setEditForm((p) => ({ ...p, courtName: e.target.value || undefined }))}
                    >
                      <MenuItem value="">—</MenuItem>
                      {COURT_NAMES.map((cn) => <MenuItem key={cn} value={cn}>{cn}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Court Name"
                    value={editForm.courtPremises ?? ''}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        courtPremises: e.target.value.slice(0, 100) || undefined,
                      }))
                    }
                    inputProps={{ maxLength: 100 }}
                  />
                </Grid>
                {canShowAssignedTo && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        options={assignableOptions}
                        getOptionLabel={(opt) => getAssignableOptionLabel(opt, currentUser?.id)}
                        value={assignableOptions.find((o) => (o.id || o._id) === editForm.assignedTo) ?? null}
                        onChange={(_, v) => setEditForm((p) => ({ ...p, assignedTo: v ? (v.id || (v as { _id?: string })._id) || '' : '' }))}
                        renderInput={(params) => <TextField {...params} label="Assigned To" />}
                        isOptionEqualToValue={(o, v) => (o.id || o._id) === (v?.id || (v as { _id?: string })?._id)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField type="number" fullWidth label="Max Clients to Link" value={editForm.clientCount ?? 1} onChange={(e) => setEditForm((p) => ({ ...p, clientCount: Math.max(1, parseInt(e.target.value, 10) || 1) }))} inputProps={{ min: 1 }} />
                    </Grid>
                    <Grid item xs={12}>
                      <Autocomplete
                        multiple
                        options={clientsOptions}
                        getOptionLabel={(opt) => getClientDisplayName(opt)}
                        value={clientsOptions.filter((c) => (editForm.clients ?? []).includes(c.id || (c as { _id?: string })._id || ''))}
                        onChange={(_, v) => setEditForm((p) => ({ ...p, clients: v.map((c) => c.id || (c as { _id?: string })._id || '').slice(0, p.clientCount ?? 1) }))}
                        renderInput={(params) => <TextField {...params} label="Linked Clients" error={!!editErrors.clients} helperText={editErrors.clients} />}
                        isOptionEqualToValue={(o, v) => (o.id || (o as { _id?: string })._id) === (v?.id || (v as { _id?: string })?._id)}
                      />
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
                  <TextField fullWidth label="Notes" multiline rows={2} value={editForm.notes ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))} />
                </Grid>
                {canUpdate && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2">Stages</Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ListPlus size={16} />}
                        onClick={() => setShowEditStages((v) => !v)}
                      >
                        Stage
                      </Button>
                    </Box>

                    {showEditStages && (
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                            Current stages
                          </Typography>
                          {caseStages.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">No stage entries yet.</Typography>
                          ) : (
                            <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                              <Table size="small" stickyHeader>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Stage</TableCell>
                                    <TableCell>Next Date</TableCell>
                                    <TableCell>Confirmed By</TableCell>
                                    <TableCell align="right">Confirm</TableCell>
                                    <TableCell align="right">Edit</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {caseStages.map((s, idx) => {
                                    const sid = getCaseStageId(s)
                                    const canConfirmStage =
                                      !!editId &&
                                      !!sid &&
                                      !s.confirmedAt &&
                                      !!currentUser?.id &&
                                      getStageConfirmedByUserId(s) === currentUser.id
                                    return (
                                      <TableRow key={sid || `${s.stageName}-${idx}`}>
                                        <TableCell>{s.stageName || '—'}</TableCell>
                                        <TableCell>{formatShortDate(s.nextDate)}</TableCell>
                                        <TableCell>{getConfirmedByName(s.confirmedBy as string | { firstName?: string; lastName?: string; email?: string } | undefined)}</TableCell>
                                        <TableCell align="right">
                                          {s.confirmedAt ? (
                                            <Chip size="small" label="OK" color="success" variant="outlined" />
                                          ) : canConfirmStage && editId && sid ? (
                                            <Button
                                              size="small"
                                              variant="outlined"
                                              disabled={confirmingStage}
                                              onClick={() => handleConfirmStage(editId, sid)}
                                            >
                                              Confirm
                                            </Button>
                                          ) : (
                                            <Typography variant="caption" color="text.secondary">—</Typography>
                                          )}
                                        </TableCell>
                                        <TableCell align="right">
                                          <Button
                                            size="small"
                                            variant="text"
                                            disabled={!sid}
                                            onClick={() => {
                                              if (!sid) return
                                              setEditStageRowId(sid)
                                              setStageForm(caseStageToRequest(s))
                                              setStageErrors({})
                                            }}
                                          >
                                            Edit
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    )
                                  })}
                                </TableBody>
                              </Table>
                            </Box>
                          )}
                        </Box>

                        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                          <Box sx={{ px: 1, py: 0.5, display: 'flex', justifyContent: 'flex-end', bgcolor: 'action.hover' }}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setShowEditStages(false)
                                setEditStageRowId(null)
                                setEditModalPendingRows([])
                                resetStageForm()
                              }}
                            >
                              <X size={16} />
                            </IconButton>
                          </Box>
                          <Table size="small">
                            <TableBody>
                              <TableRow>
                                <TableCell sx={{ width: 180, color: 'text.secondary', fontWeight: 600 }}>Stage Name *</TableCell>
                                <TableCell>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    value={stageForm.stageName}
                                    onChange={(e) => setStageForm((p) => ({ ...p, stageName: e.target.value }))}
                                    error={!!stageErrors.stageName}
                                    helperText={stageErrors.stageName}
                                  />
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ width: 180, color: 'text.secondary', fontWeight: 600 }}>Today Summary *</TableCell>
                                <TableCell>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    multiline
                                    minRows={2}
                                    value={stageForm.todaySummary}
                                    onChange={(e) => setStageForm((p) => ({ ...p, todaySummary: e.target.value }))}
                                    error={!!stageErrors.todaySummary}
                                    helperText={stageErrors.todaySummary}
                                  />
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ width: 180, color: 'text.secondary', fontWeight: 600 }}>Next Date *</TableCell>
                                <TableCell>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    type="date"
                                    value={stageForm.nextDate}
                                    onChange={(e) => setStageForm((p) => ({ ...p, nextDate: e.target.value }))}
                                    error={!!stageErrors.nextDate}
                                    helperText={stageErrors.nextDate}
                                    InputLabelProps={{ shrink: true }}
                                  />
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ width: 180, color: 'text.secondary', fontWeight: 600 }}>Confirm By *</TableCell>
                                <TableCell>
                                  <Autocomplete
                                    options={confirmedByOptions}
                                    loading={caseAssigneesLoading}
                                    value={confirmedByOptions.find((u) => (u.id || u._id) === stageForm.confirmedBy) ?? null}
                                    onChange={(_, v) => setStageForm((p) => ({ ...p, confirmedBy: v ? (v.id || v._id || '') : '' }))}
                                    getOptionLabel={(opt) => [opt.firstName, opt.lastName].filter(Boolean).join(' ') || opt.email || ''}
                                    isOptionEqualToValue={(o, v) => (o.id || o._id) === (v?.id || v?._id)}
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                                        size="small"
                                        error={!!stageErrors.confirmedBy}
                                        helperText={stageErrors.confirmedBy}
                                      />
                                    )}
                                  />
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ width: 180, color: 'text.secondary', fontWeight: 600 }}>Next Date Purpose *</TableCell>
                                <TableCell>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    multiline
                                    minRows={2}
                                    value={stageForm.nextDatePurpose}
                                    onChange={(e) => setStageForm((p) => ({ ...p, nextDatePurpose: e.target.value }))}
                                    error={!!stageErrors.nextDatePurpose}
                                    helperText={stageErrors.nextDatePurpose}
                                  />
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ width: 180, color: 'text.secondary', fontWeight: 600 }}>Preparation For Next Date *</TableCell>
                                <TableCell>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    multiline
                                    minRows={2}
                                    value={stageForm.nextDatePreparation}
                                    onChange={(e) => setStageForm((p) => ({ ...p, nextDatePreparation: e.target.value }))}
                                    error={!!stageErrors.nextDatePreparation}
                                    helperText={stageErrors.nextDatePreparation}
                                  />
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell />
                                <TableCell>
                                  {editStageRowId ? (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                      <Button size="small" variant="contained" onClick={handleUpdateEditStage} disabled={updatingStage}>
                                        {updatingStage ? 'Saving…' : 'Save stage changes'}
                                      </Button>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => {
                                          setEditStageRowId(null)
                                          resetStageForm()
                                        }}
                                      >
                                        Cancel edit
                                      </Button>
                                    </Box>
                                  ) : (
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<ListPlus size={16} />}
                                      onClick={() => pushStageRow(setEditModalPendingRows)}
                                    >
                                      Add Stage Row
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Box>

                        {editModalPendingRows.length > 0 && (
                          <Box sx={{ mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                            <Table size="small" stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Stage</TableCell>
                                  <TableCell>Next Date</TableCell>
                                  <TableCell>Confirm By</TableCell>
                                  <TableCell align="right">Delete</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {editModalPendingRows.map((r, idx) => (
                                  <TableRow key={`${r.stageName}-${idx}`}>
                                    <TableCell>{r.stageName}</TableCell>
                                    <TableCell>{formatShortDate(r.nextDate)}</TableCell>
                                    <TableCell>{getConfirmedByName(confirmedByOptions.find((u) => (u.id || u._id) === r.confirmedBy))}</TableCell>
                                    <TableCell align="right">
                                      <IconButton size="small" color="error" onClick={() => setEditModalPendingRows((p) => p.filter((_, i) => i !== idx))}>
                                        <X size={16} />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
                              <Button variant="contained" size="small" onClick={handleSaveEditModalNewStages} disabled={addingStage}>
                                {addingStage ? 'Saving…' : 'Save new stages'}
                              </Button>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setEditId(null)
                setEditForm({})
                setEditErrors({})
                resetEditStageSection()
              }}
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={handleEditSubmit} disabled={updating}>Save</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirm */}
        <Dialog open={!!deleteCase} onClose={() => setDeleteCase(null)} maxWidth="xs" fullWidth>
          <DialogTitle>Delete Case</DialogTitle>
          <DialogContent>
            {deleteCase && (
              <Typography>Are you sure you want to delete <strong>{deleteCase.caseNumber}</strong>? This can be restored later.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteCase(null)}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleDeleteConfirm} disabled={deleting} startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon size={16} />}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Actions Menu */}
        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={closeMenu} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
          {canRead && menuCase && (
            <MenuItem onClick={() => openView(menuCase.id || (menuCase as { _id?: string })._id || '')}>
              <ListItemIcon><Eye size={18} /></ListItemIcon>
              <ListItemText>View</ListItemText>
            </MenuItem>
          )}
          {viewTab === 'active' && canUpdate && menuCase && (
            <MenuItem
              onClick={() => {
                const id = menuCase.id || (menuCase as { _id?: string })._id || ''
                closeMenu()
                resetStageForm()
                resetPendingStageRows()
                setStageTargetCaseId(id || null)
                setOpenAddStage(true)
              }}
            >
              <ListItemIcon><ListPlus size={18} /></ListItemIcon>
              <ListItemText>Add Stage</ListItemText>
            </MenuItem>
          )}
          {viewTab === 'active' && canUpdate && menuCase && (
            <MenuItem onClick={() => openEdit(menuCase.id || (menuCase as { _id?: string })._id || '')}>
              <ListItemIcon><EditIcon size={18} /></ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
          )}
          {viewTab === 'active' && canUpdate && menuCase && (
            <MenuItem onClick={() => menuCase && handleArchive(menuCase)}>
              <ListItemIcon><Archive size={18} /></ListItemIcon>
              <ListItemText>Archive</ListItemText>
            </MenuItem>
          )}
          {viewTab === 'archived' && canUpdate && menuCase && (
            <MenuItem onClick={() => menuCase && handleUnarchive(menuCase)}>
              <ListItemIcon><ArchiveRestore size={18} /></ListItemIcon>
              <ListItemText>Unarchive</ListItemText>
            </MenuItem>
          )}
          {canDelete && menuCase && (
            <MenuItem onClick={() => openDelete(menuCase)} sx={{ color: 'error.main' }}>
              <ListItemIcon><DeleteIcon size={18} /></ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          )}
        </Menu>

        <ExcelImportDialog
          open={openExcelImport}
          title="Import Cases (Excel)"
          previewPath="/api/cases/excel/preview"
          importPath="/api/cases/excel/import"
          onClose={() => setOpenExcelImport(false)}
          onImported={() => refetchCases()}
          disabled={!canCreate}
        />
      </Box>
    </ProtectedRoute>
  )
}
