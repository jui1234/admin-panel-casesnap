'use client'

import { useState, useMemo } from 'react'
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
  MapPin
} from 'lucide-react'
import Layout from '@/components/Layout'
import { ROLES, getRoleById } from '@/utils/roles'
import { 
  DataGrid, 
  GridColDef, 
  GridActionsCellItem,
  GridToolbar
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
  Grid
} from '@mui/material'

interface Employee {
  id: number
  name: string
  email: string
  phone: string
  role: string
  department: string
  status: 'Active' | 'Inactive' | 'On Leave'
  hireDate: string
  location: string
  salary?: string
}

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const employees: Employee[] = [
    { id: 1, name: 'Alex Johnson', email: 'alex@company.com', phone: '+1 (555) 111-2222', role: 'employee', department: 'Engineering', status: 'Active', hireDate: '2023-01-15', location: 'New York', salary: '$75,000' },
    { id: 2, name: 'Maria Garcia', email: 'maria@company.com', phone: '+1 (555) 222-3333', role: 'admin', department: 'HR', status: 'Active', hireDate: '2022-08-20', location: 'Los Angeles', salary: '$85,000' },
    { id: 3, name: 'David Chen', email: 'david@company.com', phone: '+1 (555) 333-4444', role: 'employee', department: 'Marketing', status: 'Active', hireDate: '2023-03-10', location: 'Chicago', salary: '$70,000' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@company.com', phone: '+1 (555) 444-5555', role: 'employee', department: 'Sales', status: 'On Leave', hireDate: '2022-11-05', location: 'Boston', salary: '$65,000' },
    { id: 5, name: 'Michael Brown', email: 'michael@company.com', phone: '+1 (555) 555-6666', role: 'admin', department: 'Finance', status: 'Active', hireDate: '2021-06-12', location: 'San Francisco', salary: '$90,000' },
    { id: 6, name: 'Lisa Davis', email: 'lisa@company.com', phone: '+1 (555) 666-7777', role: 'employee', department: 'Engineering', status: 'Active', hireDate: '2023-02-28', location: 'Seattle', salary: '$80,000' },
    { id: 7, name: 'Robert Taylor', email: 'robert@company.com', phone: '+1 (555) 777-8888', role: 'employee', department: 'Operations', status: 'Inactive', hireDate: '2022-04-15', location: 'Austin', salary: '$72,000' },
    { id: 8, name: 'Jennifer Lee', email: 'jennifer@company.com', phone: '+1 (555) 888-9999', role: 'admin', department: 'Legal', status: 'Active', hireDate: '2021-09-30', location: 'Washington DC', salary: '$95,000' },
  ]

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           employee.department.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = roleFilter === 'all' || employee.role === roleFilter
      const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter
      const matchesStatus = statusFilter === 'all' || employee.status === statusFilter
      return matchesSearch && matchesRole && matchesDepartment && matchesStatus
    })
  }, [employees, searchTerm, roleFilter, departmentFilter, statusFilter])

  const getRoleInfo = (roleId: string) => {
    return getRoleById(roleId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success'
      case 'Inactive': return 'error'
      case 'On Leave': return 'warning'
      default: return 'default'
    }
  }

  const handleView = (id: number) => {
    console.log('View employee:', id)
  }

  const handleEdit = (id: number) => {
    console.log('Edit employee:', id)
  }

  const handleDelete = (id: number) => {
    console.log('Delete employee:', id)
  }

  const columns: GridColDef[] = [
    {
      field: 'employee',
      headerName: 'Employee',
      width: 250,
      renderCell: (params) => (
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
      ),
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
      field: 'department',
      headerName: 'Department',
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.row.department} 
          size="small"
          variant="outlined"
          color="primary"
        />
      ),
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
      field: 'location',
      headerName: 'Location',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.location}
        </Typography>
      ),
    },
    {
      field: 'hireDate',
      headerName: 'Hire Date',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(params.row.hireDate).toLocaleDateString()}
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

  const metrics = [
    { name: 'Total Employees', value: employees.length.toString(), change: '+12%', icon: UserPlus },
    { name: 'Active Employees', value: employees.filter(e => e.status === 'Active').length.toString(), change: '+8%', icon: UserPlus },
    { name: 'Departments', value: Array.from(new Set(employees.map(e => e.department))).length.toString(), change: '+2', icon: UserPlus },
    { name: 'Locations', value: Array.from(new Set(employees.map(e => e.location))).length.toString(), change: '+1', icon: UserPlus },
  ]

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
            startIcon={<Plus />}
            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
          >
            Add Employee
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
                      <InputLabel>Department</InputLabel>
                      <Select
                        value={departmentFilter}
                        label="Department"
                        onChange={(e) => setDepartmentFilter(e.target.value)}
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
                        onChange={(e) => setStatusFilter(e.target.value)}
                        size="small"
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                        <MenuItem value="On Leave">On Leave</MenuItem>
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
            <DataGrid
              rows={filteredEmployees}
              columns={columns}
              pageSizeOptions={[5, 10, 25]}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
                sorting: {
                  sortModel: [{ field: 'hireDate', sort: 'desc' }],
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