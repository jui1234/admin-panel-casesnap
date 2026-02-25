'use client'

import { useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getModulePermissions, type UserRole } from '@/utils/permissions'

export function useModulePermissions(moduleName: string) {
  const { user } = useAuth()
  const role: UserRole = user?.role

  return useMemo(
    () => getModulePermissions(role, moduleName),
    [role, moduleName]
  )
}
