import { createTheme } from '@mui/material/styles'
import { Colors } from '@/config/colors'

// Light theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: Colors.brandYellow.main,
      light: Colors.brandYellow.light,
      dark: Colors.brandYellow.dark,
      contrastText: Colors.brandYellow.contrastText,
    },
    secondary: {
      main: Colors.slate.main,
      light: Colors.slate.light,
      dark: Colors.slate.dark,
      contrastText: Colors.slate.contrastText,
    },
    background: {
      default: Colors.backgroundLight.default,
      paper: Colors.backgroundLight.paper,
    },
    text: {
      primary: Colors.textLight.primary,
      secondary: Colors.textLight.secondary,
    },
    grey: {
      50: Colors.grey[50],
      100: Colors.grey[100],
      200: Colors.grey[200],
      300: Colors.grey[300],
      400: Colors.grey[400],
      500: Colors.grey[500],
      600: Colors.grey[600],
      700: Colors.grey[700],
      800: Colors.grey[800],
      900: Colors.grey[900],
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.875rem',
    },
    body2: {
      fontSize: '0.75rem',
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
  },
})

// Dark theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: Colors.brandYellow.main,
      light: Colors.brandYellow.light,
      dark: Colors.brandYellow.dark,
      contrastText: Colors.brandYellow.contrastText,
    },
    secondary: {
      main: Colors.slate.main,
      light: Colors.slate.light,
      dark: Colors.slate.dark,
      contrastText: Colors.slate.contrastText,
    },
    background: {
      default: Colors.backgroundDark.default,
      paper: Colors.backgroundDark.paper,
    },
    text: {
      primary: Colors.textDark.primary,
      secondary: Colors.textDark.secondary,
    },
    grey: {
      50: Colors.grey[50],
      100: Colors.grey[100],
      200: Colors.grey[200],
      300: Colors.grey[300],
      400: Colors.grey[400],
      500: Colors.grey[500],
      600: Colors.grey[600],
      700: Colors.grey[700],
      800: Colors.grey[800],
      900: Colors.grey[900],
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.875rem',
    },
    body2: {
      fontSize: '0.75rem',
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
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
          border: '1px solid #334155',
        },
      },
    },
  },
})

// Default export for backward compatibility
export const theme = lightTheme 