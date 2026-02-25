// Centralized color tokens for the entire app
// Update values here to propagate across MUI theme and any custom usage

export const Colors = {
  // Brand
  brandYellow: {
    main: '#facc15',
    light: '#fef08a',
    dark: '#ca8a04',
    contrastText: '#0f172a',
  },

  // Secondary / Neutral
  slate: {
    main: '#64748b',
    light: '#94a3b8',
    dark: '#334155',
    contrastText: '#ffffff',
  },

  // Backgrounds
  backgroundLight: {
    default: '#f8fafc',
    paper: '#ffffff',
  },
  backgroundDark: {
    default: '#0f172a',
    paper: '#1e293b',
  },

  // Text
  textLight: {
    primary: '#0f172a',
    secondary: '#475569',
  },
  textDark: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
  },

  // Greys (Tile scale)
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
} as const

export type AppColors = typeof Colors


