const MODULES_CACHE_KEY_PREFIX = 'sidebarModulesCache:'

/** Clears persisted auth the same way as logout, without React/router. */
export function clearAuthStorage() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem('authToken')
    localStorage.removeItem('token')
    localStorage.removeItem('userData')
    localStorage.removeItem('organizationData')
    localStorage.removeItem('user')
    localStorage.removeItem('organization')
    localStorage.removeItem('role')
    localStorage.removeItem('permissions')
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key?.startsWith(MODULES_CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key)
      }
    }
  } catch {
    /* ignore */
  }
}
