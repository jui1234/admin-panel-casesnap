'use client'

import Layout from '@/components/Layout'
import { usePathname } from 'next/navigation'

interface ProtectedAppShellProps {
  children: React.ReactNode
}

const protectedPaths = [
  '/dashboard',
  '/users',
  '/roles',
  '/clients',
  '/cases',
  '/employees',
  '/permissions',
  '/reports',
  '/analytics',
  '/settings',
]

function isProtectedPath(pathname: string) {
  return protectedPaths.some((path) => pathname.startsWith(path))
}

function isRegistrationPath(pathname: string) {
  return pathname.startsWith('/employees/register') || pathname.startsWith('/users/register')
}

export default function ProtectedAppShell({ children }: ProtectedAppShellProps) {
  const pathname = usePathname()

  // Registration must never use the app shell (matches /users before /users/register is excluded).
  if (isRegistrationPath(pathname)) {
    return <>{children}</>
  }

  if (isProtectedPath(pathname)) {
    return <Layout>{children}</Layout>
  }

  return <>{children}</>
}
