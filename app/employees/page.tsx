'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  UserPlus, 
  Plus, 
  Search, 
  Filter, 
  Eye,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone,
  Mail,
  Calendar,
  MapPin,
  UserPlus as UserPlusIcon,
  X,
  RotateCcw,
  Check
} from 'lucide-react'
import Layout from '@/components/Layout'
import ActionMenu from '@/components/ActionMenu'
import { useAuth } from '@/contexts/AuthContext'
import { ROLES, getRoleById } from '@/utils/roles'
import { 
  DataGrid, 
  GridColDef, 
  GridToolbar
} from '@mui/x-data-grid'
import { useInviteEmployeeMutation, useGetEmployeesQuery, useUpdateEmployeeStatusMutation, useLazyGetEmployeeByAdminQuery, useUpdateEmployeeByAdminMutation, useSoftDeleteEmployeeByAdminMutation } from '@/redux/api/employeesApi'
import toast from 'react-hot-toast'
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
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material'

// Import Employee type from Redux API
import type { Employee } from '@/redux/api/employeesApi'

interface InviteEmployeeData {
  firstName: string
  lastName: string
  email: string
  salary: string
}

export default function EmployeesPage() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin'
  if (!isAdmin) return null
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  
  // Filter selection state (what user is selecting)
  const [roleFilter, setRoleFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState('all')
  
  // Applied filters state (what's actually sent to API)
  const [appliedRoleFilter, setAppliedRoleFilter] = useState<string | undefined>(undefined)
  const [appliedDepartmentFilter, setAppliedDepartmentFilter] = useState<string | undefined>(undefined)
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<string | undefined>(undefined)
  const [appliedEmployeeTypeFilter, setAppliedEmployeeTypeFilter] = useState<string | undefined>(undefined)
  
  const [showFilters, setShowFilters] = useState(false)
  const [statusToggle, setStatusToggle] = useState<'all' | 'active' | 'inactive'>('all')
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  })

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])
  
  // Invite Employee Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteData, setInviteData] = useState<InviteEmployeeData>({
    firstName: '',
    lastName: '',
    email: '',
    salary: ''
  })
  const [inviteErrors, setInviteErrors] = useState<Partial<InviteEmployeeData>>({})
  const [isInviting, setIsInviting] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [inviteEmployee, { isLoading: isInviteLoading }] = useInviteEmployeeMutation()
  
  // Status change modal state
  const [selectedEmployeeForStatus, setSelectedEmployeeForStatus] = useState<Employee | null>(null)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [statusForm, setStatusForm] = useState<{ status: 'active' | 'inactive' | 'pending'; reason: string; notes: string }>({
    status: 'active',
    reason: '',
    notes: ''
  })
  const [statusFormError, setStatusFormError] = useState<string>('')
  const [updateEmployeeStatus, { isLoading: isUpdatingStatus }] = useUpdateEmployeeStatusMutation()
  const [fetchEmployeeByAdmin, { isFetching: isFetchingEmployee }] = useLazyGetEmployeeByAdminQuery()
  const [updateEmployeeByAdmin, { isLoading: isUpdatingEmployee }] = useUpdateEmployeeByAdminMutation()
  const [softDeleteEmployeeByAdmin, { isLoading: isDeletingEmployee }] = useSoftDeleteEmployeeByAdminMutation()
  // Notifications via react-toastify
  
  // Fetch employees data with server-side filtering
  // When statusToggle is 'inactive', send both 'inactive' and 'pending' statuses to the API
  const { 
    data: employeesData, 
    isLoading: isEmployeesLoading, 
    error: employeesError,
    refetch: refetchEmployees 
  } = useGetEmployeesQuery({
    page: paginationModel.page + 1, // API uses 1-based pagination
    limit: paginationModel.pageSize,
    search: debouncedSearchTerm || undefined,
    role: appliedRoleFilter,
    department: appliedDepartmentFilter,
    status: statusToggle === 'inactive' 
      ? 'inactive,pending' 
      : (statusToggle !== 'all' ? statusToggle : appliedStatusFilter),
    employeeType: appliedEmployeeTypeFilter,
  })

  // Get employees from API or fallback to empty array
  const employees: Employee[] = employeesData?.data || []
  const pagination = employeesData

  // Handle filter selection changes (doesn't apply to API yet)
  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case 'search':
        setSearchTerm(value)
        setPaginationModel(prev => ({ ...prev, page: 0 }))
        break
      case 'role':
        setRoleFilter(value)
        break
      case 'department':
        setDepartmentFilter(value)
        break
      case 'status':
        setStatusFilter(value)
        break
      case 'employeeType':
        setEmployeeTypeFilter(value)
        break
    }
  }

  // Apply filters to API
  const handleApplyFilters = () => {
    setAppliedRoleFilter(roleFilter !== 'all' ? roleFilter : undefined)
    setAppliedDepartmentFilter(departmentFilter !== 'all' ? departmentFilter : undefined)
    setAppliedStatusFilter(statusFilter !== 'all' ? statusFilter : undefined)
    setAppliedEmployeeTypeFilter(employeeTypeFilter !== 'all' ? employeeTypeFilter : undefined)
    setPaginationModel(prev => ({ ...prev, page: 0 }))
  }

  // Reset all filters
  const handleResetFilters = () => {
    setRoleFilter('all')
    setDepartmentFilter('all')
    setStatusFilter('all')
    setEmployeeTypeFilter('all')
    setAppliedRoleFilter(undefined)
    setAppliedDepartmentFilter(undefined)
    setAppliedStatusFilter(undefined)
    setAppliedEmployeeTypeFilter(undefined)
    setShowFilters(false)
    setPaginationModel(prev => ({ ...prev, page: 0 }))
  }

  // Check if any filters are currently applied
  const hasActiveFilters = appliedRoleFilter || appliedDepartmentFilter || appliedStatusFilter || appliedEmployeeTypeFilter

  const getRoleInfo = (roleId: string) => {
    return getRoleById(roleId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'pending': return 'warning'
      case 'inactive': return 'error'
      default: return 'default'
    }
  }

  const openStatusModal = (employee: Employee) => {
    setSelectedEmployeeForStatus(employee)
    setStatusForm({ status: (employee.status as any) || 'active', reason: '', notes: '' })
    setIsStatusModalOpen(true)
  }
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)

  const closeStatusModal = () => {
    setIsStatusModalOpen(false)
    setStatusFormError('')
  }

  const handleSubmitStatus = async () => {
    if (!selectedEmployeeForStatus) return
    if (!statusForm.reason.trim()) {
      setStatusFormError('Reason is required')
      return
    }
    try {
      setStatusFormError('')
      const res = await updateEmployeeStatus({
        employeeId: selectedEmployeeForStatus._id || selectedEmployeeForStatus.id,
        status: statusForm.status,
        reason: statusForm.reason.trim(),
        notes: statusForm.notes.trim() || undefined,
      }).unwrap()
      closeStatusModal()
      refetchEmployees()
      const successMessage = (res as any)?.message || 'Employee status updated successfully.'
      toast.success(successMessage)
    } catch (e: any) {
      const msg = e?.data?.message || e?.data?.error || e?.message || 'Failed to update status'
      setStatusFormError(msg)
      toast.error(msg)
    }
  }

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewMode, setIsViewMode] = useState(false)
  const [editEmployeeId, setEditEmployeeId] = useState<string | null>(null)
  const [originalEmployeeType, setOriginalEmployeeType] = useState<string | null>(null)

  const handleView = (id: string) => {
    setIsViewMode(true)
    openEditModal(id, true)
  }

  // Edit Employee state
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    dateOfBirth: '',
    aadharCardNumber: '',
    employeeType: '',
    advocateLicenseNumber: '',
    internYear: '',
    salary: '',
    department: '',
    position: '',
    startDate: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: ''
  })
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  const openEditModal = async (id: string, viewOnly: boolean = false) => {
    try {
      const res = await fetchEmployeeByAdmin({ id }).unwrap()
      const emp: any = (res as any)?.data ?? res
      const [firstName, ...rest] = (emp.fullName || '').split(' ')
      const employeeType = (emp.employeeType as any) || (emp.type as any) || ''
      setEditForm({
        firstName: firstName || emp.firstName || '',
        lastName: rest.join(' ') || emp.lastName || '',
        email: emp.email || '',
        phone: emp.phone || '',
        address: emp.address || '',
        gender: (emp.gender as any) || '',
        dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.slice(0, 10) : '',
        aadharCardNumber: emp.aadharCardNumber || '',
        employeeType: employeeType,
        advocateLicenseNumber: emp.advocateLicenseNumber || '',
        internYear: emp.internYear != null ? String(emp.internYear) : '',
        salary: emp.salary != null ? String(emp.salary) : '',
        department: emp.department || '',
        position: emp.position || '',
        startDate: emp.startDate ? emp.startDate.slice(0, 10) : '',
        emergencyContactName: emp.emergencyContactName || '',
        emergencyContactPhone: emp.emergencyContactPhone || '',
        emergencyContactRelation: emp.emergencyContactRelation || ''
      })
      setOriginalEmployeeType(employeeType) // Store original employee type
      setEditErrors({})
      setEditEmployeeId(id)
      setIsEditModalOpen(true)
      setIsViewMode(viewOnly)
    } catch (e: any) {
      const msg = e?.data?.message || e?.data?.error || e?.message || 'Failed to load employee'
      toast.error(msg)
    }
  }

  const handleEdit = (id: string) => {
    setIsViewMode(false)
    openEditModal(id, false)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setOriginalEmployeeType(null)
  }

  const handleAdvocateLicenseChange = (value: string) => {
    // Auto-format the license number
    let formattedValue = value
    
    // Convert 'mah' to 'MAH' (case insensitive)
    if (formattedValue.toLowerCase().startsWith('mah')) {
      formattedValue = 'MAH' + formattedValue.substring(3)
    }
    
    // After MAH/, only allow numbers and slashes
    if (formattedValue.startsWith('MAH/')) {
      // Remove any non-numeric characters except slashes after MAH/
      const afterMah = formattedValue.substring(4) // Get everything after "MAH/"
      const numbersOnly = afterMah.replace(/[^0-9/]/g, '') // Keep only numbers and slashes
      formattedValue = 'MAH/' + numbersOnly
    }
    
    // Only apply formatting if the value is longer than current value (user is typing, not deleting)
    const currentValue = editForm.advocateLicenseNumber
    const isTyping = value.length > currentValue.length
    
    if (isTyping) {
      // If user types MAH, automatically add the first slash
      if (formattedValue.includes('MAH') && !formattedValue.includes('MAH/')) {
        formattedValue = formattedValue.replace('MAH', 'MAH/')
      }
      
      // If we have MAH/ followed by exactly 4 digits (not more), automatically add the second slash
      const mahWithFourDigits = /MAH\/\d{4}$/
      if (mahWithFourDigits.test(formattedValue)) {
        formattedValue = formattedValue.replace(/(MAH\/\d{4})$/, '$1/')
      }
    }
    
    // Allow up to 13 characters for the license format MAH/XXXX/YYYY
    if (formattedValue.length <= 13) {
      setEditForm(p => ({...p, advocateLicenseNumber: formattedValue}))
      // Clear error when user starts typing
      if (editErrors.advocateLicenseNumber) {
        setEditErrors(prev => ({ ...prev, advocateLicenseNumber: undefined }))
      }
    }
  }

  const handleEditSalaryChange = (value: string) => {
    // Only allow numbers and a single decimal point
    const numbersOnly = value.replace(/[^0-9.]/g, '')
    // Prevent multiple decimal points
    const parts = numbersOnly.split('.')
    const formattedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numbersOnly
    setEditForm(p => ({...p, salary: formattedValue}))
    // Clear error when user starts typing
    if (editErrors.salary) {
      setEditErrors(prev => ({ ...prev, salary: undefined }))
    }
  }

  const handlePhoneChange = (value: string, field: 'phone' | 'emergencyContactPhone') => {
    // Only allow digits, max 10 digits
    const digitsOnly = value.replace(/[^0-9]/g, '').slice(0, 10)
    setEditForm(p => ({...p, [field]: digitsOnly}))
    // Clear error when user starts typing
    if (editErrors[field]) {
      setEditErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleAadharChange = (value: string) => {
    // Only allow digits, max 12 digits
    const digitsOnly = value.replace(/[^0-9]/g, '').slice(0, 12)
    setEditForm(p => ({...p, aadharCardNumber: digitsOnly}))
    // Clear error when user starts typing
    if (editErrors.aadharCardNumber) {
      setEditErrors(prev => ({ ...prev, aadharCardNumber: undefined }))
    }
  }

  const getEditSalaryUnit = (salary: string) => {
    if (!salary || salary === '') return ''
    
    const num = parseFloat(salary)
    if (isNaN(num)) return ''
    
    if (num >= 10000000) { // 1 crore
      return `${(num / 10000000).toFixed(1)} Cr`
    } else if (num >= 100000) { // 1 lakh
      return `${(num / 100000).toFixed(1)} L`
    } else if (num >= 1000) { // 1 thousand
      return `${(num / 1000).toFixed(1)} K`
    } else {
      return `${num.toFixed(0)}`
    }
  }

  const performDelete = async (id: string) => {
    if (deletingId) return
    try {
      setDeletingId(id)
      await softDeleteEmployeeByAdmin({ id }).unwrap()
      toast.success('Employee deleted')
      refetchEmployees()
    } catch (e: any) {
      const msg = e?.data?.message || e?.data?.error || e?.message || 'Failed to delete employee'
      toast.error(msg)
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteClick = (employee: Employee) => {
    setDeleteTarget(employee)
    setIsDeleteConfirmOpen(true)
  }

  // Invite Employee Functions
  const validateInviteData = (): boolean => {
    const errors: Partial<InviteEmployeeData> = {}
    
    if (!inviteData.firstName.trim()) {
      errors.firstName = 'First name is required'
    }
    if (!inviteData.lastName.trim()) {
      errors.lastName = 'Last name is required'
    }
    if (!inviteData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    if (!inviteData.salary.trim()) {
      errors.salary = 'Salary is required'
    } else if (!/^\d+(\.\d{1,2})?$/.test(inviteData.salary)) {
      errors.salary = 'Please enter a valid salary amount'
    }
    
    setInviteErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInviteEmployee = async () => {
    if (!validateInviteData()) {
      return
    }
    
    setIsInviting(true)
    setInviteSuccess(false)
    
    try {
      const res = await inviteEmployee({
        firstName: inviteData.firstName.trim(),
        lastName: inviteData.lastName.trim(),
        email: inviteData.email.trim(),
        salary: inviteData.salary.trim(),
        // Temporary backend-required fields not present in UI
        // dateOfBirth: '2000-01-01',
        // gender: 'female',
        // address: 'sunanda surve chawl no 1 room no 1 kajupada bhatwadi ghatkopar west mumbai 400084',
        // phone: '9833288295'
      }).unwrap()
      
      console.log('Invite response:', res)
      
      // Reset form
      setInviteData({
        firstName: '',
        lastName: '',
        email: '',
        salary: ''
      })
      setInviteErrors({})
      setInviteSuccess(true)
      
      // Refetch employees list and close modal after success
      refetchEmployees()
      setTimeout(() => {
        setIsInviteModalOpen(false)
        setInviteSuccess(false)
      }, 2000)
      
    } catch (error: any) {
      console.error('Error inviting employee:', error)
      
      // Display backend error message
      let errorMessage = 'Failed to send invitation. Please try again.'
      
      if (error?.data?.error) {
        errorMessage = error.data.error
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      // Show error in the modal
      setInviteErrors({ 
        email: errorMessage 
      })
    } finally {
      setIsInviting(false)
    }
  }

  const handleInviteDataChange = (field: keyof InviteEmployeeData, value: string) => {
    setInviteData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (inviteErrors[field]) {
      setInviteErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSalaryChange = (value: string) => {
    // Only allow numbers and a single decimal point
    const numbersOnly = value.replace(/[^0-9.]/g, '')
    // Prevent multiple decimal points
    const parts = numbersOnly.split('.')
    const formattedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numbersOnly
    handleInviteDataChange('salary', formattedValue)
  }

  const getSalaryUnit = (salary: string) => {
    if (!salary || salary === '') return ''
    
    const num = parseFloat(salary)
    if (isNaN(num)) return ''
    
    if (num >= 10000000) { // 1 crore
      return `${(num / 10000000).toFixed(1)} Cr`
    } else if (num >= 100000) { // 1 lakh
      return `${(num / 100000).toFixed(1)} L`
    } else if (num >= 1000) { // 1 thousand
      return `${(num / 1000).toFixed(1)} K`
    } else {
      return `${num.toFixed(0)}`
    }
  }


  const handleCloseInviteModal = () => {
    setIsInviteModalOpen(false)
    setInviteData({
      firstName: '',
      lastName: '',
      email: '',
      salary: ''
    })
    setInviteErrors({})
    setInviteSuccess(false)
  }

  // Helper function to get initials
  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.charAt(0)?.toUpperCase() || ''
    const last = lastName?.charAt(0)?.toUpperCase() || ''
    return first + last || '?'
  }

  // Helper function to get full name
  const getFullName = (firstName: string, lastName: string) => {
    return `${firstName || ''} ${lastName || ''}`.trim() || 'Unknown'
  }

  const columns: GridColDef[] = [
    {
      field: 'employee',
      headerName: 'Employee',
      width: 250,
      renderCell: (params) => {
        const firstName = params.row.firstName || ''
        const lastName = params.row.lastName || ''
        const fullName = getFullName(firstName, lastName)
        const initials = getInitials(firstName, lastName)
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              {initials}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {params.row.email || 'N/A'}
              </Typography>
            </Box>
          </Box>
        )
      },
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.phone || 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'employeeType',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => {
        const type = params.row.type || params.row.employeeType
        return (
          <Chip 
            label={type || 'N/A'} 
            size="small"
            color="primary"
            variant="outlined"
          />
        )
      },
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 150,
      renderCell: (params) => {
        const dept = params.row.department
        return (
          <Chip 
            label={dept || 'N/A'} 
            size="small"
            variant="outlined"
            color="secondary"
          />
        )
      },
    },
    {
      field: 'position',
      headerName: 'Position',
      width: 150,
      renderCell: (params) => {
        const pos = params.row.position
        return (
          <Typography variant="body2" color="text.secondary">
            {pos || 'N/A'}
          </Typography>
        )
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => (
        <Box>
          <Chip 
            label={params.row.status}
            color={getStatusColor(params.row.status) as any}
            size="small"
            variant="outlined"
            onClick={() => openStatusModal(params.row)}
            sx={{ cursor: 'pointer' }}
          />
        </Box>
      ),
    },
    {
      field: 'invitationStatus',
      headerName: 'Invitation',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.row.invitationStatus} 
          color={params.row.invitationStatus === 'completed' ? 'success' : 'warning'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'salary',
      headerName: 'Salary',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          {params.row.salary ? `₹${params.row.salary.toLocaleString()}` : 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.startDate ? new Date(params.row.startDate).toLocaleDateString() : 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.createdAt ? new Date(params.row.createdAt).toLocaleDateString() : 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const employeeId = params.row._id || params.row.id
        if (!employeeId) return null
        
        return (
          <ActionMenu
            items={[
              {
                label: 'View',
                icon: <Eye size={18} />,
                onClick: () => handleView(employeeId),
                color: 'primary'
              },
              {
                label: 'Edit',
                icon: <EditIcon size={18} />,
                onClick: () => handleEdit(employeeId),
                color: 'primary'
              },
              {
                label: 'Delete',
                icon: <DeleteIcon size={18} />,
                onClick: () => handleDeleteClick(params.row),
                color: 'error'
              }
            ]}
          />
        )
      },
    },
  ]

  const metrics = [
    { name: 'Total Employees', value: pagination?.totalCount?.toString() || '0', change: '+12%', icon: UserPlus },
    { name: 'Active Employees', value: employees.filter(e => e.status === 'active').length.toString(), change: '+8%', icon: UserPlus },
    { name: 'Departments', value: Array.from(new Set(employees.map(e => e.department))).length.toString(), change: '+2', icon: UserPlus },
    { name: 'Employee Types', value: Array.from(new Set(employees.map(e => e.employeeType))).length.toString(), change: '+1', icon: UserPlus },
  ]

  const buttonBoxSx = {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    py: 1.5,
    px: 3,
    lineHeight: 1.25,
    textTransform: 'none',
    '& .MuiButton-startIcon': { marginRight: 0.5, marginBottom: '2px', display: 'inline-flex', alignItems: 'center' },
    '& .MuiButton-startIcon svg': { display: 'block' }
  } as const

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        {/* Page Header */}
        <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Employee List
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage employee information and roles
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<UserPlusIcon size={20} />}
            onClick={() => setIsInviteModalOpen(true)}
            sx={{ 
              minWidth: { xs: '100%', sm: 'auto' },
              ...buttonBoxSx
            }}
          >
            Invite Employee
          </Button>
        </Box>

        {/* Search and Filters */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPaginationModel(prev => ({ ...prev, page: 0 }))
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<Filter size={18} />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{ 
                    ...buttonBoxSx,
                    minWidth: 'auto',
                    px: 2
                  }}
                >
                  Filters
                </Button>
                
                {hasActiveFilters && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<RotateCcw size={18} />}
                    onClick={handleResetFilters}
                    sx={{ 
                      ...buttonBoxSx,
                      minWidth: 'auto',
                      px: 2
                    }}
                  >
                    Reset
                  </Button>
                )}
                
                {showFilters && (
                  <>
                    <FormControl sx={{ minWidth: 140 }} size="small">
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={roleFilter}
                        label="Role"
                        onChange={(e) => handleFilterChange('role', e.target.value)}
                      >
                        <MenuItem value="all">All Roles</MenuItem>
                        {ROLES.map(role => (
                          <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <FormControl sx={{ minWidth: 140 }} size="small">
                      <InputLabel>Department</InputLabel>
                      <Select
                        value={departmentFilter}
                        label="Department"
                        onChange={(e) => handleFilterChange('department', e.target.value)}
                      >
                        <MenuItem value="all">All Departments</MenuItem>
                        {Array.from(new Set(employees.map(e => e.department).filter(Boolean))).map(dept => (
                          <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <FormControl sx={{ minWidth: 140 }} size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <FormControl sx={{ minWidth: 140 }} size="small">
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={employeeTypeFilter}
                        label="Type"
                        onChange={(e) => handleFilterChange('employeeType', e.target.value)}
                      >
                        <MenuItem value="all">All Types</MenuItem>
                        <MenuItem value="advocate">Advocate</MenuItem>
                        <MenuItem value="intern">Intern</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <Button
                      variant="contained"
                      startIcon={<Check size={18} />}
                      onClick={handleApplyFilters}
                      sx={{ 
                        ...buttonBoxSx,
                        minWidth: 'auto',
                        px: 2
                      }}
                    >
                      Apply
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Employee Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <Grid item xs={12} sm={6} md={3} key={metric.name}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ p: 1, bgcolor: 'primary.100', borderRadius: 1, mr: 2 }}>
                        <Icon size={24} />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {metric.name}
                        </Typography>
                        <Typography variant="h6" fontWeight={600}>
                          {metric.value}
                        </Typography>
                        <Typography variant="caption" color="success.main">
                          {metric.change}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>

        {/* Employees DataGrid */}
        <Card>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" component="h2">
                Employees List
              </Typography>
              <ToggleButtonGroup
                value={statusToggle}
                exclusive
                onChange={(e, newValue) => {
                  if (newValue !== null) {
                    setStatusToggle(newValue)
                    // Clear status filter from filters section when toggle is used
                    if (newValue !== 'all') {
                      setStatusFilter('all')
                      setAppliedStatusFilter(undefined)
                    }
                    setPaginationModel(prev => ({ ...prev, page: 0 }))
                  }
                }}
                aria-label="employee status filter"
                size="small"
              >
                <ToggleButton value="all" aria-label="all employees">
                  All
                </ToggleButton>
                <ToggleButton value="active" aria-label="active employees">
                  Active
                </ToggleButton>
                <ToggleButton value="inactive" aria-label="inactive employees">
                  Inactive
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
          <Box sx={{ height: 600, width: '100%' }}>
            {/* Status context menu removed: open modal directly on click */}
            {isEmployeesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : employeesError ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: 2 }}>
                <Typography color="error">Failed to load employees</Typography>
                <Button variant="outlined" onClick={() => refetchEmployees()}>
                  Retry
                </Button>
              </Box>
            ) : (
              <DataGrid
                rows={employees}
                columns={columns}
                getRowId={(row) => row._id || row.id}
                pageSizeOptions={[5, 10, 25]}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                rowCount={pagination?.totalCount || 0}
                paginationMode="server"
                loading={isEmployeesLoading}
                slots={{
                  toolbar: GridToolbar,
                }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: false, // Disable client-side filtering since we're using server-side
                    quickFilterProps: { debounceMs: 500 },
                  },
                }}
                disableRowSelectionOnClick
                sx={{
                  '& .MuiDataGrid-cell:focus': {
                    outline: 'none',
                  },
                }}
              />
            )}
          </Box>
        </Card>

        {/* Change Status Modal */}
        <Dialog 
          open={isStatusModalOpen}
          onClose={closeStatusModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Change Employee Status</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
              <TextField
                label="Employee"
                value={selectedEmployeeForStatus ? getFullName(selectedEmployeeForStatus.firstName || '', selectedEmployeeForStatus.lastName || '') : ''}
                disabled
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={statusForm.status}
                  onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value as any }))}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Reason"
                value={statusForm.reason}
                onChange={(e) => setStatusForm(prev => ({ ...prev, reason: e.target.value }))}
                fullWidth
                required
                placeholder="Why is this status being changed?"
              />
              <TextField
                label="Notes"
                value={statusForm.notes}
                onChange={(e) => setStatusForm(prev => ({ ...prev, notes: e.target.value }))}
                fullWidth
                multiline
                minRows={3}
                placeholder="Additional context (optional)"
              />
              {statusFormError && (
                <Alert severity="error">{statusFormError}</Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={closeStatusModal}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmitStatus}
              disabled={isUpdatingStatus}
              startIcon={isUpdatingStatus ? <CircularProgress size={16} /> : undefined}
            >
              {isUpdatingStatus ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Employee Modal */}
        <Dialog 
          open={isEditModalOpen}
          onClose={handleCloseEditModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Edit Employee
            <IconButton onClick={handleCloseEditModal} size="small">
              <X size={20} />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {isFetchingEmployee ? (
              <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                {/* Personal Information */}
                <Typography variant="h6" sx={{ mb: 2, color: 'warning.light' }}>Personal Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                <TextField label="First Name" value={editForm.firstName} onChange={(e) => setEditForm(p => ({...p, firstName: e.target.value}))} error={!!editErrors.firstName} helperText={editErrors.firstName} required fullWidth disabled={isViewMode} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Last Name" value={editForm.lastName} onChange={(e) => setEditForm(p => ({...p, lastName: e.target.value}))} error={!!editErrors.lastName} helperText={editErrors.lastName} required fullWidth disabled={isViewMode} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Email" type="email" value={editForm.email} onChange={(e) => setEditForm(p => ({...p, email: e.target.value}))} error={!!editErrors.email} helperText={editErrors.email} required fullWidth disabled={isViewMode} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      label="Phone" 
                      value={editForm.phone} 
                      onChange={(e) => handlePhoneChange(e.target.value, 'phone')} 
                      error={!!editErrors.phone} 
                      helperText={editErrors.phone || ''} 
                      required 
                      fullWidth 
                      disabled={isViewMode}
                      inputProps={{ maxLength: 10 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone size={20} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Address" value={editForm.address} onChange={(e) => setEditForm(p => ({...p, address: e.target.value}))} fullWidth multiline minRows={2} disabled={isViewMode} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={isViewMode}>
                      <InputLabel>Gender</InputLabel>
                      <Select label="Gender" value={editForm.gender} onChange={(e) => setEditForm(p => ({...p, gender: e.target.value as string}))}>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Date of Birth" type="date" value={editForm.dateOfBirth} onChange={(e) => setEditForm(p => ({...p, dateOfBirth: e.target.value}))} InputLabelProps={{ shrink: true }} fullWidth disabled={isViewMode} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      label="Aadhar Card Number" 
                      value={editForm.aadharCardNumber} 
                      onChange={(e) => handleAadharChange(e.target.value)} 
                      fullWidth 
                      disabled={isViewMode}
                      error={!!editErrors.aadharCardNumber}
                      helperText={editErrors.aadharCardNumber || ''}
                      inputProps={{ maxLength: 12 }}
                    />
                  </Grid>
                </Grid>

                {/* Employment Information */}
                <Typography variant="h6" sx={{ mt: 3, mb: 2,color: 'warning.light' }}>Employment Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={isViewMode}>
                      <InputLabel>Employee Type</InputLabel>
                      <Select 
                        label="Employee Type" 
                        value={editForm.employeeType} 
                        onChange={(e) => {
                          const newType = e.target.value as string
                          // Prevent changing from advocate to intern
                          if (originalEmployeeType === 'advocate' && newType === 'intern') {
                            toast.error('Cannot change employee type from Advocate to Intern')
                            return
                          }
                          setEditForm(p => ({...p, employeeType: newType}))
                        }}
                      >
                        <MenuItem value="advocate">Advocate</MenuItem>
                        <MenuItem 
                          value="intern" 
                          disabled={originalEmployeeType === 'advocate'}
                        >
                          Intern
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {editForm.employeeType === 'advocate' && (
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Advocate License Number" 
                        value={editForm.advocateLicenseNumber} 
                        onChange={(e) => handleAdvocateLicenseChange(e.target.value)} 
                        error={!!editErrors.advocateLicenseNumber}
                        helperText={editErrors.advocateLicenseNumber || 'Format: MAH/XXXX/YYYY (slashes added automatically)'}
                        fullWidth 
                        disabled={isViewMode}
                        required
                        placeholder="MAH/9720/2025"
                        inputProps={{ maxLength: 13 }}
                      />
                    </Grid>
                  )}
                  {editForm.employeeType === 'intern' && (
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth disabled={isViewMode}>
                        <InputLabel>Intern Year</InputLabel>
                        <Select label="Intern Year" value={editForm.internYear} onChange={(e) => setEditForm(p => ({...p, internYear: e.target.value as string}))}>
                          <MenuItem value="1">1st Year</MenuItem>
                          <MenuItem value="2">2nd Year</MenuItem>
                          <MenuItem value="3">3rd Year</MenuItem>
                          <MenuItem value="4">4th Year</MenuItem>
                          <MenuItem value="5">5th Year</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      label="Salary" 
                      type="text"
                      value={editForm.salary} 
                      onChange={(e) => handleEditSalaryChange(e.target.value)} 
                      error={!!editErrors.salary}
                      helperText={editErrors.salary || ''}
                      fullWidth 
                      disabled={isViewMode}
                      placeholder="50000"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>₹</span>
                          </InputAdornment>
                        ),
                        endAdornment: editForm.salary && (
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
                                borderColor: 'primary.300'
                              }}
                            >
                              {getEditSalaryUnit(editForm.salary)}
                            </Box>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Department" value={editForm.department} onChange={(e) => setEditForm(p => ({...p, department: e.target.value}))} error={!!editErrors.department} helperText={editErrors.department} required fullWidth disabled={isViewMode} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Position" value={editForm.position} onChange={(e) => setEditForm(p => ({...p, position: e.target.value}))} error={!!editErrors.position} helperText={editErrors.position} required fullWidth disabled={isViewMode} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Start Date" type="date" value={editForm.startDate} onChange={(e) => setEditForm(p => ({...p, startDate: e.target.value}))} InputLabelProps={{ shrink: true }} fullWidth disabled={isViewMode} />
                  </Grid>
                </Grid>

                {/* Emergency Contact */}
                <Typography variant="h6" sx={{ mt: 3, mb: 2,color: 'warning.light' }}>Emergency Contact</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField label="Contact Name" value={editForm.emergencyContactName} onChange={(e) => setEditForm(p => ({...p, emergencyContactName: e.target.value}))} fullWidth disabled={isViewMode} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField 
                      label="Contact Phone" 
                      value={editForm.emergencyContactPhone} 
                      onChange={(e) => handlePhoneChange(e.target.value, 'emergencyContactPhone')} 
                      fullWidth 
                      disabled={isViewMode}
                      error={!!editErrors.emergencyContactPhone}
                      helperText={editErrors.emergencyContactPhone || ''}
                      inputProps={{ maxLength: 10 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone size={20} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField label="Relation" value={editForm.emergencyContactRelation} onChange={(e) => setEditForm(p => ({...p, emergencyContactRelation: e.target.value}))} fullWidth disabled={isViewMode} />
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            {!isViewMode && (
            <Button
              variant="contained"
              onClick={async () => {
                // basic validation
                const errs: Record<string, string> = {}
                if (!editForm.firstName.trim()) errs.firstName = 'First name is required'
                if (!editForm.lastName.trim()) errs.lastName = 'Last name is required'
                if (!editForm.email.trim()) errs.email = 'Email is required'
                if (!editForm.phone.trim()) {
                  errs.phone = 'Phone is required'
                } else if (editForm.phone.length !== 10) {
                  errs.phone = 'Phone number must be exactly 10 digits'
                }
                if (!editForm.department.trim()) errs.department = 'Department is required'
                if (!editForm.position.trim()) errs.position = 'Position is required'
                
                // Validate Aadhar card number if provided
                if (editForm.aadharCardNumber && editForm.aadharCardNumber.length !== 12) {
                  errs.aadharCardNumber = 'Aadhar card number must be exactly 12 digits'
                }
                
                // Validate emergency contact phone if provided
                if (editForm.emergencyContactPhone && editForm.emergencyContactPhone.length !== 10) {
                  errs.emergencyContactPhone = 'Emergency contact phone must be exactly 10 digits'
                }
                
                // Validate advocate license if employee type is advocate
                if (editForm.employeeType === 'advocate') {
                  if (!editForm.advocateLicenseNumber.trim()) {
                    errs.advocateLicenseNumber = 'Advocate License Number is required'
                  } else {
                    // Validate advocate license format: MAH/XXXX/YYYY
                    const license = editForm.advocateLicenseNumber.trim()
                    
                    // Check if it starts with MAH/
                    if (!license.startsWith('MAH/')) {
                      errs.advocateLicenseNumber = 'License must start with MAH/'
                    } else {
                      const parts = license.split('/')
                      
                      if (parts.length !== 3) {
                        errs.advocateLicenseNumber = 'Invalid license format. Use: MAH/XXXX/YYYY'
                      } else {
                        const [mahPart, middleDigits, yearDigits] = parts
                        
                        // Check MAH part
                        if (mahPart !== 'MAH') {
                          errs.advocateLicenseNumber = 'License must start with MAH/'
                        } else {
                          // Check middle 4 digits are numbers
                          if (!/^\d{4}$/.test(middleDigits)) {
                            errs.advocateLicenseNumber = 'Middle part must be 4 digits'
                          }
                          
                          // Check year is 4 digits and not greater than current year
                          if (!/^\d{4}$/.test(yearDigits)) {
                            errs.advocateLicenseNumber = 'Year must be 4 digits'
                          } else {
                            const year = parseInt(yearDigits)
                            const currentYear = new Date().getFullYear()
                            if (year > currentYear) {
                              errs.advocateLicenseNumber = `Please enter a proper license number. Year cannot be greater than ${currentYear}`
                            }
                          }
                        }
                      }
                    }
                  }
                }
                
                setEditErrors(errs)
                if (Object.keys(errs).length) return

                if (!editEmployeeId) return
                const data: any = {
                  firstName: editForm.firstName.trim(),
                  lastName: editForm.lastName.trim(),
                  email: editForm.email.trim(),
                  phone: editForm.phone.trim(),
                  address: editForm.address.trim(),
                  gender: editForm.gender || undefined,
                  dateOfBirth: editForm.dateOfBirth || undefined,
                  aadharCardNumber: editForm.aadharCardNumber.trim() || undefined,
                  employeeType: editForm.employeeType || undefined,
                  advocateLicenseNumber: editForm.advocateLicenseNumber.trim() || undefined,
                  internYear: editForm.internYear ? Number(editForm.internYear) : undefined,
                  salary: editForm.salary ? Number(editForm.salary) : undefined,
                  department: editForm.department.trim(),
                  position: editForm.position.trim(),
                  startDate: editForm.startDate || undefined,
                  emergencyContactName: editForm.emergencyContactName.trim() || undefined,
                  emergencyContactPhone: editForm.emergencyContactPhone.trim() || undefined,
                  emergencyContactRelation: editForm.emergencyContactRelation.trim() || undefined,
                }
                try {
                  await updateEmployeeByAdmin({ id: editEmployeeId, data }).unwrap()
                  toast.success('Employee updated successfully')
                  handleCloseEditModal()
                  refetchEmployees()
                } catch (e: any) {
                  const msg = e?.data?.message || e?.data?.error || e?.message || 'Failed to update employee'
                  toast.error(msg)
                }
              }}
              disabled={isUpdatingEmployee}
              startIcon={isUpdatingEmployee ? <CircularProgress size={16} /> : undefined}
            >
              {isUpdatingEmployee ? 'Saving...' : 'Save Changes'}
            </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Confirm Deletion
            <IconButton onClick={() => setIsDeleteConfirmOpen(false)} size="small">
              <X size={20} />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              Are you sure you want to delete {deleteTarget ? getFullName(deleteTarget.firstName || '', deleteTarget.lastName || '') : 'this employee'}?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
            <Button
              color="error"
              variant="contained"
              onClick={async () => {
                if (!deleteTarget) return
                const targetId = deleteTarget._id || deleteTarget.id
                if (!targetId) {
                  toast.error('Employee ID not found')
                  return
                }
                await performDelete(targetId)
                setIsDeleteConfirmOpen(false)
              }}
              disabled={!!deletingId}
              startIcon={deletingId ? <CircularProgress size={16} /> : undefined}
            >
              {deletingId ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Invite Employee Modal */}
        <Dialog 
          open={isInviteModalOpen} 
          onClose={handleCloseInviteModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <UserPlusIcon size={20} />
              <Typography variant="h5">Invite Employee</Typography>
            </Box>
            <IconButton onClick={handleCloseInviteModal} size="small">
              <X size={20} />
            </IconButton>
          </DialogTitle>
          
          <DialogContent>
            {inviteSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Employee invitation sent successfully!
              </Alert>
            )}
            
            <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                value={inviteData.firstName}
                onChange={(e) => handleInviteDataChange('firstName', e.target.value)}
                error={!!inviteErrors.firstName}
                helperText={inviteErrors.firstName}
                disabled={isInviting}
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                value={inviteData.lastName}
                onChange={(e) => handleInviteDataChange('lastName', e.target.value)}
                error={!!inviteErrors.lastName}
                helperText={inviteErrors.lastName}
                disabled={isInviting}
                required
              />
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={inviteData.email}
                onChange={(e) => handleInviteDataChange('email', e.target.value)}
                error={!!inviteErrors.email}
                helperText={inviteErrors.email || 'Enter the email address to send invitation'}
                disabled={isInviting}
                placeholder="employee@company.com"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Salary"
                type="text"
                value={inviteData.salary}
                onChange={(e) => handleSalaryChange(e.target.value)}
                error={!!inviteErrors.salary}
                helperText={inviteErrors.salary || 'Enter the salary amount'}
                disabled={isInviting}
                placeholder="50000"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <span style={{ fontSize: '16px', fontWeight: 'bold' }}>₹</span>
                    </InputAdornment>
                  ),
                  endAdornment: inviteData.salary && (
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
                          borderColor: 'primary.300'
                        }}
                      >
                        {getSalaryUnit(inviteData.salary)}
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              variant="contained"
              onClick={handleCloseInviteModal}
              disabled={isInviting}
              sx={{ ...buttonBoxSx }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleInviteEmployee}
              disabled={isInviting}
              startIcon={isInviting ? <CircularProgress size={16} /> : <UserPlusIcon size={16} />}
              sx={{ ...buttonBoxSx }}
            >
              {isInviting ? 'Sending Invite...' : 'Send Invitation'}
            </Button>
          </DialogActions>
        </Dialog>

        
      </Box>
    </Layout>
  )
} 