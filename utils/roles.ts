export interface Role {
  id: string
  name: string
  level: number
  permissions: string[]
  color: string
  description: string
}

export interface Permission {
  id: string
  name: string
  description: string
  category: string
}

export const ROLES: Role[] = [
  {
    id: 'super-admin',
    name: 'Super Admin',
    level: 3,
    color: 'bg-red-100 text-red-800',
    description: 'Full system access with all permissions',
    permissions: [
      'user:create', 'user:read', 'user:update', 'user:delete',
      'role:create', 'role:read', 'role:update', 'role:delete',
      'system:settings', 'system:backup', 'system:restore',
      'analytics:full', 'reports:all', 'permissions:manage'
    ]
  },
  {
    id: 'admin',
    name: 'Admin',
    level: 2,
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Administrative access with user management',
    permissions: [
      'user:create', 'user:read', 'user:update',
      'role:read', 'role:update',
      'analytics:view', 'reports:generate', 'permissions:view'
    ]
  },
  {
    id: 'employee',
    name: 'Employee',
    level: 1,
    color: 'bg-green-100 text-green-800',
    description: 'Basic access with limited permissions',
    permissions: [
      'user:read',
      'reports:view', 'analytics:basic'
    ]
  }
]

export const PERMISSIONS: Permission[] = [
  // User Management
  { id: 'user:create', name: 'Create Users', description: 'Create new user accounts', category: 'User Management' },
  { id: 'user:read', name: 'View Users', description: 'View user information and lists', category: 'User Management' },
  { id: 'user:update', name: 'Update Users', description: 'Modify user information', category: 'User Management' },
  { id: 'user:delete', name: 'Delete Users', description: 'Remove user accounts', category: 'User Management' },
  
  // Role Management
  { id: 'role:create', name: 'Create Roles', description: 'Create new user roles', category: 'Role Management' },
  { id: 'role:read', name: 'View Roles', description: 'View role information', category: 'Role Management' },
  { id: 'role:update', name: 'Update Roles', description: 'Modify role permissions', category: 'Role Management' },
  { id: 'role:delete', name: 'Delete Roles', description: 'Remove user roles', category: 'Role Management' },
  
  // System Management
  { id: 'system:settings', name: 'System Settings', description: 'Access system configuration', category: 'System Management' },
  { id: 'system:backup', name: 'System Backup', description: 'Create system backups', category: 'System Management' },
  { id: 'system:restore', name: 'System Restore', description: 'Restore system from backup', category: 'System Management' },
  
  // Analytics & Reports
  { id: 'analytics:basic', name: 'Basic Analytics', description: 'View basic analytics', category: 'Analytics & Reports' },
  { id: 'analytics:view', name: 'View Analytics', description: 'Access analytics dashboard', category: 'Analytics & Reports' },
  { id: 'analytics:full', name: 'Full Analytics', description: 'Complete analytics access', category: 'Analytics & Reports' },
  { id: 'reports:view', name: 'View Reports', description: 'Access generated reports', category: 'Analytics & Reports' },
  { id: 'reports:generate', name: 'Generate Reports', description: 'Create new reports', category: 'Analytics & Reports' },
  { id: 'reports:all', name: 'All Reports', description: 'Full report management', category: 'Analytics & Reports' },
  
  // Permissions
  { id: 'permissions:view', name: 'View Permissions', description: 'View permission settings', category: 'Permissions' },
  { id: 'permissions:manage', name: 'Manage Permissions', description: 'Modify permission settings', category: 'Permissions' }
]

export const getRoleByName = (name: string): Role | undefined => {
  return ROLES.find(role => role.name.toLowerCase() === name.toLowerCase())
}

export const getRoleById = (id: string): Role | undefined => {
  return ROLES.find(role => role.id === id)
}

export const hasPermission = (userRole: string, permission: string): boolean => {
  const role = getRoleById(userRole)
  return role?.permissions.includes(permission) || false
}

export const getPermissionsByCategory = () => {
  const categories = Array.from(new Set(PERMISSIONS.map(p => p.category)))
  return categories.map(category => ({
    category,
    permissions: PERMISSIONS.filter(p => p.category === category)
  }))
} 