const MODULES_CACHE_KEY_PREFIX = 'sidebarModulesCache:'

/** Clears persisted auth the same way as logout, without React/router. */
export function clearAuthStorage() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem('authToken')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('userData')
    sessionStorage.removeItem('organizationData')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('organization')
    sessionStorage.removeItem('role')
    sessionStorage.removeItem('permissions')
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i)
      if (key?.startsWith(MODULES_CACHE_KEY_PREFIX)) {
        sessionStorage.removeItem(key)
      }
    }
  } catch {
    /* ignore */
  }
}
