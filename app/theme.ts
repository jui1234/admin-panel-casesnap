import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#facc15', // Yellow
      light: '#fef08a',
      dark: '#ca8a04',
      contrastText: '#0f172a', // Tile black for contrast
    },
    secondary: {
      main: '#64748b', // Tile gray
      light: '#94a3b8',
      dark: '#334155',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // Tile 50
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a', // Tile 900
      secondary: '#475569', // Tile 600
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#0f172a',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#0f172a',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#0f172a',
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#0f172a',
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#0f172a',
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: '#0f172a',
    },
    body1: {
      fontSize: '0.875rem',
      color: '#475569',
    },
    body2: {
      fontSize: '0.75rem',
      color: '#64748b',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
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
        },
      },
    },
  },
}) 