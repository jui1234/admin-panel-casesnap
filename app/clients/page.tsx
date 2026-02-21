'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  Building,
  Plus,
  Search,
  Filter,
  Eye,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone,
  Mail,
  X,
  MoreVertical,
  RotateCcw,
  Archive,
  ArchiveRestore,
  Upload,
  Download,
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useModulePermissions } from '@/hooks/useModulePermissions'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  CircularProgress,
  LinearProgress,
  Menu,
  ListItemIcon,
  ListItemText,
  Autocomplete,
} from '@mui/material'
import {
  useGetClientsQuery,
  useGetClientByIdQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useRestoreClientMutation,
  useArchiveClientMutation,
  useUnarchiveClientMutation,
  type Client,
  type ClientStatus,
  type CreateClientRequest,
  type UpdateClientRequest,
} from '@/redux/api/clientsApi'
import { useGetAssignableUsersQuery, type User } from '@/redux/api/userApi'
import toast from 'react-hot-toast'

const CLIENT_STATUSES: ClientStatus[] = ['active', 'inactive', 'prospect', 'archived']
const AADHAR_IMAGE_MAX_BYTES = 1048576 // 1 MB
const UPLOAD_API_URL = process.env.NEXT_PUBLIC_UPLOAD_API_URL || 'http://localhost:5004/api/upload'

function getFeesUnit(fees: number | undefined): string {
  if (fees == null || fees === 0) return ''
  const num = Number(fees)
  if (isNaN(num)) return ''
  const format = (value: number, unit: string) =>
    value >= 1000 ? `${Math.round(value)} ${unit}` : value >= 100 ? `${Math.round(value)} ${unit}` : value >= 10 ? `${value.toFixed(1)} ${unit}` : `${value.toFixed(0)} ${unit}`
  if (num >= 10000000) return format(num / 10000000, 'Cr')
  if (num >= 100000) return format(num / 100000, 'L')
  if (num >= 1000) return format(num / 1000, 'K')
  return `${num.toFixed(0)}`
}

function getAssignedToName(a: string | { id?: string; firstName?: string; lastName?: string; email?: string } | undefined): string {
  if (!a) return '—'
  if (typeof a === 'string') return a
  const n = [a.firstName, a.lastName].filter(Boolean).join(' ')
  return n || a.email || '—'
}

function getClientFullName(c: Client): string {
  return c.fullName || [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email || '—'
}

type AssignableOption = User & { _id?: string }

function getAssignableOptionLabel(opt: AssignableOption, currentUserId?: string): string {
  const name = [opt.firstName, opt.lastName].filter(Boolean).join(' ').trim() || opt.email || ''
  const id = opt.id || opt._id
  return id === currentUserId ? `${name} (Me)` : `${name} (${opt.email || ''})`
}

export default function ClientsPage() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const { canRead, canCreate, canUpdate, canDelete, canAssignee } = useModulePermissions('client')
  const canShowAssignedTo =
    canAssignee || currentUser?.assigneePermissions?.canAssignClient === true
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  const [openCreate, setOpenCreate] = useState(false)
  const [viewId, setViewId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteClient, setDeleteClient] = useState<Client | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuClient, setMenuClient] = useState<Client | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 500)
    return () => clearTimeout(t)
  }, [searchTerm])

  const [assignableSearchInput, setAssignableSearchInput] = useState('')
  const [assignableSearchDebounced, setAssignableSearchDebounced] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setAssignableSearchDebounced(assignableSearchInput), 400)
    return () => clearTimeout(t)
  }, [assignableSearchInput])

  const { data: assignableData, isLoading: assignableLoading } = useGetAssignableUsersQuery(
    canShowAssignedTo ? { search: assignableSearchDebounced || undefined, limit: 50 } : undefined,
    { skip: !canShowAssignedTo }
  )

  useEffect(() => {
    if (openCreate || editId) setAssignableSearchInput('')
  }, [openCreate, editId])

  const clientsParams = {
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter === 'all' ? undefined : (statusFilter as ClientStatus),
    sortBy: 'createdAt',
    sortOrder: 'desc' as const,
    includeDeleted: includeDeleted || undefined,
  }

  const {
    data: clientsRes,
    isLoading: clientsLoading,
    error: clientsError,
    refetch: refetchClients,
  } = useGetClientsQuery(clientsParams)

  const clients = clientsRes?.data ?? []
  const totalClients = clientsRes?.total ?? 0

  const { data: singleRes, isLoading: singleLoading } = useGetClientByIdQuery(
    { clientId: viewId || editId || '' },
    { skip: !viewId && !editId }
  )
  const singleClient = singleRes?.data

  const assignableOptions = useMemo((): AssignableOption[] => {
    if (!canShowAssignedTo) return []
    const list: AssignableOption[] = []
    const seen = new Set<string>()
    if (currentUser?.id) {
      const meOption: AssignableOption = {
        id: currentUser.id,
        _id: currentUser.id,
        firstName: currentUser.firstName ?? '',
        lastName: currentUser.lastName ?? '',
        email: currentUser.email || '',
        role: ('role' in currentUser && currentUser.role != null ? currentUser.role : '') as User['role'],
        status: 'approved',
        createdAt: ('createdAt' in currentUser && typeof (currentUser as { createdAt?: string }).createdAt === 'string' ? (currentUser as { createdAt: string }).createdAt : '') as string,
        updatedAt: ('updatedAt' in currentUser && typeof (currentUser as { updatedAt?: string }).updatedAt === 'string' ? (currentUser as { updatedAt: string }).updatedAt : '') as string,
      }
      list.push(meOption)
      seen.add(currentUser.id)
    }
    ;(assignableData?.data ?? []).forEach((u) => {
      const id = u.id || (u as { _id?: string })._id
      if (id && !seen.has(id)) {
        seen.add(id)
        list.push(u as AssignableOption)
      }
    })
    if (editId && singleClient?.assignedTo && typeof singleClient.assignedTo === 'object') {
      const a = singleClient.assignedTo
      const id = a.id || (a as { _id?: string })._id
      if (id && !seen.has(id)) {
        seen.add(id)
        list.push({
          id,
          _id: id,
          firstName: a.firstName ?? '',
          lastName: a.lastName ?? '',
          email: a.email ?? '',
          role: '',
          status: 'approved',
          createdAt: '',
          updatedAt: '',
        } as AssignableOption)
      }
    }
    return list
  }, [canShowAssignedTo, currentUser, assignableData?.data, editId, singleClient?.assignedTo])

  const assignedToOptions = assignableOptions

  const [createClient, { isLoading: creating }] = useCreateClientMutation()
  const [updateClient, { isLoading: updating }] = useUpdateClientMutation()
  const [deleteClientFn, { isLoading: deleting }] = useDeleteClientMutation()
  const [restoreClientFn, { isLoading: restoring }] = useRestoreClientMutation()
  const [archiveClientFn, { isLoading: archiving }] = useArchiveClientMutation()
  const [unarchiveClientFn, { isLoading: unarchiving }] = useUnarchiveClientMutation()

  useEffect(() => {
    if (!clientsLoading && clientsError && 'status' in clientsError) {
      const status = (clientsError as { status?: number }).status
      const msg = String((clientsError as { data?: { error?: string; message?: string } })?.data?.error ?? (clientsError as { data?: { message?: string } })?.data?.message ?? '')
      if (status === 403 || /permission|access denied/i.test(msg)) {
        router.push('/403')
      }
    }
  }, [clientsError, clientsLoading, router])

  const [createForm, setCreateForm] = useState<CreateClientRequest>({
    firstName: '',
    lastName: '',
    phone: '',
    fees: undefined,
    email: '',
    streetAddress: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'India',
    aadharCardNumber: '',
    status: 'active',
    assignedTo: '',
    notes: '',
  })
  const [createErrors, setCreateErrors] = useState<Partial<Record<keyof CreateClientRequest, string>>>({})
  const [aadharFile, setAadharFile] = useState<File | null>(null)
  const [aadharFileError, setAadharFileError] = useState<string>('')
  const [aadharUploading, setAadharUploading] = useState(false)

  const [editForm, setEditForm] = useState<UpdateClientRequest>({})
  const [aadharEditFile, setAadharEditFile] = useState<File | null>(null)
  const [aadharEditFileError, setAadharEditFileError] = useState<string>('')
  const [aadharPreviewUrl, setAadharPreviewUrl] = useState<string | null>(null)
  const [aadharEditPreviewUrl, setAadharEditPreviewUrl] = useState<string | null>(null)
  const [viewAadharImageLoaded, setViewAadharImageLoaded] = useState(false)
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  const resetCreateForm = () => {
    setCreateForm({
      firstName: '',
      lastName: '',
      phone: '',
      fees: undefined,
      email: '',
      streetAddress: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'India',
      aadharCardNumber: '',
      status: 'active',
      assignedTo: '',
      notes: '',
    })
    setCreateErrors({})
    setAadharFile(null)
    setAadharFileError('')
  }

  useEffect(() => {
    if (!aadharFile) {
      setAadharPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(aadharFile)
    setAadharPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [aadharFile])

  useEffect(() => {
    if (!aadharEditFile) {
      setAadharEditPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(aadharEditFile)
    setAadharEditPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [aadharEditFile])

  useEffect(() => {
    if (singleClient?.aadharImageUrl) setViewAadharImageLoaded(false)
  }, [singleClient?.aadharImageUrl])

  const handleAadharFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0]
    if (!file) {
      if (isEdit) { setAadharEditFile(null); setAadharEditFileError('') }
      else { setAadharFile(null); setAadharFileError('') }
      return
    }
    if (file.size > AADHAR_IMAGE_MAX_BYTES) {
      if (isEdit) { setAadharEditFile(null); setAadharEditFileError('Image must be 1 MB or less') }
      else { setAadharFile(null); setAadharFileError('Image must be 1 MB or less') }
      e.target.value = ''
      return
    }
    if (isEdit) { setAadharEditFile(file); setAadharEditFileError('') }
    else { setAadharFile(file); setAadharFileError('') }
    e.target.value = ''
  }

  const handleFeesChange = (value: string) => {
    const numbersOnly = value.replace(/[^0-9.]/g, '')
    const parts = numbersOnly.split('.')
    const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numbersOnly
    const num = formatted === '' ? undefined : parseFloat(formatted)
    setCreateForm((p) => ({ ...p, fees: num != null && !isNaN(num) ? num : undefined }))
  }

  const capitalizeFirst = (s: string) => (s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s)

  const validateCreate = (): boolean => {
    const e: typeof createErrors = {}
    if (!createForm.firstName?.trim()) e.firstName = 'First name is required'
    if (!createForm.lastName?.trim()) e.lastName = 'Last name is required'
    if (!createForm.email?.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) e.email = 'Invalid email'
    if (!createForm.phone?.trim()) e.phone = 'Phone is required'
    else if (!/^\d{10}$/.test(createForm.phone.replace(/\D/g, ''))) e.phone = 'Phone must be 10 digits'
    if (aadharFile && aadharFile.size > AADHAR_IMAGE_MAX_BYTES) setAadharFileError('Image must be 1 MB or less')
    setCreateErrors(e)
    return Object.keys(e).length === 0 && !(aadharFile && aadharFile.size > AADHAR_IMAGE_MAX_BYTES)
  }

  const handleCreateSubmit = async () => {
    if (!canCreate) {
      toast.error("You don't have permission to create clients")
      return
    }
    if (!validateCreate()) return
    const payload: CreateClientRequest = {
      ...createForm,
      firstName: createForm.firstName.trim(),
      lastName: createForm.lastName.trim(),
      email: createForm.email.trim(),
      phone: createForm.phone.replace(/\D/g, '').slice(0, 10),
      fees: createForm.fees != null && createForm.fees > 0 ? createForm.fees : undefined,
      streetAddress: createForm.streetAddress?.trim() || undefined,
      city: createForm.city?.trim() || undefined,
      province: createForm.province?.trim() || undefined,
      postalCode: createForm.postalCode?.trim() || undefined,
      country: createForm.country?.trim() || undefined,
      aadharCardNumber: createForm.aadharCardNumber?.trim() || undefined,
      assignedTo: createForm.assignedTo || undefined,
      notes: createForm.notes?.trim() || undefined,
    }
    if (aadharFile && aadharFile.size <= AADHAR_IMAGE_MAX_BYTES) {
      payload.aadharImageSize = aadharFile.size
      try {
        setAadharUploading(true)
        await new Promise((r) => setTimeout(r, 100))
        const formData = new FormData()
        formData.append('file', aadharFile)
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') || localStorage.getItem('token') : ''
        const uploadRes = await fetch(UPLOAD_API_URL, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        if (!uploadRes.ok) {
          const errBody = await uploadRes.json().catch(() => ({}))
          const errMsg = errBody?.error ?? errBody?.message ?? `Upload failed (${uploadRes.status})`
          toast.error(errMsg)
          setAadharUploading(false)
          return
        }
        const json = await uploadRes.json()
        payload.aadharImageUrl = json.url ?? json.data?.url ?? json.data?.fileUrl
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Aadhar image upload failed')
        setAadharUploading(false)
        return
      } finally {
        setAadharUploading(false)
      }
    }
    try {
      const res = await createClient(payload).unwrap()
      toast.success(res.message || 'Client created')
      if (res.warning) toast(res.warning, { icon: '⚠️' })
      setOpenCreate(false)
      resetCreateForm()
      refetchClients()
    } catch (err: unknown) {
      const et = err as { status?: number; data?: { error?: string; message?: string } }
      const msg = et?.data?.error ?? et?.data?.message ?? 'Create failed'
      if (et?.status === 403) toast.error("You don't have permission to create clients")
      else toast.error(msg)
    }
  }

  const handleEditSubmit = async () => {
    if (!editId || !canUpdate) {
      if (!canUpdate) toast.error("You don't have permission to update clients")
      return
    }
    const e: Record<string, string> = {}
    if (editForm.email != null && editForm.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) e.email = 'Invalid email'
    if (editForm.phone != null && editForm.phone.trim() && !/^\d{10}$/.test(editForm.phone.replace(/\D/g, ''))) e.phone = 'Phone must be 10 digits'
    setEditErrors(e)
    if (Object.keys(e).length) return
    const payload: UpdateClientRequest = { ...editForm }
    if (payload.phone != null) payload.phone = String(payload.phone).replace(/\D/g, '').slice(0, 10)
    if (aadharEditFile && aadharEditFile.size <= AADHAR_IMAGE_MAX_BYTES) {
      payload.aadharImageSize = aadharEditFile.size
      try {
        setAadharUploading(true)
        await new Promise((r) => setTimeout(r, 100))
        const formData = new FormData()
        formData.append('file', aadharEditFile)
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') || localStorage.getItem('token') : ''
        const uploadRes = await fetch(UPLOAD_API_URL, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        if (!uploadRes.ok) {
          const errBody = await uploadRes.json().catch(() => ({}))
          const errMsg = errBody?.error ?? errBody?.message ?? `Upload failed (${uploadRes.status})`
          toast.error(errMsg)
          setAadharUploading(false)
          return
        }
        const json = await uploadRes.json()
        payload.aadharImageUrl = json.url ?? json.data?.url ?? json.data?.fileUrl
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Aadhar image upload failed')
        setAadharUploading(false)
        return
      } finally {
        setAadharUploading(false)
      }
    }
    try {
      await updateClient({ clientId: editId, data: payload }).unwrap()
      toast.success('Client updated')
      setEditId(null)
      setEditForm({})
      setEditErrors({})
      refetchClients()
    } catch (err: unknown) {
      const et = err as { status?: number; data?: { error?: string; message?: string } }
      const msg = et?.data?.error ?? et?.data?.message ?? 'Update failed'
      if (et?.status === 403) toast.error("You don't have permission to update clients")
      else toast.error(msg)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteClient || !canDelete) {
      if (!canDelete) toast.error("You don't have permission to delete clients")
      return
    }
    const id = deleteClient.id || (deleteClient as { _id?: string })._id
    if (!id) return
    try {
      await deleteClientFn({ clientId: id }).unwrap()
      toast.success('Client deleted')
      setDeleteClient(null)
      refetchClients()
    } catch (err: unknown) {
      const et = err as { status?: number; data?: { error?: string; message?: string } }
      const msg = et?.data?.error ?? et?.data?.message ?? 'Delete failed'
      if (et?.status === 403) toast.error("You don't have permission to delete clients")
      else toast.error(msg)
    }
  }

  const handleRestore = async (c: Client) => {
    if (!canUpdate) {
      toast.error("You don't have permission to restore clients")
      return
    }
    const id = c.id || (c as { _id?: string })._id
    if (!id) return
    try {
      await restoreClientFn({ clientId: id }).unwrap()
      toast.success('Client restored')
      setMenuClient(null)
      setAnchorEl(null)
      refetchClients()
    } catch (err: unknown) {
      const et = err as { status?: number; data?: { error?: string; message?: string } }
      toast.error(et?.status === 403 ? "You don't have permission" : (et?.data?.error ?? et?.data?.message ?? 'Restore failed'))
    }
  }

  const handleArchive = async (c: Client) => {
    if (!canUpdate) {
      toast.error("You don't have permission to archive clients")
      return
    }
    const id = c.id || (c as { _id?: string })._id
    if (!id) return
    try {
      await archiveClientFn({ clientId: id }).unwrap()
      toast.success('Client archived')
      setMenuClient(null)
      setAnchorEl(null)
      refetchClients()
    } catch (err: unknown) {
      const et = err as { status?: number; data?: { error?: string; message?: string } }
      toast.error(et?.status === 403 ? "You don't have permission" : (et?.data?.error ?? et?.data?.message ?? 'Archive failed'))
    }
  }

  const handleUnarchive = async (c: Client) => {
    if (!canUpdate) {
      toast.error("You don't have permission to unarchive clients")
      return
    }
    const id = c.id || (c as { _id?: string })._id
    if (!id) return
    try {
      await unarchiveClientFn({ clientId: id }).unwrap()
      toast.success('Client unarchived')
      setMenuClient(null)
      setAnchorEl(null)
      refetchClients()
    } catch (err: unknown) {
      const et = err as { status?: number; data?: { error?: string; message?: string } }
      toast.error(et?.status === 403 ? "You don't have permission" : (et?.data?.error ?? et?.data?.message ?? 'Unarchive failed'))
    }
  }

  const openMenu = (ev: React.MouseEvent<HTMLElement>, row: Client) => {
    setAnchorEl(ev.currentTarget)
    setMenuClient(row)
  }
  const closeMenu = () => {
    setAnchorEl(null)
    setMenuClient(null)
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
  const openDelete = (c: Client) => {
    setDeleteClient(c)
    closeMenu()
  }

  useEffect(() => {
    if (!singleClient || !editId) return
    const assignedId = typeof singleClient.assignedTo === 'string'
      ? singleClient.assignedTo
      : (singleClient.assignedTo?.id || (singleClient.assignedTo as { _id?: string })?._id)
    setEditForm({
      firstName: singleClient.firstName,
      lastName: singleClient.lastName,
      email: singleClient.email,
      phone: singleClient.phone,
      fees: singleClient.fees,
      streetAddress: singleClient.streetAddress,
      city: singleClient.city,
      province: singleClient.province,
      postalCode: singleClient.postalCode,
      country: singleClient.country,
      aadharCardNumber: singleClient.aadharCardNumber,
      status: singleClient.status,
      assignedTo: assignedId || undefined,
      notes: singleClient.notes,
    })
    if (assignedId && canShowAssignedTo) {
      const opt = { id: assignedId, _id: assignedId, firstName: (singleClient.assignedTo as { firstName?: string })?.firstName ?? '', lastName: (singleClient.assignedTo as { lastName?: string })?.lastName ?? '', email: (singleClient.assignedTo as { email?: string })?.email ?? '' }
      setAssignableSearchInput(getAssignableOptionLabel(opt as AssignableOption, currentUser?.id))
    } else {
      setAssignableSearchInput('')
    }
  }, [singleClient, editId, canShowAssignedTo, currentUser?.id])

  const getStatusColor = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'error'
      case 'prospect':
        return 'warning'
      case 'archived':
        return 'default'
      default:
        return 'default'
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'client',
      headerName: 'Client',
      width: 260,
      renderCell: (params) => {
        const r = params.row as Client
        const name = getClientFullName(r)
        const initials = [r.firstName?.[0], r.lastName?.[0]].filter(Boolean).join('').toUpperCase() || r.email?.[0]?.toUpperCase() || '?'
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>{initials}</Avatar>
            <Box>
              <Typography variant="body2" fontWeight={500}>{name}</Typography>
              <Typography variant="caption" color="text.secondary">{r.email}</Typography>
            </Box>
          </Box>
        )
      },
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 130,
      renderCell: (params) => <Typography variant="body2">{(params.row as Client).phone || '—'}</Typography>,
    },
    {
      field: 'fees',
      headerName: 'Fees',
      width: 110,
      renderCell: (params) => {
        const f = (params.row as Client).fees
        return <Typography variant="body2">{f != null ? `₹${f.toLocaleString()}` : '—'}</Typography>
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={String((params.row as Client).status || '—')}
          color={getStatusColor((params.row as Client).status) as 'success' | 'error' | 'warning' | 'default'}
          size="small"
          variant="outlined"
        />
      ),
    },
    ...(canRead || canShowAssignedTo
      ? [
          {
            field: 'assignedTo',
            headerName: 'Assigned To',
            width: 160,
            renderCell: (params) => (
              <Typography variant="body2" color="text.secondary">
                {getAssignedToName((params.row as Client).assignedTo)}
              </Typography>
            ),
          },
        ]
      : []),
    ...(canRead || canUpdate || canDelete
      ? [
          {
            field: 'actions',
            headerName: 'Actions',
            width: 70,
            sortable: false,
            filterable: false,
            renderCell: (params: { row: Client }) => (
              <IconButton size="small" onClick={(e) => openMenu(e, params.row)}>
                <MoreVertical size={18} />
              </IconButton>
            ),
          },
        ]
      : []),
  ]

  const activeCount = clients.filter((c) => c.status === 'active').length
  const prospectCount = clients.filter((c) => c.status === 'prospect').length
  const archivedCount = clients.filter((c) => c.status === 'archived').length

  return (
    <ProtectedRoute>
      <Box sx={{ p: 3 }}>
          <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Client List
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage client relationships and information
              </Typography>
            </Box>
            {canCreate && (
              <Button variant="contained" startIcon={<Plus />} onClick={() => { setOpenCreate(true); resetCreateForm(); }} sx={{ minWidth: { xs: '100%', sm: 'auto' } }}>
                Add Client
              </Button>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchTerm('')}>
                          <X size={18} />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={8}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Button variant="outlined" size="small" startIcon={<Filter />} onClick={() => setShowFilters(!showFilters)}>
                    Filters
                  </Button>
                  {showFilters && (
                    <>
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Status</InputLabel>
                        <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                          <MenuItem value="all">All</MenuItem>
                          {CLIENT_STATUSES.map((s) => (
                            <MenuItem key={s} value={s}>{capitalizeFirst(s)}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Button
                        size="small"
                        variant={includeDeleted ? 'contained' : 'outlined'}
                        onClick={() => setIncludeDeleted((p) => !p)}
                      >
                        Include deleted
                      </Button>
                      {(statusFilter !== 'all' || includeDeleted) && (
                        <Button size="small" variant="outlined" startIcon={<X />} onClick={() => { setStatusFilter('all'); setIncludeDeleted(false); }}>
                          Clear
                        </Button>
                      )}
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ p: 1, bgcolor: 'primary.100', borderRadius: 1, mr: 2 }}>
                      <Building size={24} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Total</Typography>
                      <Typography variant="h6" fontWeight={600}>{totalClients}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ p: 1, bgcolor: 'success.100', borderRadius: 1, mr: 2 }}>
                      <Building size={24} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Active</Typography>
                      <Typography variant="h6" fontWeight={600}>{activeCount}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ p: 1, bgcolor: 'warning.100', borderRadius: 1, mr: 2 }}>
                      <Building size={24} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Prospects</Typography>
                      <Typography variant="h6" fontWeight={600}>{prospectCount}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ p: 1, bgcolor: 'grey.200', borderRadius: 1, mr: 2 }}>
                      <Building size={24} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Archived</Typography>
                      <Typography variant="h6" fontWeight={600}>{archivedCount}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card>
            <Box sx={{ height: 600, width: '100%' }}>
              {clientsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : clientsError ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: 2 }}>
                  <Alert severity="error">{(clientsError as { data?: { error?: string; message?: string } })?.data?.error ?? (clientsError as { message?: string })?.message ?? 'Failed to load clients'}</Alert>
                  <Button variant="contained" onClick={() => refetchClients()}>Retry</Button>
                </Box>
              ) : (
                <DataGrid
                  rows={clients}
                  columns={columns}
                  getRowId={(r) => (r as Client).id || (r as Client)._id || ''}
                  rowCount={totalClients}
                  paginationMode="server"
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  pageSizeOptions={[5, 10, 25, 50]}
                  disableRowSelectionOnClick
                  sx={{ '& .MuiDataGrid-cell:focus': { outline: 'none' } }}
                />
              )}
            </Box>
          </Card>
        </Box>

        {/* Create Client Modal */}
        <Dialog open={openCreate} onClose={() => !aadharUploading && setOpenCreate(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Add Client</Typography>
              <IconButton onClick={() => setOpenCreate(false)} size="small" disabled={aadharUploading}><X /></IconButton>
            </Box>
          </DialogTitle>
          {aadharUploading && (
            <Box sx={{ px: 3, pt: 0, pb: 1 }}>
              <Alert severity="info" icon={<CircularProgress size={20} />} sx={{ py: 0.5 }}>
                <Typography variant="body2" fontWeight={500}>Uploading Aadhar image...</Typography>
              </Alert>
              <LinearProgress sx={{ mt: 0.5 }} />
            </Box>
          )}
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    required
                    value={createForm.firstName}
                    onChange={(e) => setCreateForm((p) => ({ ...p, firstName: capitalizeFirst(e.target.value) }))}
                    error={!!createErrors.firstName}
                    helperText={createErrors.firstName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    required
                    value={createForm.lastName}
                    onChange={(e) => setCreateForm((p) => ({ ...p, lastName: capitalizeFirst(e.target.value) }))}
                    error={!!createErrors.lastName}
                    helperText={createErrors.lastName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                    error={!!createErrors.email}
                    helperText={createErrors.email}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    placeholder="10 digits"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    error={!!createErrors.phone}
                    helperText={createErrors.phone}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Fees"
                    type="text"
                    value={createForm.fees != null && createForm.fees > 0 ? String(createForm.fees) : ''}
                    onChange={(e) => handleFeesChange(e.target.value)}
                    placeholder="50000"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>₹</span>
                        </InputAdornment>
                      ),
                      endAdornment: createForm.fees != null && createForm.fees > 0 && (
                        <InputAdornment position="end">
                          <Box
                            sx={{
                              bgcolor: 'primary.100',
                              color: 'primary.main',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '12px',
                              fontWeight: 600,
                              minWidth: '40px',
                              textAlign: 'center',
                              border: '1px solid',
                              borderColor: 'primary.300',
                            }}
                          >
                            {getFeesUnit(createForm.fees)}
                          </Box>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={createForm.status}
                      label="Status"
                      onChange={(e) => setCreateForm((p) => ({ ...p, status: e.target.value as ClientStatus }))}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="prospect">Prospect</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {canShowAssignedTo && (
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      sx={{ width: '100%' }}
                      options={assignableOptions}
                      getOptionLabel={(opt) => getAssignableOptionLabel(opt, currentUser?.id)}
                      value={assignableOptions.find((o) => (o.id || o._id) === createForm.assignedTo) ?? null}
                      onChange={(_, value) => {
                        setCreateForm((p) => ({ ...p, assignedTo: value ? (value.id || (value as { _id?: string })._id) || '' : '' }))
                        setAssignableSearchInput(value ? getAssignableOptionLabel(value, currentUser?.id) : '')
                      }}
                      inputValue={assignableSearchInput}
                      onInputChange={(_, value) => setAssignableSearchInput(value)}
                      loading={assignableLoading}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Assigned To"
                          placeholder="Search by name or email..."
                        />
                      )}
                      isOptionEqualToValue={(opt, val) => (opt.id || opt._id) === (val?.id || (val as AssignableOption)?._id)}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    value={createForm.streetAddress ?? ''}
                    onChange={(e) => setCreateForm((p) => ({ ...p, streetAddress: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="City" value={createForm.city ?? ''} onChange={(e) => setCreateForm((p) => ({ ...p, city: e.target.value }))} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Province" value={createForm.province ?? ''} onChange={(e) => setCreateForm((p) => ({ ...p, province: e.target.value }))} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Postal Code" value={createForm.postalCode ?? ''} onChange={(e) => setCreateForm((p) => ({ ...p, postalCode: e.target.value }))} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Country" value={createForm.country ?? ''} onChange={(e) => setCreateForm((p) => ({ ...p, country: e.target.value }))} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Aadhar Card Number"
                    value={createForm.aadharCardNumber ?? ''}
                    onChange={(e) => setCreateForm((p) => ({ ...p, aadharCardNumber: e.target.value.replace(/\D/g, '').slice(0, 12) }))}
                    placeholder="12 digits"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={2}
                    value={createForm.notes ?? ''}
                    onChange={(e) => setCreateForm((p) => ({ ...p, notes: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Aadhar Card Image (max 1 MB)</Typography>
                  <input
                    accept="image/*"
                    type="file"
                    id="aadhar-file-create"
                    style={{ display: 'none' }}
                    onChange={(e) => handleAadharFileChange(e, false)}
                    disabled={aadharUploading}
                  />
                  <Box
                    component="label"
                    htmlFor="aadhar-file-create"
                    sx={{
                      display: 'block',
                      position: 'relative',
                      border: '2px dashed',
                      borderColor: aadharFileError ? 'error.main' : aadharFile ? 'primary.main' : 'divider',
                      borderRadius: 2,
                      p: 2,
                      textAlign: 'center',
                      cursor: aadharUploading ? 'wait' : 'pointer',
                      bgcolor: aadharFile ? 'primary.50' : 'action.hover',
                      transition: 'border-color 0.2s, background-color 0.2s',
                      '&:hover': aadharUploading ? {} : { borderColor: 'primary.main', bgcolor: 'action.selected' },
                    }}
                  >
                    {aadharUploading && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.9)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                          zIndex: 1,
                        }}
                      >
                        <CircularProgress size={32} />
                        <Typography variant="body2" color="primary.main" fontWeight={500}>Uploading image...</Typography>
                      </Box>
                    )}
                    {!aadharFile ? (
                      <>
                        <Upload size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.7 }} />
                        <Typography variant="body2" color="text.secondary">Drop image here or click to upload</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>PNG, JPG up to 1 MB</Typography>
                      </>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, position: 'relative' }}>
                        {aadharPreviewUrl && (
                          <Box
                            component="img"
                            src={aadharPreviewUrl}
                            alt="Aadhar preview"
                            sx={{ maxWidth: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 1 }}
                          />
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">Click or drop to replace</Typography>
                          <IconButton size="small" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAadharFile(null); setAadharFileError(''); }} color="error" title="Remove" sx={{ ml: 0.5 }}>
                            <X size={18} />
                          </IconButton>
                        </Box>
                      </Box>
                    )}
                  </Box>
                  {aadharFileError && <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>{aadharFileError}</Typography>}
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateSubmit} disabled={creating || aadharUploading} startIcon={creating || aadharUploading ? <CircularProgress size={16} /> : <Plus />}>
              {aadharUploading ? 'Uploading image...' : creating ? 'Creating...' : 'Create Client'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Modal */}
        <Dialog open={!!viewId} onClose={() => setViewId(null)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Client Details</Typography>
              <IconButton onClick={() => setViewId(null)} size="small"><X /></IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {singleLoading || !singleClient ? (
              <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
            ) : (
              <Box sx={{ pt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Name</Typography><Typography variant="body1" fontWeight={500}>{getClientFullName(singleClient)}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Email</Typography><Typography variant="body1">{singleClient.email}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Phone</Typography><Typography variant="body1">{singleClient.phone || '—'}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Fees</Typography><Typography variant="body1">{singleClient.fees != null ? `₹${singleClient.fees.toLocaleString()}` : '—'}</Typography></Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block">Status</Typography>
                    <Chip label={singleClient.status} size="small" color={getStatusColor(singleClient.status) as any} variant="outlined" sx={{ mt: 0.5 }} />
                  </Grid>
                  {(canRead || canShowAssignedTo) && (
                    <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Assigned To</Typography><Typography variant="body1">{getAssignedToName(singleClient.assignedTo)}</Typography></Grid>
                  )}
                  {singleClient.streetAddress && <Grid item xs={12}><Typography variant="caption" color="text.secondary">Address</Typography><Typography variant="body1">{[singleClient.streetAddress, singleClient.city, singleClient.province, singleClient.postalCode, singleClient.country].filter(Boolean).join(', ')}</Typography></Grid>}
                  {singleClient.aadharCardNumber && <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Aadhar Card Number</Typography><Typography variant="body1">{singleClient.aadharCardNumber}</Typography></Grid>}
                  {singleClient.aadharImageUrl && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>Aadhar Card Image</Typography>
                      <Box sx={{ minHeight: 180, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        {!viewAadharImageLoaded && (
                          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover', borderRadius: 1 }}>
                            <CircularProgress size={32} />
                          </Box>
                        )}
                        <Box
                          component="img"
                          src={singleClient.aadharImageUrl}
                          alt="Aadhar card"
                          onLoad={() => setViewAadharImageLoaded(true)}
                          sx={{
                            maxWidth: '100%',
                            maxHeight: 280,
                            objectFit: 'contain',
                            borderRadius: 1,
                            display: viewAadharImageLoaded ? 'block' : 'none',
                          }}
                        />
                      </Box>
                      <Button size="small" startIcon={<Download size={18} />} href={singleClient.aadharImageUrl} download target="_blank" rel="noopener noreferrer" sx={{ mt: 1 }}>Download Aadhar Image</Button>
                    </Grid>
                  )}
                  {singleClient.notes && <Grid item xs={12}><Typography variant="caption" color="text.secondary">Notes</Typography><Typography variant="body1">{singleClient.notes}</Typography></Grid>}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions><Button onClick={() => setViewId(null)}>Close</Button></DialogActions>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={!!editId} onClose={() => { if (!aadharUploading) { setEditId(null); setEditForm({}); setEditErrors({}); setAadharEditFile(null); setAadharEditFileError(''); } }} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Edit Client</Typography>
              <IconButton onClick={() => { setEditId(null); setEditForm({}); setEditErrors({}); setAadharEditFile(null); setAadharEditFileError(''); }} size="small" disabled={aadharUploading}><X /></IconButton>
            </Box>
          </DialogTitle>
          {aadharUploading && (
            <Box sx={{ px: 3, pt: 0, pb: 1 }}>
              <Alert severity="info" icon={<CircularProgress size={20} />} sx={{ py: 0.5 }}>
                <Typography variant="body2" fontWeight={500}>Uploading Aadhar image...</Typography>
              </Alert>
              <LinearProgress sx={{ mt: 0.5 }} />
            </Box>
          )}
          <DialogContent>
            {singleLoading || !singleClient ? (
              <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
            ) : (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="First Name" value={editForm.firstName ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, firstName: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Last Name" value={editForm.lastName ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, lastName: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Email" type="email" value={editForm.email ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} error={!!editErrors.email} helperText={editErrors.email} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Phone" value={editForm.phone ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} error={!!editErrors.phone} helperText={editErrors.phone} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Fees"
                      type="text"
                      value={editForm.fees != null && editForm.fees > 0 ? String(editForm.fees) : ''}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9.]/g, '')
                        const parts = v.split('.')
                        const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : v
                        const num = formatted === '' ? undefined : parseFloat(formatted)
                        setEditForm((p) => ({ ...p, fees: num != null && !isNaN(num) ? num : undefined }))
                      }}
                      placeholder="50000"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>₹</span>
                          </InputAdornment>
                        ),
                        endAdornment: editForm.fees != null && editForm.fees > 0 && (
                          <InputAdornment position="end">
                            <Box sx={{ bgcolor: 'primary.100', color: 'primary.main', px: 1, py: 0.5, borderRadius: 1, fontSize: '12px', fontWeight: 600, minWidth: '40px', textAlign: 'center', border: '1px solid', borderColor: 'primary.300' }}>
                              {getFeesUnit(editForm.fees)}
                            </Box>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select value={editForm.status ?? 'active'} label="Status" onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as ClientStatus }))}>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                        <MenuItem value="prospect">Prospect</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {canShowAssignedTo && (
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        sx={{ width: '100%' }}
                        options={assignableOptions}
                        getOptionLabel={(opt) => getAssignableOptionLabel(opt, currentUser?.id)}
                        value={assignableOptions.find((o) => (o.id || o._id) === editForm.assignedTo) ?? null}
                        onChange={(_, value) => {
                          setEditForm((p) => ({ ...p, assignedTo: value ? (value.id || (value as { _id?: string })._id) || '' : '' }))
                          setAssignableSearchInput(value ? getAssignableOptionLabel(value, currentUser?.id) : '')
                        }}
                        inputValue={assignableSearchInput}
                        onInputChange={(_, value) => setAssignableSearchInput(value)}
                        loading={assignableLoading}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Assigned To"
                            placeholder="Search by name or email..."
                          />
                        )}
                        isOptionEqualToValue={(opt, val) => (opt.id || opt._id) === (val?.id || (val as AssignableOption)?._id)}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <TextField fullWidth label="Street Address" value={editForm.streetAddress ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, streetAddress: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="City" value={editForm.city ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, city: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Province" value={editForm.province ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, province: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Postal Code" value={editForm.postalCode ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, postalCode: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Country" value={editForm.country ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, country: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Aadhar Card Number" value={editForm.aadharCardNumber ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, aadharCardNumber: e.target.value.replace(/\D/g, '').slice(0, 12) }))} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Notes" multiline rows={2} value={editForm.notes ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {singleClient.aadharImageUrl ? 'Aadhar Card Image — click or drop to replace (max 1 MB)' : 'Aadhar Card Image (max 1 MB)'}
                    </Typography>
                    <input
                      accept="image/*"
                      type="file"
                      id="aadhar-file-edit"
                      style={{ display: 'none' }}
                      onChange={(e) => handleAadharFileChange(e, true)}
                      disabled={aadharUploading}
                    />
                    <Box
                      component="label"
                      htmlFor="aadhar-file-edit"
                      sx={{
                        display: 'block',
                        position: 'relative',
                        border: '2px dashed',
                        borderColor: aadharEditFileError ? 'error.main' : aadharEditFile ? 'primary.main' : 'divider',
                        borderRadius: 2,
                        p: 2,
                        textAlign: 'center',
                        cursor: aadharUploading ? 'wait' : 'pointer',
                        bgcolor: aadharEditFile ? 'primary.50' : 'action.hover',
                        transition: 'border-color 0.2s, background-color 0.2s',
                        '&:hover': aadharUploading ? {} : { borderColor: 'primary.main', bgcolor: 'action.selected' },
                      }}
                    >
                      {aadharUploading && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            borderRadius: 2,
                            bgcolor: 'rgba(255,255,255,0.9)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            zIndex: 1,
                          }}
                        >
                          <CircularProgress size={32} />
                          <Typography variant="body2" color="primary.main" fontWeight={500}>Uploading image...</Typography>
                        </Box>
                      )}
                      {aadharEditFile ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          {aadharEditPreviewUrl && (
                            <Box
                              component="img"
                              src={aadharEditPreviewUrl}
                              alt="Aadhar preview"
                              sx={{ maxWidth: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 1 }}
                            />
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">Click or drop to replace</Typography>
                            <IconButton size="small" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAadharEditFile(null); setAadharEditFileError(''); }} color="error" title="Remove" sx={{ ml: 0.5 }}>
                              <X size={18} />
                            </IconButton>
                          </Box>
                        </Box>
                      ) : singleClient.aadharImageUrl ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <Box
                            component="img"
                            src={singleClient.aadharImageUrl}
                            alt="Current Aadhar card"
                            sx={{ maxWidth: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">Click or drop new image to replace</Typography>
                          <Typography variant="caption" color="text.secondary">PNG, JPG up to 1 MB</Typography>
                        </Box>
                      ) : (
                        <>
                          <Upload size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.7 }} />
                          <Typography variant="body2" color="text.secondary">Drop image here or click to upload</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>PNG, JPG up to 1 MB</Typography>
                        </>
                      )}
                    </Box>
                    {aadharEditFileError && <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>{aadharEditFileError}</Typography>}
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => { setEditId(null); setEditForm({}); setEditErrors({}); setAadharEditFile(null); setAadharEditFileError(''); }}>Cancel</Button>
            <Button variant="contained" onClick={handleEditSubmit} disabled={updating || aadharUploading} startIcon={updating || aadharUploading ? <CircularProgress size={16} /> : null}>
              {aadharUploading ? 'Uploading image...' : updating ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirm */}
        <Dialog open={!!deleteClient} onClose={() => setDeleteClient(null)} maxWidth="xs" fullWidth>
          <DialogTitle>Delete Client</DialogTitle>
          <DialogContent>
            {deleteClient && (
              <Typography>
                Are you sure you want to delete <strong>{getClientFullName(deleteClient)}</strong>? This can be restored later.
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteClient(null)}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleDeleteConfirm} disabled={deleting} startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon size={16} />}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Actions Menu */}
        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={closeMenu} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
          {canRead && menuClient && (
            <MenuItem onClick={() => openView(menuClient.id || (menuClient as { _id?: string })._id || '')}>
              <ListItemIcon><Eye size={18} /></ListItemIcon>
              <ListItemText>View</ListItemText>
            </MenuItem>
          )}
          {canUpdate && menuClient && (
            <MenuItem onClick={() => openEdit(menuClient.id || (menuClient as { _id?: string })._id || '')}>
              <ListItemIcon><EditIcon size={18} /></ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
          )}
          {canUpdate && menuClient?.status === 'archived' && (
            <MenuItem onClick={() => menuClient && handleUnarchive(menuClient)}>
              <ListItemIcon><ArchiveRestore size={18} /></ListItemIcon>
              <ListItemText>Unarchive</ListItemText>
            </MenuItem>
          )}
          {canUpdate && menuClient?.status !== 'archived' && (
            <MenuItem onClick={() => menuClient && handleArchive(menuClient)}>
              <ListItemIcon><Archive size={18} /></ListItemIcon>
              <ListItemText>Archive</ListItemText>
            </MenuItem>
          )}
          {canUpdate && menuClient?.deletedAt && (
            <MenuItem onClick={() => menuClient && handleRestore(menuClient)}>
              <ListItemIcon><RotateCcw size={18} /></ListItemIcon>
              <ListItemText>Restore</ListItemText>
            </MenuItem>
          )}
          {canDelete && (
            <MenuItem onClick={() => menuClient && openDelete(menuClient)} sx={{ color: 'error.main' }}>
              <ListItemIcon><DeleteIcon size={18} /></ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          )}
        </Menu>
    </ProtectedRoute>
  )
}
