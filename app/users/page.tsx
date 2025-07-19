'use client'

import { useState, useMemo } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  UserPlus,
  Edit as EditIcon,
  Delete as DeleteIcon
} from 'lucide-react'
import Layout from '@/components/Layout'
import { ROLES, getRoleById } from '@/utils/roles'
import { 
  DataGrid, 
  GridColDef, 
  GridValueGetterParams, 
  GridActionsCellItem,
  GridToolbar,
  GridRowParams
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
  Collapse,
  Grid
} from '@mui/material'

interface User {
  id: number
  name: string
  email: string
  role: string
  status: 'Active' | 'Inactive' | 'Pending'
  lastLogin: string
  avatar?: string
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'super-admin', status: 'Active', lastLogin: '2 hours ago' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', status: 'Active', lastLogin: '1 day ago' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'employee', status: 'Inactive', lastLogin: '1 week ago' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'employee', status: 'Active', lastLogin: '3 hours ago' },
    { id: 5, name: 'David Brown', email: 'david@example.com', role: 'admin', status: 'Active', lastLogin: '5 hours ago' },
    { id: 6, name: 'Emily Davis', email: 'emily@example.com', role: 'employee', status: 'Pending', lastLogin: 'Never' },
    { id: 7, name: 'Robert Wilson', email: 'robert@example.com', role: 'employee', status: 'Active', lastLogin: '2 days ago' },
    { id: 8, name: 'Lisa Anderson', email: 'lisa@example.com', role: 'admin', status: 'Active', lastLogin: '1 hour ago' },
  ]

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchTerm, roleFilter, statusFilter])

  const getRoleInfo = (roleId: string) => {
    return getRoleById(roleId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success'
      case 'Inactive': return 'error'
      case 'Pending': return 'warning'
      default: return 'default'
    }
  }

  const handleView = (id: number) => {
    console.log('View user:', id)
  }

  const handleEdit = (id: number) => {
    console.log('Edit user:', id)
  }

  const handleDelete = (id: number) => {
    console.log('Delete user:', id)
  }

  const columns: GridColDef[] = [
    {
      field: 'user',
      headerName: 'User',
      width: 250,
      renderCell: (params) => {
        const roleInfo = getRoleInfo(params.row.role)
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              {params.row.name.split(' ').map((n: string) => n[0]).join('')}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {params.row.name}
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
        const roleInfo = getRoleInfo(params.row.role)
        return roleInfo ? (
          <Chip 
            label={roleInfo.name} 
            size="small"
            sx={{ 
              bgcolor: roleInfo.color.split(' ')[0].replace('bg-', ''),
              color: roleInfo.color.split(' ')[1].replace('text-', ''),
              fontWeight: 600
            }}
          />
        ) : null
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.row.status} 
          color={getStatusColor(params.row.status) as any}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'lastLogin',
      headerName: 'Last Login',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.lastLogin}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Eye />}
          label="View"
          onClick={() => handleView(params.id as number)}
          color="primary"
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.id as number)}
          color="primary"
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.id as number)}
          color="error"
        />,
      ],
    },
  ]

  return (
    <Layout>
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
          <Button
            variant="contained"
            startIcon={<UserPlus />}
            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
          >
            Add User
          </Button>
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
                      >
                        <MenuItem value="all">All Roles</MenuItem>
                        {ROLES.map(role => (
                          <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
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
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                      </Select>
                    </FormControl>
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
                      {users.length}
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
                      Active
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {users.filter(u => u.status === 'Active').length}
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
                      {users.filter(u => u.status === 'Inactive').length}
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
                      {users.filter(u => u.status === 'Pending').length}
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
            <DataGrid
              rows={filteredUsers}
              columns={columns}
              pageSizeOptions={[5, 10, 25]}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              slots={{
                toolbar: GridToolbar,
              }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
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
          </Box>
        </Card>
      </Box>
    </Layout>
  )
} 