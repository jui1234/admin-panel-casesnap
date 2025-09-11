// DataGrid Theme Configuration
// This file contains styling for MUI DataGrid components
// Import this when using DataGrid components in your application

export const dataGridStyles = {
  light: {
    root: {
      border: 'none',
      '& .MuiDataGrid-cell': {
        borderBottom: '1px solid #e2e8f0',
      },
      '& .MuiDataGrid-columnHeaders': {
        backgroundColor: '#f8fafc',
        borderBottom: '2px solid #e2e8f0',
      },
      '& .MuiDataGrid-row:hover': {
        backgroundColor: '#f8fafc',
      },
      '& .MuiDataGrid-footerContainer': {
        borderTop: '1px solid #e2e8f0',
      },
    },
  },
  dark: {
    root: {
      border: 'none',
      '& .MuiDataGrid-cell': {
        borderBottom: '1px solid #334155',
      },
      '& .MuiDataGrid-columnHeaders': {
        backgroundColor: '#1e293b',
        borderBottom: '2px solid #334155',
      },
      '& .MuiDataGrid-row:hover': {
        backgroundColor: '#1e293b',
      },
      '& .MuiDataGrid-footerContainer': {
        borderTop: '1px solid #334155',
      },
    },
  },
}

// Usage example:
// import { dataGridStyles } from '@/app/dataGridTheme'
// 
// <DataGrid
//   sx={dataGridStyles.light} // or dataGridStyles.dark
//   // ... other props
// />
