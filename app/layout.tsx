import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin ACL Panel',
  description: 'Administrative Access Control Panel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
} 