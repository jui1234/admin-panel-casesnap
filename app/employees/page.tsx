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
  X
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
import { useInviteEmployeeMutation, useGetEmployeesQuery, useUpdateEmployeeStatusMutation } from '@/redux/api/employeesApi'
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
  CircularProgress
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
  const [roleFilter, setRoleFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
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
  // Notifications via react-toastify
  
  // Fetch employees data with server-side filtering
  const { 
    data: employeesData, 
    isLoading: isEmployeesLoading, 
    error: employeesError,
    refetch: refetchEmployees 
  } = useGetEmployeesQuery({
    page: paginationModel.page + 1, // API uses 1-based pagination
    limit: paginationModel.pageSize,
    search: debouncedSearchTerm || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    department: departmentFilter !== 'all' ? departmentFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    employeeType: employeeTypeFilter !== 'all' ? employeeTypeFilter : undefined,
  })

  // Get employees from API or fallback to empty array
  const employees: Employee[] = employeesData?.data || []
  const pagination = employeesData

  // Reset pagination when filters change
  const handleFilterChange = (filterType: string, value: string) => {
    setPaginationModel(prev => ({ ...prev, page: 0 }))
    
    switch (filterType) {
      case 'search':
        setSearchTerm(value)
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
        employeeId: selectedEmployeeForStatus.id,
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

  const handleView = (id: string) => {
    console.log('View employee:', id)
  }

  const handleEdit = (id: string) => {
    console.log('Edit employee:', id)
  }

  const handleDelete = (id: string) => {
    console.log('Delete employee:', id)
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

  const columns: GridColDef[] = [
    {
      field: 'employee',
      headerName: 'Employee',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            {params.row.fullName.split(' ').map((n: string) => n[0]).join('')}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {params.row.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.phone}
        </Typography>
      ),
    },
    {
      field: 'employeeType',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.row.employeeType} 
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.row.department} 
          size="small"
          variant="outlined"
          color="secondary"
        />
      ),
    },
    {
      field: 'position',
      headerName: 'Position',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.position}
        </Typography>
      ),
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
          ₹{params.row.salary.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(params.row.startDate).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(params.row.createdAt).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <ActionMenu
          items={[
            {
              label: 'View',
              icon: <Eye size={18} />,
              onClick: () => handleView(params.row.id),
              color: 'primary'
            },
            {
              label: 'Edit',
              icon: <EditIcon size={18} />,
              onClick: () => handleEdit(params.row.id),
              color: 'primary'
            },
            {
              label: 'Delete',
              icon: <DeleteIcon size={18} />,
              onClick: () => handleDelete(params.row.id),
              color: 'error'
            }
          ]}
        />
      ),
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
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
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
            <Grid item xs={12} sm={6} md={8}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<Filter />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{ ...buttonBoxSx }}
                >
                  Filters
                </Button>
                {showFilters && (
                  <>
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={roleFilter}
                        label="Role"
                        onChange={(e) => handleFilterChange('role', e.target.value)}
                        size="small"
                      >
                        <MenuItem value="all">All Roles</MenuItem>
                        {ROLES.map(role => (
                          <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Department</InputLabel>
                      <Select
                        value={departmentFilter}
                        label="Department"
                        onChange={(e) => handleFilterChange('department', e.target.value)}
                        size="small"
                      >
                        <MenuItem value="all">All Departments</MenuItem>
                        {Array.from(new Set(employees.map(e => e.department))).map(dept => (
                          <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        size="small"
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={employeeTypeFilter}
                        label="Type"
                        onChange={(e) => handleFilterChange('employeeType', e.target.value)}
                        size="small"
                      >
                        <MenuItem value="all">All Types</MenuItem>
                        <MenuItem value="advocate">Advocate</MenuItem>
                        <MenuItem value="intern">Intern</MenuItem>
                        <MenuItem value="staff">Staff</MenuItem>
                      </Select>
                    </FormControl>
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
                value={selectedEmployeeForStatus?.fullName || ''}
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