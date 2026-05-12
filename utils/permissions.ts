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

/**
 * Normalize module name to handle both singular and plural forms
 * Maps common module names to their variations
 */
function normalizeModuleName(moduleName: string): string[] {
  const normalized = moduleName.toLowerCase().trim()
  const variations: string[] = [normalized]
  
  // Handle common singular/plural pairs
  const singularPluralMap: Record<string, string[]> = {
    'case': ['case', 'cases'],
    'cases': ['case', 'cases'],
    'client': ['client', 'clients'],
    'clients': ['client', 'clients'],
    'user': ['user', 'users'],
    'users': ['user', 'users'],
    'role': ['role', 'roles'],
    'roles': ['role', 'roles'],
    'employee': ['employee', 'employees'],
    'employees': ['employee', 'employees'],
  }
  
  if (singularPluralMap[normalized]) {
    return singularPluralMap[normalized]
  }
  
  return variations
}

function hasAction(role: UserRole, moduleName: string, action: ModuleAction): boolean {
  if (!role) return false
  if (isSuperAdmin(role)) return true

  if (typeof role === 'string') {
    const n = role.toLowerCase()
    return n === 'admin' || n === 'super-admin'
  }

  const perms = (role as { permissions?: RolePermission[] }).permissions ?? []
  const moduleVariations = normalizeModuleName(moduleName)
  
  // Try to find permission matching any variation of the module name
  const mod = perms.find((p) => {
    const permModule = p.module.toLowerCase()
    return moduleVariations.some(variation => variation === permModule)
  })
  
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

function normalizeRoleLabel(role: UserRole): string {
  if (!role) return ''
  if (typeof role === 'string') return role.trim()
  return ((role as { name?: string }).name ?? '').trim()
}

/** Broad admin / super-admin titles — not labeled as assignee from module permissions alone. */
function isAdminLikeRoleName(role: UserRole): boolean {
  const n = normalizeRoleLabel(role).toLowerCase().replace(/\s+/g, ' ')
  return (
    n === 'admin' ||
    n === 'super-admin' ||
    n === 'super_admin' ||
    n === 'superadmin' ||
    n === 'super admin'
  )
}

/**
 * True when this user should be surfaced as an "assignee" in the UI: role title contains
 * assignee, or custom role has `assignee` action on cases/clients (excludes admin-like role names).
 */
export function isAssigneeFacingUser(userRole: UserRole): boolean {
  if (!userRole) return false
  if (/assignee/i.test(normalizeRoleLabel(userRole))) return true
  if (typeof userRole !== 'object' || !Array.isArray(userRole.permissions)) return false
  if (isAdminLikeRoleName(userRole)) return false
  return canAssignee(userRole, 'case') || canAssignee(userRole, 'client')
}

/** Same shape as login `assigneePermissions` — backend flags who participates in client/case assignment. */
export type AssigneePermissionsFlags = {
  canAssignClient?: boolean
  canAssignCase?: boolean
}

/**
 * Header / profile “Assignee” indicator. Uses the same signals as cases & clients
 * (`assigneePermissions` from login) plus role-based `isAssigneeFacingUser`.
 */
export function shouldShowAssigneeHeaderBadge(
  role: UserRole,
  assigneePermissions?: AssigneePermissionsFlags | null
): boolean {
  if (assigneePermissions?.canAssignClient === true || assigneePermissions?.canAssignCase === true) {
    return true
  }
  return isAssigneeFacingUser(role)
}

/** Narrow assignee type for header copy — login flags first, then role module `assignee` actions, else generic. */
export type AssigneeHeaderScope = 'case' | 'client' | 'both' | 'generic'

/**
 * When `shouldShowAssigneeHeaderBadge` is true, returns how assignment applies (cases, clients, or both).
 * Returns null when the user should not be shown as an assignee.
 */
export function getAssigneeHeaderScope(
  role: UserRole,
  assigneePermissions?: AssigneePermissionsFlags | null
): AssigneeHeaderScope | null {
  if (!shouldShowAssigneeHeaderBadge(role, assigneePermissions)) return null

  const apiCase = assigneePermissions?.canAssignCase === true
  const apiClient = assigneePermissions?.canAssignClient === true
  if (apiCase || apiClient) {
    if (apiCase && apiClient) return 'both'
    if (apiCase) return 'case'
    return 'client'
  }

  const roleCase = canAssignee(role, 'case')
  const roleClient = canAssignee(role, 'client')
  if (roleCase && roleClient) return 'both'
  if (roleCase) return 'case'
  if (roleClient) return 'client'

  return 'generic'
}

export function getAssigneeHeaderLabel(scope: AssigneeHeaderScope): string {
  switch (scope) {
    case 'case':
      return 'Assignee for cases'
    case 'client':
      return 'Assignee for client'
    case 'both':
    case 'generic':
    default:
      return 'Assignee'
  }
}

/** One row from GET `/api/modules` — may include effective actions for the signed-in user. */
export type ModuleWithActions = { name: string; actions?: string[]; permissions?: string[] }

function moduleEffectiveActions(m: ModuleWithActions): string[] {
  const a = m.actions
  const p = m.permissions
  if (Array.isArray(a) && a.length > 0) return a
  if (Array.isArray(p) && p.length > 0) return p
  return Array.isArray(a) ? a : []
}

function actionsIncludeAssignee(actions: string[] | undefined): boolean {
  if (!Array.isArray(actions)) return false
  return actions.some((a) => String(a).toLowerCase() === 'assignee')
}

/**
 * Assignee scope from `/api/modules`: `assignee` in `actions` for case/cases and/or client/clients.
 * Returns null when neither module grants assignee (badge should be hidden).
 */
export function getAssigneeScopeFromModules(
  modules: ModuleWithActions[] | null | undefined
): AssigneeHeaderScope | null {
  if (!Array.isArray(modules) || modules.length === 0) return null

  const caseNames = new Set(normalizeModuleName('case'))
  const clientNames = new Set(normalizeModuleName('client'))

  let caseAssignee = false
  let clientAssignee = false

  for (const m of modules) {
    if (!m?.name || !actionsIncludeAssignee(moduleEffectiveActions(m))) continue
    const key = m.name.toLowerCase().trim()
    if (caseNames.has(key)) caseAssignee = true
    else if (clientNames.has(key)) clientAssignee = true
  }

  if (!caseAssignee && !clientAssignee) return null
  if (caseAssignee && clientAssignee) return 'both'
  if (caseAssignee) return 'case'
  return 'client'
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
