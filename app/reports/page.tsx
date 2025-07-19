'use client'

import { useState, useMemo } from 'react'
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  PieChart,
  Eye,
  Download as DownloadIcon,
  Delete as DeleteIcon
} from 'lucide-react'
import Layout from '@/components/Layout'
import { 
  DataGrid, 
  GridColDef, 
  GridActionsCellItem,
  GridToolbar
} from '@mui/x-data-grid'
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Chip,
  Grid,
  IconButton
} from '@mui/material'

interface Report {
  id: number
  name: string
  type: string
  size: string
  lastGenerated: string
  status: 'Ready' | 'Processing' | 'Failed'
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  const reports: Report[] = [
    { id: 1, name: 'User Activity Report', type: 'PDF', size: '2.3 MB', lastGenerated: '2 hours ago', status: 'Ready' },
    { id: 2, name: 'System Performance Report', type: 'Excel', size: '1.8 MB', lastGenerated: '1 day ago', status: 'Ready' },
    { id: 3, name: 'Security Audit Report', type: 'PDF', size: '4.1 MB', lastGenerated: '3 days ago', status: 'Ready' },
    { id: 4, name: 'Monthly Analytics Report', type: 'Excel', size: '3.2 MB', lastGenerated: '1 week ago', status: 'Ready' },
    { id: 5, name: 'Database Backup Report', type: 'PDF', size: '5.7 MB', lastGenerated: '2 days ago', status: 'Ready' },
    { id: 6, name: 'Error Log Report', type: 'CSV', size: '0.8 MB', lastGenerated: '6 hours ago', status: 'Ready' },
  ]

  const metrics = [
    { name: 'Total Reports', value: '24', change: '+12%', icon: FileText },
    { name: 'This Month', value: '8', change: '+25%', icon: Calendar },
    { name: 'Downloads', value: '156', change: '+8%', icon: Download },
    { name: 'Success Rate', value: '98%', change: '+2%', icon: TrendingUp },
  ]

  const handleDownload = (id: number) => {
    console.log('Download report:', id)
  }

  const handleView = (id: number) => {
    console.log('View report:', id)
  }

  const handleDelete = (id: number) => {
    console.log('Delete report:', id)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready': return 'success'
      case 'Processing': return 'warning'
      case 'Failed': return 'error'
      default: return 'default'
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Report Name',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1, bgcolor: 'primary.100', borderRadius: 1 }}>
            <FileText size={20} />
          </Box>
          <Typography variant="body2" fontWeight={500}>
            {params.row.name}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.row.type} 
          size="small"
          variant="outlined"
          color="primary"
        />
      ),
    },
    {
      field: 'size',
      headerName: 'Size',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.size}
        </Typography>
      ),
    },
    {
      field: 'lastGenerated',
      headerName: 'Generated',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.lastGenerated}
        </Typography>
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
          icon={<DownloadIcon />}
          label="Download"
          onClick={() => handleDownload(params.id as number)}
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
              Reports
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Generate and manage system reports
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<FileText />}
            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
          >
            Generate Report
          </Button>
        </Box>

        {/* Metrics */}
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

        {/* Reports DataGrid */}
        <Card>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={reports}
              columns={columns}
              pageSizeOptions={[5, 10, 25]}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
                sorting: {
                  sortModel: [{ field: 'lastGenerated', sort: 'desc' }],
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

        {/* Quick Actions */}
        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <IconButton 
                    sx={{ mb: 2, bgcolor: 'primary.100', '&:hover': { bgcolor: 'primary.200' } }}
                    size="large"
                  >
                    <BarChart3 />
                  </IconButton>
                  <Typography variant="body2" fontWeight={500}>
                    Analytics Report
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <IconButton 
                    sx={{ mb: 2, bgcolor: 'primary.100', '&:hover': { bgcolor: 'primary.200' } }}
                    size="large"
                  >
                    <PieChart />
                  </IconButton>
                  <Typography variant="body2" fontWeight={500}>
                    User Statistics
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <IconButton 
                    sx={{ mb: 2, bgcolor: 'primary.100', '&:hover': { bgcolor: 'primary.200' } }}
                    size="large"
                  >
                    <TrendingUp />
                  </IconButton>
                  <Typography variant="body2" fontWeight={500}>
                    Performance Report
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <IconButton 
                    sx={{ mb: 2, bgcolor: 'primary.100', '&:hover': { bgcolor: 'primary.200' } }}
                    size="large"
                  >
                    <FileText />
                  </IconButton>
                  <Typography variant="body2" fontWeight={500}>
                    Custom Report
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  )
} 