'use client'

import { useState, useMemo } from 'react'
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
  Globe
} from 'lucide-react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
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

interface Client {
  id: number
  name: string
  email: string
  phone: string
  company: string
  industry: string
  status: 'Active' | 'Inactive' | 'Prospect'
  lastContact: string
  website?: string
}

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const clients: Client[] = [
    { id: 1, name: 'John Smith', email: 'john@techcorp.com', phone: '+1 (555) 123-4567', company: 'TechCorp Inc.', industry: 'Technology', status: 'Active', lastContact: '2 days ago', website: 'www.techcorp.com' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@financepro.com', phone: '+1 (555) 234-5678', company: 'FinancePro Solutions', industry: 'Finance', status: 'Active', lastContact: '1 week ago', website: 'www.financepro.com' },
    { id: 3, name: 'Mike Davis', email: 'mike@healthcare.com', phone: '+1 (555) 345-6789', company: 'Healthcare Systems', industry: 'Healthcare', status: 'Prospect', lastContact: '3 days ago', website: 'www.healthcare.com' },
    { id: 4, name: 'Lisa Wilson', email: 'lisa@retailplus.com', phone: '+1 (555) 456-7890', company: 'RetailPlus', industry: 'Retail', status: 'Active', lastContact: '5 days ago', website: 'www.retailplus.com' },
    { id: 5, name: 'David Brown', email: 'david@manufacturing.com', phone: '+1 (555) 567-8901', company: 'Manufacturing Co.', industry: 'Manufacturing', status: 'Inactive', lastContact: '2 weeks ago', website: 'www.manufacturing.com' },
    { id: 6, name: 'Emily Chen', email: 'emily@consulting.com', phone: '+1 (555) 678-9012', company: 'Consulting Partners', industry: 'Consulting', status: 'Active', lastContact: '1 day ago', website: 'www.consulting.com' },
    { id: 7, name: 'Robert Taylor', email: 'robert@education.com', phone: '+1 (555) 789-0123', company: 'Education First', industry: 'Education', status: 'Prospect', lastContact: '4 days ago', website: 'www.education.com' },
    { id: 8, name: 'Jennifer Lee', email: 'jennifer@logistics.com', phone: '+1 (555) 890-1234', company: 'Logistics Solutions', industry: 'Logistics', status: 'Active', lastContact: '6 days ago', website: 'www.logistics.com' },
  ]

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.company.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter
      const matchesIndustry = industryFilter === 'all' || client.industry === industryFilter
      return matchesSearch && matchesStatus && matchesIndustry
    })
  }, [clients, searchTerm, statusFilter, industryFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success'
      case 'Inactive': return 'error'
      case 'Prospect': return 'warning'
      default: return 'default'
    }
  }

  const handleView = (id: number) => {
    console.log('View client:', id)
  }

  const handleEdit = (id: number) => {
    console.log('Edit client:', id)
  }

  const handleDelete = (id: number) => {
    console.log('Delete client:', id)
  }

  const columns: GridColDef[] = [
    {
      field: 'client',
      headerName: 'Client',
      width: 280,
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
              {params.row.company}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'contact',
      headerName: 'Contact',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {params.row.email}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.phone}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'industry',
      headerName: 'Industry',
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.row.industry} 
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
      field: 'lastContact',
      headerName: 'Last Contact',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.lastContact}
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
    { name: 'Total Clients', value: clients.length.toString(), change: '+15%', icon: Building },
    { name: 'Active Clients', value: clients.filter(c => c.status === 'Active').length.toString(), change: '+8%', icon: Building },
    { name: 'Prospects', value: clients.filter(c => c.status === 'Prospect').length.toString(), change: '+22%', icon: Building },
    { name: 'Industries', value: Array.from(new Set(clients.map(c => c.industry))).length.toString(), change: '+3', icon: Building },
  ]

  return (
    <ProtectedRoute>
      <Layout>
      <Box sx={{ p: 3 }}>
        {/* Page Header */}
        <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Client List
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage client relationships and information
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Plus />}
            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
          >
            Add Client
          </Button>
        </Box>

        {/* Search and Filters */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Search clients..."
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
                        <MenuItem value="Prospect">Prospect</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Industry</InputLabel>
                      <Select
                        value={industryFilter}
                        label="Industry"
                        onChange={(e) => setIndustryFilter(e.target.value)}
                        size="small"
                      >
                        <MenuItem value="all">All Industries</MenuItem>
                        {Array.from(new Set(clients.map(c => c.industry))).map(industry => (
                          <MenuItem key={industry} value={industry}>{industry}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Client Stats */}
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

        {/* Clients DataGrid */}
        <Card>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredClients}
              columns={columns}
              pageSizeOptions={[5, 10, 25]}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
                sorting: {
                  sortModel: [{ field: 'lastContact', sort: 'desc' }],
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
    </ProtectedRoute>
  )
} 