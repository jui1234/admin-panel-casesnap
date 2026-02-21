'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  UserPlus,
  Edit as EditIcon,
  Delete as DeleteIcon,
  X,
  Mail,
  Phone,
  Check,
  DollarSign,
  MoreVertical
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { ROLES, getRoleById } from '@/utils/roles'
import { useAuth } from '@/contexts/AuthContext'
import { 
  DataGrid, 
  GridColDef, 
  GridToolbar,
} from '@mui/x-data-grid'
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
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import { 
  useInviteUserMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useApproveUserMutation,
  useDeleteUserMutation,
  type User as UserType,
  type UpdateUserRequest
} from '@/redux/api/userApi'
import { useGetRolesQuery } from '@/redux/api/rolesApi'
import { useModulePermissions } from '@/hooks/useModulePermissions'
import toast from 'react-hot-toast'

interface InviteUserData {
  firstName: string
  lastName: string
  email: string
  phone: string
  roleId: string
  userType: 'advocate' | 'intern' | 'non'
  salary: string
}

export default function UsersPage() {
  const { user } = useAuth()
  const { canRead, canCreate, canUpdate, canDelete } = useModulePermissions('user')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
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
  
  // Invite User Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteData, setInviteData] = useState<InviteUserData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    roleId: '',
    userType: 'non',
    salary: ''
  })
  const [inviteErrors, setInviteErrors] = useState<Partial<Record<keyof InviteUserData, string>>>({})
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [invitationLink, setInvitationLink] = useState('')
  
  // View/Edit/Delete/Approve Modal State
  const [viewUser, setViewUser] = useState<UserType | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editUser, setEditUser] = useState<UserType | null>(null)
  const [editForm, setEditForm] = useState<UpdateUserRequest>({})
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteUser, setDeleteUser] = useState<UserType | null>(null)
  
  // Menu state for actions
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedUserForMenu, setSelectedUserForMenu] = useState<UserType | null>(null)
  const isMenuOpen = Boolean(anchorEl)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: UserType) => {
    setAnchorEl(event.currentTarget)
    setSelectedUserForMenu(user)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedUserForMenu(null)
  }

  const handleMenuAction = (action: 'view' | 'edit' | 'approve' | 'delete') => {
    if (!selectedUserForMenu) return
    
    const userId = selectedUserForMenu.id || selectedUserForMenu._id
    handleMenuClose()
    
    switch (action) {
      case 'view':
        handleView(userId)
        break
      case 'edit':
        handleEdit(userId)
        break
      case 'approve':
        handleApprove(userId)
        break
      case 'delete':
        handleDelete(userId)
        break
    }
  }
  
  // API hooks
  const [inviteUser, { isLoading: isInviting }] = useInviteUserMutation()
  const { data: rolesData, isLoading: isLoadingRoles } = useGetRolesQuery()
  const allRoles = rolesData?.data || []

  // Get current user's role priority
  const getCurrentUserPriority = (): number | null => {
    if (!user || !user.role) return null
    
    // If role is a string (legacy), try to find it in roles list
    if (typeof user.role === 'string') {
      const foundRole = allRoles.find(r => r._id === user.role || r.name === user.role)
      return foundRole?.priority || null
    }
    
    // If role is an object, use its priority
    return user.role.priority || null
  }

  const currentUserPriority = getCurrentUserPriority()

  // Filter roles for invite - only show roles with lower authority (higher priority number)
  // Users can only invite users with roles that have priority > their own priority
  const filterRolesForInvite = (roles: typeof allRoles) => {
    if (!currentUserPriority) return roles
    
    // Return only roles with priority greater than current user's priority
    // (lower priority number = higher authority, so we filter out equal/lower priority numbers)
    return roles.filter(role => role.priority > currentUserPriority)
  }

  // Filtered roles for invite user form
  const rolesForInvite = filterRolesForInvite(allRoles)
  
  // All roles for filter dropdown (no restriction needed there)
  const roles = allRoles

  // Fetch users with filters
  const { 
    data: usersData, 
    isLoading: isUsersLoading, 
    error: usersError,
    refetch: refetchUsers 
  } = useGetUsersQuery({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: debouncedSearchTerm || undefined,
    roleId: roleFilter !== 'all' ? roleFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  })

  const users = usersData?.data || []
  const totalUsers = usersData?.count || 0

  // Get single user for view/edit
  const { 
    data: userDetailsData, 
    isLoading: isLoadingUserDetails 
  } = useGetUserByIdQuery(
    { userId: viewUser?.id || editUser?.id || '' }, 
    { skip: !viewUser && !editUser }
  )

  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation()
  const [approveUser, { isLoading: isApprovingUser }] = useApproveUserMutation()
  const [deleteUserMutation, { isLoading: isDeletingUser }] = useDeleteUserMutation()
  
  const router = useRouter()

  // Handle 403 errors for page-level queries - redirect to access denied page ONLY after API call completes
  useEffect(() => {
    // Only check for 403 errors after loading is complete (API call finished)
    if (!isUsersLoading && usersError && 'status' in usersError) {
      const status = usersError.status
      const errorMessage = (usersError as any)?.data?.error || (usersError as any)?.data?.message || ''
      
      // Check for 403 Forbidden error - only redirect if API actually returned 403
      if (status === 403 || errorMessage.toLowerCase().includes('permission') || errorMessage.toLowerCase().includes('access denied')) {
        router.push('/403')
        return
      }
    }
  }, [usersError, isUsersLoading, router])

  const getRoleInfo = (role: string | { _id?: string; id?: string; name: string; priority?: number }) => {
    if (typeof role === 'string') {
      return getRoleById(role)
    }
    const roleId = role._id || role.id
    return roleId ? getRoleById(roleId) : null
  }

  const getRoleName = (role: string | { name: string }) => {
    if (typeof role === 'string') {
      const roleInfo = getRoleById(role)
      return roleInfo?.name || role
    }
    return role.name
  }

  const handleClearFilters = () => {
    setRoleFilter('all')
    setStatusFilter('all')
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success'
      case 'inactive': return 'error'
      case 'pending': return 'warning'
      case 'terminated': return 'error'
      default: return 'default'
    }
  }

  const formatStatus = (status: string) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1) || status
  }

  const getUserFullName = (user: UserType) => {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
  }

  const handleView = async (userId: string) => {
    const user = users.find(u => u.id === userId || u._id === userId)
    if (user) {
      setViewUser(user)
      setIsViewModalOpen(true)
    }
  }

  const handleEdit = async (userId: string) => {
    const user = users.find(u => u.id === userId || u._id === userId)
    if (user) {
      setEditUser(user)
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        roleId: typeof user.role === 'string' ? user.role : user.role?._id || user.role?.id || '',
        userType: user.userType || 'non',
        salary: user.salary,
        status: user.status,
      })
      setEditErrors({})
      setIsEditModalOpen(true)
    }
  }

  const handleApprove = async (userId: string) => {
    try {
      await approveUser({ userId }).unwrap()
      toast.success('User approved successfully')
      refetchUsers()
    } catch (error: any) {
      const status = error?.status
      const errorMessage = error?.data?.error || error?.data?.message || error?.message || 'Failed to approve user'
      
      // For 403 errors, show toast (button-level action)
      if (status === 403 || errorMessage.toLowerCase().includes('permission')) {
        toast.error('You do not have permission to perform this action')
      } else {
        toast.error(errorMessage)
      }
    }
  }

  const handleDelete = (userId: string) => {
    const user = users.find(u => u.id === userId || u._id === userId)
    if (user) {
      setDeleteUser(user)
      setIsDeleteModalOpen(true)
    }
  }

  const confirmDelete = async () => {
    if (!deleteUser) return
    
    try {
      const userId = deleteUser.id || deleteUser._id
      await deleteUserMutation({ userId }).unwrap()
      toast.success('User deleted successfully')
      setIsDeleteModalOpen(false)
      setDeleteUser(null)
      refetchUsers()
    } catch (error: any) {
      const status = error?.status
      const errorMessage = error?.data?.error || error?.data?.message || error?.message || 'Failed to delete user'
      
      // For 403 errors, show toast (button-level action)
      if (status === 403 || errorMessage.toLowerCase().includes('permission')) {
        toast.error('You do not have permission to perform this action')
      } else {
        toast.error(errorMessage)
      }
    }
  }

  const handleUpdateUser = async () => {
    if (!editUser) return

    const errors: Record<string, string> = {}
    if (!editForm.firstName?.trim()) errors.firstName = 'First name is required'
    if (!editForm.lastName?.trim()) errors.lastName = 'Last name is required'
    if (!editForm.email?.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      errors.email = 'Please enter a valid email address'
    }

    setEditErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      const userId = editUser.id || editUser._id
      await updateUser({ userId, data: editForm }).unwrap()
      toast.success('User updated successfully')
      setIsEditModalOpen(false)
      setEditUser(null)
      setEditForm({})
      refetchUsers()
    } catch (error: any) {
      const status = error?.status
      const errorMessage = error?.data?.error || error?.data?.message || error?.message || 'Failed to update user'
      
      // For 403 errors, show toast (button-level action)
      if (status === 403 || errorMessage.toLowerCase().includes('permission')) {
        toast.error('You do not have permission to perform this action')
      } else {
        toast.error(errorMessage)
      }
    }
  }

  // Invite User Functions
  const validateInviteData = (): boolean => {
    const errors: Partial<Record<keyof InviteUserData, string>> = {}
    
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
    if (!inviteData.phone.trim()) {
      errors.phone = 'Phone number is required'
    } else if (!/^[0-9]{10}$/.test(inviteData.phone.trim())) {
      errors.phone = 'Phone number must be exactly 10 digits'
    }
    if (!inviteData.roleId) {
      errors.roleId = 'Role is required'
    }
    if (!inviteData.userType) {
      errors.userType = 'User type is required'
    }
    
    if (!inviteData.salary.trim()) {
      errors.salary = 'Salary is required'
    } else if (!/^\d+(\.\d{1,2})?$/.test(inviteData.salary)) {
      errors.salary = 'Please enter a valid salary amount'
    }

    setInviteErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInviteUser = async () => {
    if (!validateInviteData()) {
      return
    }
    
    setInviteSuccess(false)
    
    try {
      const res = await inviteUser({
        firstName: inviteData.firstName.trim(),
        lastName: inviteData.lastName.trim(),
        email: inviteData.email.trim(),
        phone: inviteData.phone.trim(),
        roleId: inviteData.roleId,
        userType: inviteData.userType,
        salary: parseFloat(inviteData.salary.trim()),
      }).unwrap()
      
      toast.success(res.message || 'Invitation sent successfully!')

      // Reset form
      setInviteData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        roleId: '',
        userType: 'non',
        salary: ''
      })
      setInviteErrors({})
      setInviteSuccess(true)
      
      // Refetch users list
      refetchUsers()
      
      // Close modal after success
      setTimeout(() => {
        setIsInviteModalOpen(false)
        setInviteSuccess(false)
        setInvitationLink('')
      }, 3000)
      
    } catch (error: any) {
      console.error('Error inviting user:', error)
      
      // Display backend error message
      let errorMessage = 'Failed to send invitation. Please try again.'
      
      if (error?.data?.error) {
        errorMessage = error.data.error
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
      
      // Show error in the modal
      setInviteErrors({ 
        email: errorMessage 
      })
    }
  }

  const handleInviteDataChange = (field: keyof InviteUserData, value: string) => {
    setInviteData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (inviteErrors[field]) {
      setInviteErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const capitalizeFirstLetter = (value: string) =>
    value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value

  const handlePhoneChange = (value: string) => {
    // Only allow digits, max 10 digits
    const digitsOnly = value.replace(/[^0-9]/g, '').slice(0, 10)
    handleInviteDataChange('phone', digitsOnly)
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
    
    // Helper function to format number with max 3 digits total
    const formatWithMaxDigits = (value: number, unit: string): string => {
      // If value >= 1000, round to fit in 3 digits (e.g., 78789 -> 788)
      if (value >= 1000) {
        // Round to nearest value that fits in 3 digits
        return `${Math.round(value)} ${unit}`
      } else if (value >= 100) {
        // 100-999: show as whole number (3 digits max)
        return `${Math.round(value)} ${unit}`
      } else if (value >= 10) {
        // 10-99: show with 1 decimal (e.g., "78.9") = 4 chars total but only 3 significant digits
        // Or show as whole if it's close to whole number
        const rounded = Math.round(value)
        if (Math.abs(value - rounded) < 0.1) {
          return `${rounded} ${unit}`
        }
        return `${value.toFixed(1)} ${unit}`
      } else {
        // 1-9: show with 1 decimal (e.g., "7.8")
        return `${value.toFixed(1)} ${unit}`
      }
    }
    
    if (num >= 10000000) { // 1 crore
      const cr = num / 10000000
      return formatWithMaxDigits(cr, 'Cr')
    } else if (num >= 100000) { // 1 lakh
      const lakh = num / 100000
      return formatWithMaxDigits(lakh, 'L')
    } else if (num >= 1000) { // 1 thousand
      const k = num / 1000
      return formatWithMaxDigits(k, 'K')
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
        phone: '',
        roleId: '',
        userType: 'non',
        salary: ''
      })
    setInviteErrors({})
    setInviteSuccess(false)
    setInvitationLink('')
  }

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
      valueGetter: (params) => params.row.id || params.row._id,
    },
    {
      field: 'user',
      headerName: 'User',
      width: 250,
      renderCell: (params) => {
        const fullName = getUserFullName(params.row)
        const initials = `${params.row.firstName?.[0] || ''}${params.row.lastName?.[0] || ''}`.toUpperCase() || params.row.email?.[0]?.toUpperCase() || '?'
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
                {params.row.email}
              </Typography>
            </Box>
          </Box>
        )
      },
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 150,
      renderCell: (params) => {
        const roleName = getRoleName(params.row.role)
        const roleInfo = getRoleInfo(params.row.role)
        return (
          <Chip 
            label={roleName} 
            size="small"
            sx={roleInfo ? {
              bgcolor: roleInfo.color.split(' ')[0].replace('bg-', ''),
              color: roleInfo.color.split(' ')[1].replace('text-', ''),
              fontWeight: 600
            } : {}}
          />
        )
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={formatStatus(params.row.status)} 
          color={getStatusColor(params.row.status) as any}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'userType',
      headerName: 'User Type',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" textTransform="capitalize">
          {params.row.userType || 'N/A'}
        </Typography>
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
    ...(canRead || canUpdate || canDelete
      ? [
          {
            field: 'actions',
            headerName: 'Actions',
            width: 80,
            sortable: false,
            renderCell: (params) => {
              const rowUser = params.row as UserType
              return (
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, rowUser)}
                  sx={{ ml: 1 }}
                >
                  <MoreVertical size={18} />
                </IconButton>
              )
            },
          },
        ]
      : []),
  ]

  return (
    <ProtectedRoute>
      <Box sx={{ p: 3 }}>
        {/* Page Header */}
        <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Users
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage user accounts and permissions
            </Typography>
          </Box>
          {canCreate && (
            <Button
              variant="contained"
              startIcon={<UserPlus />}
              onClick={() => setIsInviteModalOpen(true)}
              sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
            >
              Invite User
            </Button>
          )}
        </Box>

        {/* Search and Filters */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm('')}
                        edge="end"
                        sx={{ padding: '4px' }}
                      >
                        <X size={18} />
                      </IconButton>
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
                        onChange={(e) => setRoleFilter(e.target.value)}
                        size="small"
                        disabled={isLoadingRoles}
                      >
                        <MenuItem value="all">All Roles</MenuItem>
                        {roles.map(role => (
                          <MenuItem key={role._id} value={role._id}>{role.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                        size="small"
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                      </Select>
                    </FormControl>
                    {(roleFilter !== 'all' || statusFilter !== 'all') && (
                      <Button
                        variant="outlined"
                        startIcon={<X size={16} />}
                        onClick={handleClearFilters}
                        size="small"
                        sx={{
                          borderColor: 'text.secondary',
                          color: 'text.secondary',
                          '&:hover': {
                            borderColor: 'text.primary',
                            color: 'text.primary',
                            bgcolor: 'action.hover'
                          }
                        }}
                      >
                        Clear All
                      </Button>
                    )}
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Users Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ p: 1, bgcolor: 'primary.100', borderRadius: 1, mr: 2 }}>
                    <Users color="primary" />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Users
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {totalUsers}
                    </Typography>
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
                    <Box sx={{ width: 24, height: 24, bgcolor: 'success.main', borderRadius: '50%' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Approved
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {users.filter(u => u.status?.toLowerCase() === 'approved').length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ p: 1, bgcolor: 'error.100', borderRadius: 1, mr: 2 }}>
                    <Box sx={{ width: 24, height: 24, bgcolor: 'error.main', borderRadius: '50%' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Inactive
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {users.filter(u => u.status?.toLowerCase() === 'inactive').length}
                    </Typography>
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
                    <Box sx={{ width: 24, height: 24, bgcolor: 'warning.main', borderRadius: '50%' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {users.filter(u => u.status?.toLowerCase() === 'pending').length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Users DataGrid */}
        <Card>
          <Box sx={{ height: 600, width: '100%' }}>
            {isUsersLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : usersError ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Alert severity="error">Failed to load users. Please try again.</Alert>
              </Box>
            ) : (
              <DataGrid
                rows={users}
                columns={columns}
                getRowId={(row) => row.id || row._id}
                rowCount={totalUsers}
                paginationMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 25, 50]}
                loading={isUsersLoading}
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

        {/* Invite User Modal */}
        <Dialog 
          open={isInviteModalOpen} 
          onClose={handleCloseInviteModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <UserPlus size={20} />
              <Typography variant="h5">Invite User</Typography>
            </Box>
            <IconButton onClick={handleCloseInviteModal} size="small">
              <X size={20} />
            </IconButton>
          </DialogTitle>
          
          <DialogContent>
            {inviteSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Invitation sent successfully!
              </Alert>
            )}
            
            <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                value={inviteData.firstName}
                onChange={(e) => handleInviteDataChange('firstName', capitalizeFirstLetter(e.target.value))}
                error={!!inviteErrors.firstName}
                helperText={inviteErrors.firstName}
                disabled={isInviting}
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                value={inviteData.lastName}
                onChange={(e) => handleInviteDataChange('lastName', capitalizeFirstLetter(e.target.value))}
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
                placeholder="user@company.com"
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
                label="Phone Number"
                type="tel"
                value={inviteData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                error={!!inviteErrors.phone}
                helperText={inviteErrors.phone || 'Enter 10-digit phone number'}
                disabled={isInviting}
                placeholder="1234567890"
                required
                inputProps={{
                  maxLength: 10,
                  pattern: '[0-9]{10}'
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone size={20} />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl fullWidth required error={!!inviteErrors.roleId} sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={inviteData.roleId}
                  label="Role"
                  onChange={(e) => handleInviteDataChange('roleId', e.target.value)}
                  disabled={isInviting || isLoadingRoles}
                >
                  {rolesForInvite.length === 0 ? (
                    <MenuItem disabled value="">
                      No roles available
                    </MenuItem>
                  ) : (
                    rolesForInvite.map(role => (
                      <MenuItem key={role._id} value={role._id}>
                        {role.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {inviteErrors.roleId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {inviteErrors.roleId}
                  </Typography>
                )}
              </FormControl>
              
              <FormControl fullWidth required error={!!inviteErrors.userType} sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  User Type *
                </Typography>
                <RadioGroup
                  row
                  value={inviteData.userType}
                  onChange={(e) => handleInviteDataChange('userType', e.target.value as 'advocate' | 'intern' | 'non')}
                >
                  <FormControlLabel 
                    value="advocate" 
                    control={<Radio />} 
                    label="Advocate" 
                    disabled={isInviting}
                  />
                  <FormControlLabel 
                    value="intern" 
                    control={<Radio />} 
                    label="Intern" 
                    disabled={isInviting}
                  />
                  <FormControlLabel 
                    value="non" 
                    control={<Radio />} 
                    label="Non-Advocate" 
                    disabled={isInviting}
                  />
                </RadioGroup>
                {inviteErrors.userType && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {inviteErrors.userType}
                  </Typography>
                )}
              </FormControl>
              
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
              variant="outlined"
              onClick={handleCloseInviteModal}
              disabled={isInviting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleInviteUser}
              disabled={isInviting || isLoadingRoles}
              startIcon={isInviting ? <CircularProgress size={16} /> : <UserPlus size={16} />}
            >
              {isInviting ? 'Sending Invite...' : 'Send Invitation'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View User Modal */}
        <Dialog 
          open={isViewModalOpen} 
          onClose={() => setIsViewModalOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5">User Details</Typography>
            <IconButton onClick={() => setIsViewModalOpen(false)} size="small">
              <X size={20} />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {isLoadingUserDetails ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : viewUser || userDetailsData?.data ? (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">First Name</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {userDetailsData?.data?.firstName || viewUser?.firstName || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Last Name</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {userDetailsData?.data?.lastName || viewUser?.lastName || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {userDetailsData?.data?.email || viewUser?.email || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Phone</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {userDetailsData?.data?.phone || viewUser?.phone || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Role</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {getRoleName(userDetailsData?.data?.role || viewUser?.role || '')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">User Type</Typography>
                  <Typography variant="body1" fontWeight={500} textTransform="capitalize">
                    {userDetailsData?.data?.userType || viewUser?.userType || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Salary</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {userDetailsData?.data?.salary || viewUser?.salary 
                      ? `₹${(userDetailsData?.data?.salary || viewUser?.salary || 0).toLocaleString()}` 
                      : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip 
                      label={formatStatus(userDetailsData?.data?.status || viewUser?.status || '')} 
                      color={getStatusColor(userDetailsData?.data?.status || viewUser?.status || '') as any}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Grid>
              </Grid>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Edit User Modal */}
        <Dialog 
          open={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5">Edit User</Typography>
            <IconButton onClick={() => setIsEditModalOpen(false)} size="small">
              <X size={20} />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={editForm.firstName || ''}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  error={!!editErrors.firstName}
                  helperText={editErrors.firstName}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={editForm.lastName || ''}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  error={!!editErrors.lastName}
                  helperText={editErrors.lastName}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  error={!!editErrors.email}
                  helperText={editErrors.email}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={editForm.roleId || ''}
                    label="Role"
                    onChange={(e) => setEditForm({ ...editForm, roleId: e.target.value })}
                  >
                    {roles.map(role => (
                      <MenuItem key={role._id} value={role._id}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>User Type</InputLabel>
                  <Select
                    value={editForm.userType || 'non'}
                    label="User Type"
                    onChange={(e) => setEditForm({ ...editForm, userType: e.target.value as 'advocate' | 'intern' | 'non' })}
                  >
                    <MenuItem value="advocate">Advocate</MenuItem>
                    <MenuItem value="intern">Intern</MenuItem>
                    <MenuItem value="non">Non-Advocate</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Salary"
                  type="number"
                  value={editForm.salary || ''}
                  onChange={(e) => setEditForm({ ...editForm, salary: parseFloat(e.target.value) || undefined })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editForm.status || ''}
                    label="Status"
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="terminated">Terminated</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditModalOpen(false)} disabled={isUpdatingUser}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleUpdateUser}
              disabled={isUpdatingUser}
              startIcon={isUpdatingUser ? <CircularProgress size={16} /> : <EditIcon size={16} />}
            >
              {isUpdatingUser ? 'Updating...' : 'Update User'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog 
          open={isDeleteModalOpen} 
          onClose={() => setIsDeleteModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h5">Delete User</Typography>
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone.
            </Alert>
            {deleteUser && (
              <Typography>
                Are you sure you want to delete <strong>{getUserFullName(deleteUser)}</strong> ({deleteUser.email})?
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDeleteModalOpen(false)} disabled={isDeletingUser}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="error"
              onClick={confirmDelete}
              disabled={isDeletingUser}
              startIcon={isDeletingUser ? <CircularProgress size={16} /> : <DeleteIcon size={16} />}
            >
              {isDeletingUser ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {canRead && (
            <MenuItem onClick={() => handleMenuAction('view')}>
              <ListItemIcon>
                <Eye size={18} />
              </ListItemIcon>
              <ListItemText>View</ListItemText>
            </MenuItem>
          )}
          {canUpdate && (
            <MenuItem onClick={() => handleMenuAction('edit')}>
              <ListItemIcon>
                <EditIcon size={18} />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
          )}
          {canUpdate && selectedUserForMenu?.status?.toLowerCase() === 'pending' && (
            <MenuItem onClick={() => handleMenuAction('approve')}>
              <ListItemIcon>
                <Check size={18} />
              </ListItemIcon>
              <ListItemText>Approve</ListItemText>
            </MenuItem>
          )}
          {canDelete && (
            <MenuItem 
              onClick={() => handleMenuAction('delete')}
              disabled={selectedUserForMenu?.status?.toLowerCase() === 'terminated'}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon>
                <DeleteIcon size={18} />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </Box>
    </ProtectedRoute>
  )
} 