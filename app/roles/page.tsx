'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Shield,
  X,
  Check,
  Save,
  Trash2,
  AlertCircle
} from 'lucide-react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Box, 
  Button, 
  TextField, 
  InputAdornment, 
  Card, 
  CardContent, 
  Typography, 
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Tooltip
} from '@mui/material'
import { 
  useGetRolesQuery,
  useGetSuggestedPriorityQuery,
  useGetModulesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  type Role,
  type RolePermission,
  type Module
} from '@/redux/api/rolesApi'
import { useModulePermissions } from '@/hooks/useModulePermissions'
import toast from 'react-hot-toast'

const DEFAULT_ACTIONS = ['create', 'read', 'update', 'delete'] as const

interface PermissionState {
  module: string
  selected: boolean
  actions: string[]
}

interface RoleFormData {
  name: string
  description: string
  priority: number
  permissions: PermissionState[]
}

export default function RolesPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { canCreate, canUpdate, canDelete } = useModulePermissions('role')
  const [searchTerm, setSearchTerm] = useState('')
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    priority: 2,
    permissions: []
  })
  const [useSuggestedPriority, setUseSuggestedPriority] = useState(true)

  // API hooks - Force refetch on mount
  const { data: rolesData, isLoading: isLoadingRoles, error: rolesError, refetch } = useGetRolesQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true
  })
  const { data: suggestedPriorityData, isLoading: isLoadingPriority } = useGetSuggestedPriorityQuery()
  const { data: modulesData, isLoading: isLoadingModules } = useGetModulesQuery()
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation()
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation()
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation()

  const roles = rolesData?.data || []
  const suggestedPriority = suggestedPriorityData?.data?.suggestedPriority || 2
  // Show all modules including "role" and "user"
  const modules = modulesData?.data || []

  // Get current user's role priority
  const getCurrentUserPriority = (): number | null => {
    if (!user || !user.role) return null
    
    // If role is a string (legacy), try to find it in roles list
    if (typeof user.role === 'string') {
      const foundRole = roles.find(r => r._id === user.role || r.id === user.role || r.name === user.role)
      return foundRole?.priority || null
    }
    
    // If role is an object, use its priority
    return user.role.priority || null
  }

  const currentUserPriority = getCurrentUserPriority()

  // Check if user can edit a role (can only edit roles with lower priority)
  const canEditRole = (role: Role): boolean => {
    if (!currentUserPriority) return false
    // User can only edit roles with priority greater than their own (lower priority number = higher authority)
    // So if user has priority 3, they can edit roles with priority 4, 5, etc. (higher numbers)
    // They cannot edit roles with priority 1, 2, or 3 (equal or higher authority)
    return role.priority > currentUserPriority
  }

  // Check if user can delete a role (can only delete roles with lower priority)
  const canDeleteRole = (role: Role): boolean => {
    if (!currentUserPriority) return false
    // User can only delete roles with priority greater than their own (lower priority number = higher authority)
    // So if user has priority 3, they can delete roles with priority 4, 5, etc. (higher numbers)
    // They cannot delete roles with priority 1, 2, or 3 (equal or higher authority)
    return role.priority > currentUserPriority
  }

  // Initialize form permissions when modules are loaded
  useEffect(() => {
    if (modules.length > 0 && formData.permissions.length === 0) {
      setFormData(prev => ({
        ...prev,
        permissions: modules.map(module => ({
          module: module.name,
          selected: false,
          actions: []
        }))
      }))
    }
  }, [modules])

  // Force refetch on mount to ensure API is called
  useEffect(() => {
    console.log('Roles page mounted, calling API...')
    refetch()
  }, [refetch])

  const router = useRouter()

  // Handle 403 errors - redirect to access denied page ONLY after API call completes
  useEffect(() => {
    // Only check for 403 errors after loading is complete (API call finished)
    if (!isLoadingRoles && rolesError && 'status' in rolesError) {
      const status = rolesError.status
      const errorMessage = (rolesError as any)?.data?.error || (rolesError as any)?.data?.message || ''
      
      // Check for 403 Forbidden error - only redirect if API actually returned 403
      if (status === 403 || errorMessage.toLowerCase().includes('permission') || errorMessage.toLowerCase().includes('access denied')) {
        router.push('/403')
        return
      }
    }
  }, [rolesError, isLoadingRoles, router])

  // Debug: Log API response
  useEffect(() => {
    console.log('=== Roles API Debug ===')
    console.log('Is Loading:', isLoadingRoles)
    console.log('Roles Data:', rolesData)
    console.log('Roles Error:', rolesError)
    if (rolesData) {
      console.log('API Response:', rolesData)
      console.log('Success:', rolesData.success)
      console.log('Count:', rolesData.count)
      console.log('Roles Array:', rolesData.data)
      console.log('Roles Length:', rolesData.data?.length)
    }
    if (rolesError) {
      console.error('Roles API Error:', rolesError)
      console.error('Error Details:', JSON.stringify(rolesError, null, 2))
    }
  }, [rolesData, rolesError, isLoadingRoles])

  // Filter roles based on search
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Initialize form with suggested priority
  useEffect(() => {
    if (suggestedPriority && useSuggestedPriority) {
      setFormData(prev => ({ ...prev, priority: suggestedPriority }))
    }
  }, [suggestedPriority, useSuggestedPriority])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      priority: suggestedPriority || 2,
      permissions: modules.map(module => ({
        module: module.name,
        selected: false,
        actions: []
      }))
    })
    setUseSuggestedPriority(true)
  }

  const handleOpenCreateDialog = () => {
    if (!canCreate) {
      toast.error("You don't have permission to create roles")
      return
    }
    resetForm()
    setOpenCreateDialog(true)
  }

  const handleOpenEditDialog = (role: Role) => {
    if (!canUpdate) {
      toast.error("You don't have permission to edit roles")
      return
    }
    if (!canEditRole(role)) {
      toast.error("You don't have permission to edit this role")
      return
    }
    
    setSelectedRole(role)
    setFormData({
      name: role.name,
      description: role.description || '',
      priority: role.priority,
      permissions: modules.map(module => {
        const existingPermission = role.permissions.find(p => p.module === module.name)
        return {
          module: module.name,
          selected: !!existingPermission,
          actions: existingPermission?.actions || []
        }
      })
    })
    setUseSuggestedPriority(false)
    setOpenEditDialog(true)
  }

  const handleOpenDeleteDialog = (role: Role) => {
    if (!canDelete) {
      toast.error("You don't have permission to delete roles")
      return
    }
    if (!canDeleteRole(role)) {
      toast.error("You don't have permission to delete this role")
      return
    }
    
    setSelectedRole(role)
    setOpenDeleteDialog(true)
  }

  const handleModuleToggle = (moduleName: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.map(p =>
        p.module === moduleName
          ? { ...p, selected: !p.selected, actions: !p.selected ? ['read'] : [] }
          : p
      )
    }))
  }

  const handleActionToggle = (moduleName: string, action: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.map(p => {
        if (p.module === moduleName) {
          const hasAction = p.actions.includes(action)
          return {
            ...p,
            actions: hasAction
              ? p.actions.filter(a => a !== action)
              : [...p.actions, action]
          }
        }
        return p
      })
    }))
  }

  const buildPermissionsPayload = (): RolePermission[] => {
    return formData.permissions
      .filter(p => p.selected && p.actions.length > 0)
      .map(p => ({
        module: p.module,
        actions: p.actions
      }))
  }

  const handleCreateRole = async () => {
    if (!canCreate) {
      toast.error("You don't have permission to create roles")
      return
    }
    if (!formData.name.trim()) {
      toast.error('Role name is required')
      return
    }
    if (formData.priority < 1) {
      toast.error('Priority must be a positive number')
      return
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        permissions: buildPermissionsPayload()
      }

      await createRole(payload).unwrap()
      toast.success('Role created successfully!')
      setOpenCreateDialog(false)
      resetForm()
      refetch()
    } catch (error: any) {
      const status = error?.status
      const errorMessage = error?.data?.error || error?.data?.message || error?.message || 'Failed to create role'
      
      // For 403 errors, show toast (button-level action)
      if (status === 403 || errorMessage.toLowerCase().includes('permission')) {
        toast.error('You do not have permission to perform this action')
      } else {
        toast.error(errorMessage)
      }
    }
  }

  const handleRoleNameChange = (value: string) => {
    // Capitalize first letter
    if (value.length > 0) {
      const capitalized = value.charAt(0).toUpperCase() + value.slice(1)
      setFormData({ ...formData, name: capitalized })
    } else {
      setFormData({ ...formData, name: value })
    }
  }

  const handleUpdateRole = async () => {
    if (!selectedRole) return
    if (!canUpdate) {
      toast.error("You don't have permission to edit roles")
      return
    }
    if (!canEditRole(selectedRole)) {
      toast.error("You don't have permission to edit this role")
      return
    }

    if (!formData.name.trim()) {
      toast.error('Role name is required')
      return
    }

    if (formData.priority < 1) {
      toast.error('Priority must be a positive number')
      return
    }

    // Prevent changing priority to a value that user can't edit
    if (formData.priority <= (currentUserPriority || 0)) {
      toast.error("You can't set a priority level equal to or higher than your own role")
      return
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        permissions: buildPermissionsPayload()
      }

      await updateRole({ roleId: selectedRole._id, data: payload }).unwrap()
      toast.success('Role updated successfully!')
      setOpenEditDialog(false)
      setSelectedRole(null)
      refetch()
    } catch (error: any) {
      const status = error?.status
      const errorMessage = error?.data?.error || error?.data?.message || error?.message || 'Failed to update role'
      
      // For 403 errors, show toast (button-level action)
      if (status === 403 || errorMessage.toLowerCase().includes('permission')) {
        toast.error('You do not have permission to perform this action')
      } else {
        toast.error(errorMessage)
      }
    }
  }

  const handleDeleteRole = async () => {
    if (!selectedRole) return
    if (!canDelete) {
      toast.error("You don't have permission to delete roles")
      return
    }
    if (!canDeleteRole(selectedRole)) {
      toast.error("You don't have permission to delete this role")
      return
    }

    try {
      await deleteRole({ roleId: selectedRole._id }).unwrap()
      toast.success('Role deleted successfully!')
      setOpenDeleteDialog(false)
      setSelectedRole(null)
      refetch()
    } catch (error: any) {
      const status = error?.status
      const errorMessage = error?.data?.error || error?.data?.message || error?.message || 'Failed to delete role'
      
      // For 403 errors, show toast (button-level action)
      if (status === 403 || errorMessage.toLowerCase().includes('permission')) {
        toast.error('You do not have permission to perform this action')
      } else {
        toast.error(errorMessage)
      }
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return 'error'
    if (priority <= 3) return 'warning'
    return 'default'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Force refetch on mount to ensure API is called
  useEffect(() => {
    console.log('Roles page mounted, refetching roles...')
    refetch()
  }, [refetch])

  if (isAuthLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Layout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
    <Layout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Role Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create and manage roles with custom permissions
            </Typography>
            {rolesData && (
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                Total: {rolesData.count} role{rolesData.count !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              onClick={() => {
                console.log('Manual refetch triggered')
                refetch()
              }}
              disabled={isLoadingRoles}
              sx={{ mr: 1 }}
            >
              {isLoadingRoles ? <CircularProgress size={20} /> : 'Refresh'}
            </Button>
            {canCreate && (
              <Button
                variant="contained"
                startIcon={<Plus />}
                onClick={handleOpenCreateDialog}
                sx={{
                  bgcolor: '#fbbf24',
                  color: '#1f2937',
                  '&:hover': {
                    bgcolor: '#f59e0b'
                  }
                }}
              >
                Create Role
              </Button>
            )}
          </Box>
        </Box>

        {/* Search Bar */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Search roles by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
          </CardContent>
        </Card>

        {/* Roles List */}
        {isLoadingRoles ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={4}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading roles...
            </Typography>
          </Box>
        ) : rolesError ? (
          <Card>
            <CardContent>
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Error Loading Roles
                </Typography>
                <Typography variant="body2">
                  {(rolesError as any)?.data?.error || (rolesError as any)?.message || 'Failed to fetch roles. Please try again.'}
                </Typography>
              </Alert>
              <Button
                variant="contained"
                onClick={() => refetch()}
                sx={{
                  bgcolor: '#fbbf24',
                  color: '#1f2937',
                  '&:hover': {
                    bgcolor: '#f59e0b'
                  }
                }}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : filteredRoles.length === 0 ? (
          <Card>
            <CardContent>
              <Box textAlign="center" py={4}>
                <Shield size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchTerm ? 'No roles found' : 'No roles created yet'}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {searchTerm ? 'Try adjusting your search terms' : 'Create your first role to get started'}
                </Typography>
                {rolesData && rolesData.count !== undefined && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Total roles: {rolesData.count}
                  </Typography>
                )}
                {!searchTerm && canCreate && (
                  <Button
                    variant="contained"
                    startIcon={<Plus />}
                    onClick={handleOpenCreateDialog}
                    sx={{
                      bgcolor: '#fbbf24',
                      color: '#1f2937',
                      '&:hover': {
                        bgcolor: '#f59e0b'
                      }
                    }}
                  >
                    Create Role
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Box>
            {rolesData && rolesData.count !== undefined && (
              <Typography variant="body2" color="text.secondary" mb={2}>
                Showing {filteredRoles.length} of {rolesData.count} role{rolesData.count !== 1 ? 's' : ''}
                {searchTerm && ` (filtered by "${searchTerm}")`}
              </Typography>
            )}
            <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={2}>
              {filteredRoles.map((role) => (
              <Card key={role._id} sx={{ position: 'relative' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {role.name}
                      </Typography>
                      {role.isSystemRole && (
                        <Chip
                          label="System Role"
                          size="small"
                          color="primary"
                          sx={{ mb: 1 }}
                        />
                      )}
                      <Chip
                        label={`Priority: ${role.priority}`}
                        size="small"
                        color={getPriorityColor(role.priority) as any}
                        sx={{ ml: role.isSystemRole ? 1 : 0 }}
                      />
                    </Box>
                    {!role.isSystemRole && (canUpdate || canDelete) && (
                      <Box>
                        {canUpdate && (
                          canEditRole(role) ? (
                            <Tooltip title="Edit Role">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenEditDialog(role)}
                                sx={{ mr: 0.5 }}
                              >
                                <EditIcon size={18} />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="You don't have permission to edit this role">
                              <span>
                                <IconButton
                                  size="small"
                                  disabled
                                  sx={{ mr: 0.5, opacity: 0.5 }}
                                >
                                  <EditIcon size={18} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )
                        )}
                        {canDelete && (
                          canDeleteRole(role) ? (
                            <Tooltip title="Delete Role">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleOpenDeleteDialog(role)}
                              >
                                <DeleteIcon size={18} />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="You don't have permission to delete this role">
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  disabled
                                  sx={{ opacity: 0.5 }}
                                >
                                  <DeleteIcon size={18} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )
                        )}
                      </Box>
                    )}
                  </Box>

                  {role.description && (
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {role.description}
                    </Typography>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                    Permissions:
                  </Typography>
                  {role.permissions.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      No permissions assigned
                    </Typography>
                  ) : (
                    <Box>
                      {role.permissions.map((permission, idx) => (
                        <Box key={idx} mb={1}>
                          <Typography variant="body2" fontWeight="medium">
                            {permission.module.charAt(0).toUpperCase() + permission.module.slice(1)}:
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={0.5} ml={2}>
                            {permission.actions.map((action) => (
                              <Chip
                                key={action}
                                label={action}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {role.createdBy && (
                    <Box mt={2} pt={2} borderTop="1px solid" borderColor="divider">
                      <Typography variant="caption" color="text.secondary">
                        Created by: {role.createdBy.firstName} {role.createdBy.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Created: {formatDate(role.createdAt)}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* Create Role Dialog */}
        <Dialog
          open={openCreateDialog}
          onClose={() => setOpenCreateDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Create New Role</Typography>
              <IconButton onClick={() => setOpenCreateDialog(false)} size="small">
                <X />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Role Name"
                value={formData.name}
                onChange={(e) => handleRoleNameChange(e.target.value)}
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />

              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <TextField
                  label="Priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                  inputProps={{ min: 1 }}
                  sx={{ width: 150 }}
                  required
                />
                <Box>
                  {useSuggestedPriority && suggestedPriority && (
                    <Typography variant="caption" color="text.secondary">
                      Suggested: {suggestedPriority}
                    </Typography>
                  )}
                  <Button
                    size="small"
                    onClick={() => {
                      setUseSuggestedPriority(!useSuggestedPriority)
                      if (!useSuggestedPriority && suggestedPriority) {
                        setFormData({ ...formData, priority: suggestedPriority })
                      }
                    }}
                  >
                    {useSuggestedPriority ? 'Edit Manually' : 'Use Suggested'}
                  </Button>
                </Box>
              </Box>

              <FormControl 
                component="fieldset" 
                fullWidth
                disabled={selectedRole ? !canEditRole(selectedRole) : false}
              >
                <FormLabel component="legend">Permissions</FormLabel>
                <FormGroup>
                  {formData.permissions.map((permission) => (
                    <Box key={permission.module} mb={2} p={2} border="1px solid" borderColor="divider" borderRadius={1}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={permission.selected}
                            onChange={() => handleModuleToggle(permission.module)}
                          />
                        }
                        label={
                          <Typography variant="subtitle2" fontWeight="bold">
                            {permission.module.charAt(0).toUpperCase() + permission.module.slice(1)}
                          </Typography>
                        }
                      />
                      {permission.selected && (
                        <Box ml={4} mt={1}>
                          {(modules.find(m => m.name === permission.module)?.actions ?? [...DEFAULT_ACTIONS]).map((action) => (
                            <FormControlLabel
                              key={action}
                              control={
                                <Checkbox
                                  checked={permission.actions.includes(action)}
                                  onChange={() => handleActionToggle(permission.module, action)}
                                />
                              }
                              label={action.charAt(0).toUpperCase() + action.slice(1)}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  ))}
                </FormGroup>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleCreateRole}
              disabled={isCreating || isLoadingPriority}
              startIcon={isCreating ? <CircularProgress size={16} /> : <Check />}
              sx={{
                bgcolor: '#fbbf24',
                color: '#1f2937',
                '&:hover': {
                  bgcolor: '#f59e0b'
                }
              }}
            >
              Create Role
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Role Dialog */}
        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Edit Role</Typography>
              <IconButton onClick={() => setOpenEditDialog(false)} size="small">
                <X />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              {selectedRole && !canEditRole(selectedRole) && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  You don't have permission to edit this role. This role has higher authority than yours.
                </Alert>
              )}

              <TextField
                fullWidth
                label="Role Name"
                value={formData.name}
                onChange={(e) => handleRoleNameChange(e.target.value)}
                required
                disabled={selectedRole ? !canEditRole(selectedRole) : false}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                disabled={selectedRole ? !canEditRole(selectedRole) : false}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                inputProps={{ 
                  min: currentUserPriority ? currentUserPriority + 1 : 1,
                  max: 999
                }}
                disabled={selectedRole ? !canEditRole(selectedRole) : false}
                helperText={currentUserPriority ? `Must be a lower authority level than ${currentUserPriority}` : undefined}
                sx={{ width: 150, mb: 2 }}
                required
              />

              <FormControl 
                component="fieldset" 
                fullWidth
                disabled={selectedRole ? !canEditRole(selectedRole) : false}
              >
                <FormLabel component="legend">Permissions</FormLabel>
                <FormGroup>
                  {isLoadingModules ? (
                    <Box display="flex" justifyContent="center" p={2}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : formData.permissions.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" p={2}>
                      No modules available
                    </Typography>
                  ) : (
                    formData.permissions.map((permission) => {
                      const moduleInfo = modules.find(m => m.name === permission.module)
                      return (
                        <Box key={permission.module} mb={2} p={2} border="1px solid" borderColor="divider" borderRadius={1}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={permission.selected}
                                onChange={() => handleModuleToggle(permission.module)}
                                disabled={selectedRole ? !canEditRole(selectedRole) : false}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  {moduleInfo?.displayName || permission.module.charAt(0).toUpperCase() + permission.module.slice(1)}
                                </Typography>
                                {moduleInfo?.description && (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    {moduleInfo.description}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          {permission.selected && (
                            <Box ml={4} mt={1}>
                              {(moduleInfo?.actions ?? [...DEFAULT_ACTIONS]).map((action) => (
                                <FormControlLabel
                                  key={action}
                                  control={
                                    <Checkbox
                                      checked={permission.actions.includes(action)}
                                      onChange={() => handleActionToggle(permission.module, action)}
                                      disabled={selectedRole ? !canEditRole(selectedRole) : false}
                                    />
                                  }
                                  label={action.charAt(0).toUpperCase() + action.slice(1)}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      )
                    })
                  )}
                </FormGroup>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleUpdateRole}
              disabled={isUpdating || (selectedRole ? !canEditRole(selectedRole) : false)}
              startIcon={isUpdating ? <CircularProgress size={16} /> : <Save />}
              sx={{
                bgcolor: '#fbbf24',
                color: '#1f2937',
                '&:hover': {
                  bgcolor: '#f59e0b'
                }
              }}
            >
              Update Role
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <AlertCircle color="error" />
              <Typography variant="h6">Delete Role</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the role <strong>{selectedRole?.name}</strong>?
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              This action cannot be undone. Users assigned to this role may lose access.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteRole}
              disabled={isDeleting}
              startIcon={isDeleting ? <CircularProgress size={16} /> : <Trash2 />}
            >
              Delete Role
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
    </ProtectedRoute>
  )
}
