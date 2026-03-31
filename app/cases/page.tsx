'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  FolderOpen,
  Plus,
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
  Calendar,
  Scale,
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useModulePermissions } from '@/hooks/useModulePermissions'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
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
  COURT_NAMES,
  COURT_PREMISES,
  CASE_TYPES,
  type Case as CaseType,
  type CreateCaseRequest,
  type UpdateCaseRequest,
  type GetCasesRequest,
} from '@/redux/api/casesApi'
import { useGetClientsQuery } from '@/redux/api/clientsApi'
import { useGetAssignableUsersQuery, type User } from '@/redux/api/userApi'
import toast from 'react-hot-toast'

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

function getAssignableOptionLabel(opt: AssignableOption, currentUserId?: string): string {
  const name = [opt.firstName, opt.lastName].filter(Boolean).join(' ').trim() || opt.email || ''
  const id = opt.id || opt._id
  return id === currentUserId ? `${name} (Me)` : `${name} (${opt.email || ''})`
}

export default function CasesPage() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const { canRead, canCreate, canUpdate, canDelete, canAssignee } = useModulePermissions('case')
  const canShowAssignedTo = canAssignee || currentUser?.assigneePermissions?.canAssignCase === true

  const [caseNumberSearch, setCaseNumberSearch] = useState('')
  const [debouncedCaseNumber, setDebouncedCaseNumber] = useState('')
  const [caseTypeFilter, setCaseTypeFilter] = useState<string>('')
  const [viewTab, setViewTab] = useState<'active' | 'archived' | 'deleted'>('active')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [deletedPaginationModel, setDeletedPaginationModel] = useState({ page: 0, pageSize: 10 })

  const [openCreate, setOpenCreate] = useState(false)
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

  const [createCase, { isLoading: creating }] = useCreateCaseMutation()
  const [updateCase, { isLoading: updating }] = useUpdateCaseMutation()
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
    stage: '',
    courtName: '',
    courtPremises: '',
    assignedTo: '',
    clientCount: 1,
    clients: [],
    notes: '',
  })
  const [createErrors, setCreateErrors] = useState<Partial<Record<keyof CreateCaseRequest, string>>>({})

  const [editForm, setEditForm] = useState<UpdateCaseRequest>({})
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  const resetCreateForm = () => {
    setCreateForm({
      caseNumber: '',
      caseType: '',
      partyName: '',
      stage: '',
      courtName: '',
      courtPremises: '',
      assignedTo: '',
      clientCount: 1,
      clients: [],
      notes: '',
    })
    setCreateErrors({})
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
      stage: createForm.stage?.trim() || undefined,
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
      await createCase(payload).unwrap()
      toast.success('Case created')
      setOpenCreate(false)
      resetCreateForm()
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
      refetchCases()
    } catch (err: unknown) {
      const et = err as { status?: number; data?: { error?: string; message?: string } }
      toast.error(et?.status === 403 ? "You don't have permission" : (et?.data?.error ?? et?.data?.message ?? 'Update failed'))
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
    closeMenu()
  }
  const openEdit = (id: string) => {
    setEditId(id)
    setEditForm({})
    setEditErrors({})
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
      stage: singleCase.stage ?? '',
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
          {canCreate && viewTab === 'active' && (
            <Button variant="contained" startIcon={<Plus />} onClick={() => { setOpenCreate(true); resetCreateForm(); }} sx={{ minWidth: { xs: '100%', sm: 'auto' } }}>
              Add Case
            </Button>
          )}
        </Box>

        <Tabs value={viewTab} onChange={(_, v: 'active' | 'archived' | 'deleted') => setViewTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Active" value="active" icon={<Scale size={18} />} iconPosition="start" />
          <Tab label="Archive" value="archived" icon={<Archive size={18} />} iconPosition="start" />
          <Tab label="Deleted" value="deleted" icon={<Trash2 size={18} />} iconPosition="start" />
        </Tabs>

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
                  <Typography variant="body1" color="text.secondary">
                    {canShowAssignedTo ? 'No active cases or no cases assigned to you' : 'No active cases'}
                  </Typography>
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
        <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="md" fullWidth>
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
                <TextField fullWidth label="Stage" value={createForm.stage} onChange={(e) => setCreateForm((p) => ({ ...p, stage: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Court Name</InputLabel>
                  <Select value={createForm.courtName || ''} label="Court Name" onChange={(e) => setCreateForm((p) => ({ ...p, courtName: e.target.value || undefined }))}>
                    <MenuItem value="">—</MenuItem>
                    {COURT_NAMES.map((cn) => (
                      <MenuItem key={cn} value={cn}>{cn}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Court Premises</InputLabel>
                  <Select value={createForm.courtPremises || ''} label="Court Premises" onChange={(e) => setCreateForm((p) => ({ ...p, courtPremises: e.target.value || undefined }))}>
                    <MenuItem value="">—</MenuItem>
                    {COURT_PREMISES.map((cp) => (
                      <MenuItem key={cp} value={cp}>{cp}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateSubmit} disabled={creating}>Create</Button>
          </DialogActions>
        </Dialog>

        {/* View Modal */}
        <Dialog open={!!viewId} onClose={() => setViewId(null)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Case Details</Typography>
              {singleCase?.deletedAt && <Chip label={`Deleted on ${formatDeletedDate(singleCase.deletedAt)}`} size="small" color="error" variant="outlined" />}
              <IconButton onClick={() => setViewId(null)} size="small"><X /></IconButton>
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
                <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Stage</Typography><Typography variant="body1">{singleCase.stage || '—'}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Court Name</Typography><Typography variant="body1">{singleCase.courtName || '—'}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Court Premises</Typography><Typography variant="body1">{singleCase.courtPremises || '—'}</Typography></Grid>
                {(canRead || canShowAssignedTo) && (
                  <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Assigned To</Typography><Typography variant="body1">{getAssignedToName(singleCase.assignedTo)}</Typography></Grid>
                )}
                {canShowAssignedTo && (
                  <Grid item xs={12}><Typography variant="caption" color="text.secondary">Linked Clients</Typography><Typography variant="body1">{getClientsDisplay(singleCase.clients)}</Typography></Grid>
                )}
                {singleCase.notes && <Grid item xs={12}><Typography variant="caption" color="text.secondary">Notes</Typography><Typography variant="body1">{singleCase.notes}</Typography></Grid>}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            {singleCase?.deletedAt && canUpdate && (
              <Button variant="contained" color="success" startIcon={<RotateCcw size={16} />} onClick={async () => { if (singleCase && (await handleRestore(singleCase))) setViewId(null) }} disabled={restoring}>Restore</Button>
            )}
            <Button onClick={() => setViewId(null)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={!!editId} onClose={() => { setEditId(null); setEditForm({}); setEditErrors({}); }} maxWidth="md" fullWidth>
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
                  <TextField fullWidth label="Stage" value={editForm.stage ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, stage: e.target.value }))} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Court Name</InputLabel>
                    <Select value={editForm.courtName ?? ''} label="Court Name" onChange={(e) => setEditForm((p) => ({ ...p, courtName: e.target.value || undefined }))}>
                      <MenuItem value="">—</MenuItem>
                      {COURT_NAMES.map((cn) => <MenuItem key={cn} value={cn}>{cn}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Court Premises</InputLabel>
                    <Select value={editForm.courtPremises ?? ''} label="Court Premises" onChange={(e) => setEditForm((p) => ({ ...p, courtPremises: e.target.value || undefined }))}>
                      <MenuItem value="">—</MenuItem>
                      {COURT_PREMISES.map((cp) => <MenuItem key={cp} value={cp}>{cp}</MenuItem>)}
                    </Select>
                  </FormControl>
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
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setEditId(null); setEditForm({}); setEditErrors({}); }}>Cancel</Button>
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
      </Box>
    </ProtectedRoute>
  )
}
