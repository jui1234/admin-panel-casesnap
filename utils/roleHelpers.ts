/**
 * Normalizes role name from backend format to frontend format
 * SUPER_ADMIN -> super-admin
 * ADMIN -> admin
 * EMPLOYEE -> employee
 */
export function normalizeRoleName(role: string | { name: string } | undefined): string {
  if (!role) return 'employee'
  
  let roleName: string
  if (typeof role === 'string') {
    roleName = role
  } else if (role && typeof role === 'object' && 'name' in role) {
    roleName = role.name
  } else {
    return 'employee'
  }
  
  // Convert backend role names to frontend format
  const roleMap: Record<string, string> = {
    'SUPER_ADMIN': 'super-admin',
    'ADMIN': 'admin',
    'EMPLOYEE': 'employee',
    'super-admin': 'super-admin',
    'admin': 'admin',
    'employee': 'employee'
  }
  
  return roleMap[roleName.toUpperCase()] || roleName.toLowerCase().replace(/_/g, '-')
}

/**
 * Checks if user has admin role (admin or super-admin)
 */
export function isAdmin(role: string | { name: string } | undefined): boolean {
  const normalizedRole = normalizeRoleName(role)
  return normalizedRole === 'admin' || normalizedRole === 'super-admin'
}

/**
 * Gets role display name
 */
export function getRoleDisplayName(role: string | { name: string } | undefined): string {
  const normalizedRole = normalizeRoleName(role)
  const displayNames: Record<string, string> = {
    'super-admin': 'Super Admin',
    'admin': 'Admin',
    'employee': 'Employee'
  }
  return displayNames[normalizedRole] || normalizedRole
}
