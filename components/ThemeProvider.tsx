'use client'

import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { lightTheme, darkTheme } from '@/app/theme'
import { useTheme } from '@/contexts/ThemeContext'

export default function MuiThemeProviderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const { theme } = useTheme()
  
  return (
    <MuiThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
} 