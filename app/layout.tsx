import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/contexts/ThemeContext'
import MuiThemeProviderWrapper from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'CaseSnap - Admin Panel',
  description: 'Streamline your case management with powerful admin tools and role-based access control',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeProvider>
          <MuiThemeProviderWrapper>
            {children}
          </MuiThemeProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
} 