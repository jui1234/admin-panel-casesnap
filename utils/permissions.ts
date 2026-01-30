/**
 * Module-level permission helpers.
 * Uses user.role.permissions[] from auth (module + actions: read, create, update, delete, assignee).
 * Super Admin: full access. Legacy string role (admin): full access.
 */

export type ModuleAction = 'read' | 'create' | 'update' | 'delete' | 'assignee'

export interface RolePermission {
  module: string
  actions: string[]
}

export type UserRole = string | { name?: string; permissions?: RolePermission[] } | undefined

function isSuperAdmin(role: UserRole): boolean {
  if (!role) return false
  const name = typeof role === 'string' ? role : role?.name ?? ''
  return name === 'super-admin' || name === 'SUPER_ADMIN'
}

function hasAction(role: UserRole, moduleName: string, action: ModuleAction): boolean {
  if (!role) return false
  if (isSuperAdmin(role)) return true

  if (typeof role === 'string') {
    const n = role.toLowerCase()
    return n === 'admin' || n === 'super-admin'
  }

  const perms = (role as { permissions?: RolePermission[] }).permissions ?? []
  const key = moduleName.toLowerCase()
  const mod = perms.find((p) => p.module.toLowerCase() === key)
  if (!mod) return false
  const actions = mod.actions ?? []
  return actions.includes(action)
}

export function canRead(userRole: UserRole, moduleName: string): boolean {
  return hasAction(userRole, moduleName, 'read')
}

export function canCreate(userRole: UserRole, moduleName: string): boolean {
  return hasAction(userRole, moduleName, 'create')
}

export function canUpdate(userRole: UserRole, moduleName: string): boolean {
  return hasAction(userRole, moduleName, 'update')
}

export function canDelete(userRole: UserRole, moduleName: string): boolean {
  return hasAction(userRole, moduleName, 'delete')
}

export function canAssignee(userRole: UserRole, moduleName: string): boolean {
  return hasAction(userRole, moduleName, 'assignee')
}

export function getModulePermissions(
  userRole: UserRole,
  moduleName: string
): { canRead: boolean; canCreate: boolean; canUpdate: boolean; canDelete: boolean; canAssignee: boolean } {
  return {
    canRead: canRead(userRole, moduleName),
    canCreate: canCreate(userRole, moduleName),
    canUpdate: canUpdate(userRole, moduleName),
    canDelete: canDelete(userRole, moduleName),
    canAssignee: canAssignee(userRole, moduleName),
  }
}
