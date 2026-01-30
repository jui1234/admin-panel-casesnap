'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Shield, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Home,
  UserCheck,
  FileText,
  BarChart3,
  Bell,
  Search,
  UserPlus,
  Building,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  UserCog,
  Package,
  KeyRound,
  FolderOpen
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { APP_BACKEND_URL } from '@/config/env'
import ThemeToggle from './ThemeToggle'
import LogoutModal from './LogoutModal'
import { useLazyGetNotificationsQuery } from '@/redux/api/notificationsApi'
import type { Notification as ApiNotification } from '@/redux/api/notificationsApi'

interface LayoutProps {
  children: React.ReactNode
}

interface Module {
  _id: string
  name: string
  displayName: string
  description: string
}

interface ModulesResponse {
  data: Module[]
}

// Map module names to routes and icons (using lowercase module names from backend)
const moduleRouteMap: Record<string, { href: string; icon: any }> = {
  'auth': { href: '/auth/login', icon: KeyRound },
  'user': { href: '/users', icon: Users },
  'users': { href: '/users', icon: Users },
  'employee': { href: '/employees', icon: UserPlus },
  'employees': { href: '/employees', icon: UserPlus },
  'role': { href: '/roles', icon: UserCog },
  'roles': { href: '/roles', icon: UserCog },
  'client': { href: '/clients', icon: Building },
  'clients': { href: '/clients', icon: Building },
  'case': { href: '/cases', icon: FolderOpen },
  'cases': { href: '/cases', icon: FolderOpen },
  'report': { href: '/reports', icon: FileText },
  'reports': { href: '/reports', icon: FileText },
  'analytics': { href: '/analytics', icon: BarChart3 },
}

// Static navigation items (always shown)
const staticTopNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
]

const staticBottomNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
]

const NOTIFICATION_TYPE_ICON: Record<string, typeof CheckCircle> = {
  success: CheckCircle,
  info: Info,
  warning: AlertCircle,
  error: AlertCircle,
  client: Building,
  case: FolderOpen,
}

function formatNotificationTime(createdAt: string): string {
  if (!createdAt) return ''
  try {
    const date = new Date(createdAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  } catch {
    return createdAt
  }
}

/** Build link from relatedEntityType and relatedEntityId (e.g. /clients/client_abc) */
function getNotificationLink(relatedEntityType?: string, relatedEntityId?: string): string | null {
  if (!relatedEntityId || !relatedEntityType) return null
  const type = relatedEntityType.toLowerCase()
  if (type === 'client') return `/clients/${relatedEntityId}`
  if (type === 'case') return `/cases/${relatedEntityId}`
  return null
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [modules, setModules] = useState<Module[]>([])
  const [modulesLoading, setModulesLoading] = useState(true)
  const notificationRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { theme } = useTheme()
  const { logout, user } = useAuth()
  
  // Helper to check if role is admin or super-admin
  const isAdminRole = (role: string | { name: string } | undefined): boolean => {
    if (!role) return false
    const roleName = typeof role === 'string' ? role : role.name
    return roleName === 'admin' || roleName === 'super-admin' || roleName === 'ADMIN' || roleName === 'SUPER_ADMIN'
  }
  const isAdmin = isAdminRole(user?.role)

  // Super Admin has full access — show all modules, hide nothing
  const isSuperAdmin = (role: string | { name: string } | undefined): boolean => {
    if (!role) return false
    const roleName = typeof role === 'string' ? role : role.name
    return roleName === 'super-admin' || roleName === 'SUPER_ADMIN'
  }
  const isSuperAdminUser = isSuperAdmin(user?.role)

  const getSubscriptionPlanDisplayName = (plan?: string): string => {
    switch (plan) {
      case 'free':
        return '14 Days Free Trial'
      case 'base':
        return 'Basic'
      case 'popular':
        return 'Professional'
      default:
        return plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'Free Trial'
    }
  }
  const subscriptionPlanDisplay = getSubscriptionPlanDisplayName(user?.subscriptionPlan)
  
  // Fetch modules from API
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setModulesLoading(true)
        // Remove trailing slash if present
        const backendUrl = APP_BACKEND_URL.replace(/\/$/, '')
        const response = await fetch(`${backendUrl}/api/modules`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (response.ok) {
          const responseData: ModulesResponse = await response.json()
          // Get modules from data array
          const modulesData = responseData.data || []
          setModules(modulesData)
        } else {
          console.error('Failed to fetch modules:', response.statusText)
        }
      } catch (error) {
        console.error('Failed to fetch modules:', error)
      } finally {
        setModulesLoading(false)
      }
    }
    
    fetchModules()
  }, [])
  
  // Note: We don't block routes here - let API calls determine permissions
  // Navigation items are hidden based on permissions, but users can still
  // navigate to pages. API will return 403 if they don't have access.
  
  // Helper function to check if user has read permission for a module
  const hasModuleReadPermission = (moduleName: string): boolean => {
    if (!user || !user.role) return false

    // Super Admin: show all modules, never hide anything — full access
    if (isSuperAdminUser) return true

    // If role is just a string, only admins have access (legacy behavior)
    if (typeof user.role === 'string') {
      return isAdmin
    }

    // Check if user's role has read permission for this module
    const rolePermissions = user.role.permissions || []
    const moduleKey = moduleName.toLowerCase()

    // Find permission for this module
    const modulePermission = rolePermissions.find(p => p.module.toLowerCase() === moduleKey)

    // User needs at least 'read' action to see the module in navigation
    return modulePermission?.actions.includes('read') || false
  }

  // Build dynamic navigation from modules
  const dynamicNavigation = modules
    .filter(module => {
      // Use lowercase name to match moduleRouteMap keys
      const moduleKey = module.name.toLowerCase()
      const routeInfo = moduleRouteMap[moduleKey]
      if (!routeInfo) return false
      
      // Check if user has read permission for this module
      if (!hasModuleReadPermission(module.name)) {
        return false
      }
      
      return true
    })
    .map(module => {
      // Use lowercase name to match moduleRouteMap keys
      const moduleKey = module.name.toLowerCase()
      const routeInfo = moduleRouteMap[moduleKey] || { href: `/modules/${module.name}`, icon: Package }
      return {
        name: module.displayName, // Use displayName for sidebar
        href: routeInfo.href,
        icon: routeInfo.icon,
        moduleId: module._id
      }
    })
  
  // Separate navigation: top items (Dashboard) and dynamic modules
  const topNavigation = [
    ...staticTopNavigation,
    ...dynamicNavigation
  ]

  const isDark = theme === 'dark'

  const [fetchNotifications, { data: notificationsData, isLoading: notificationsLoading }] =
    useLazyGetNotificationsQuery()

  useEffect(() => {
    if (user) fetchNotifications({ limit: 30 })
  }, [user])

  const apiNotifications: ApiNotification[] = notificationsData?.data ?? []
  const notifications = apiNotifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    time: formatNotificationTime(n.createdAt),
    icon: NOTIFICATION_TYPE_ICON[n.type] ?? Info,
    read: n.read,
    relatedEntityId: n.relatedEntityId,
    relatedEntityType: n.relatedEntityType,
  }))
  const unreadCount = notificationsData?.unreadCount ?? notifications.filter((n) => !n.read).length

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
      setShowLogoutModal(false)
    }
  }

  const cancelLogout = () => {
    setShowLogoutModal(false)
  }

  const isActive = (href: string) => {
    return pathname === href
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-500'
      case 'warning':
        return 'text-yellow-500'
      case 'error':
        return 'text-red-500'
      default:
        return 'text-blue-500'
    }
  }

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20'
      default:
        return 'bg-blue-50 dark:bg-blue-900/20'
    }
  }

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    const href = getNotificationLink(notification.relatedEntityType, notification.relatedEntityId)
    if (href) {
      setShowNotifications(false)
      router.push(href)
    }
  }

  return (
    <>
      <style jsx>{`
        .notification-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .notification-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .notification-scroll::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .notification-scroll::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .dark .notification-scroll::-webkit-scrollbar-thumb {
          background: #4b5563;
        }
        .dark .notification-scroll::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
      <div className={`h-screen flex overflow-hidden transition-colors duration-300 ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 mr-2 sm:mr-3" />
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Admin Panel</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 sm:mt-6 px-2 sm:px-3 flex-1 overflow-y-auto flex flex-col">
          {/* Top Navigation: Dashboard and Dynamic Modules */}
          <div className="space-y-1 flex-shrink-0">
            {modulesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Loading modules...</p>
                </div>
              </div>
            ) : topNavigation.length > 0 ? (
              topNavigation.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault()
                      router.push(item.href)
                      setSidebarOpen(false)
                    }}
                    className={`group flex items-center px-2 sm:px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-r-2 border-yellow-500'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 ${
                      isActive(item.href) ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                    }`} />
                    <span className="truncate">{item.name}</span>
                  </a>
                )
              })
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  No modules available
                </p>
              </div>
            )}
          </div>

          {/* Bottom Navigation: Settings (pushed to bottom, no border) */}
          <div className="mt-auto pt-4 space-y-1 flex-shrink-0">
            {staticBottomNavigation.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault()
                    router.push(item.href)
                    setSidebarOpen(false)
                  }}
                  className={`group flex items-center px-2 sm:px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-r-2 border-yellow-500'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 ${
                    isActive(item.href) ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                  }`} />
                  <span className="truncate">{item.name}</span>
                </a>
              )
            })}
          </div>
        </nav>

        {/* Logout button */}
        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-2 sm:px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-all duration-200"
          >
            <LogOut className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
            <span className="truncate">Logout</span>
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 z-10">
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-6">
            <div className="flex items-center flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              
              {/* Search bar */}
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="block w-full pl-9 sm:pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Right side header items */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Theme Toggle */}
              <ThemeToggle size="sm" />
              
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => {
                    const next = !showNotifications
                    setShowNotifications(next)
                    if (next && user) fetchNotifications({ limit: 30 })
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 relative"
                >
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-yellow-500 rounded-full"></span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto notification-scroll">
                      {notificationsLoading ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          <p>Loading...</p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        notifications.map((notification) => {
                          const Icon = notification.icon
                          const link = getNotificationLink(notification.relatedEntityType, notification.relatedEntityId)
                          const isClickable = !!link
                          const Wrapper = isClickable ? 'button' : 'div'
                          return (
                            <Wrapper
                              key={notification.id}
                              type={isClickable ? 'button' : undefined}
                              onClick={isClickable ? () => handleNotificationClick(notification) : undefined}
                              className={`w-full text-left p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                                !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                              } ${isClickable ? 'cursor-pointer' : ''}`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`flex-shrink-0 p-1 rounded-full ${getNotificationBg(notification.type)}`}>
                                  <Icon className={`h-4 w-4 ${getNotificationIcon(notification.type)}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {notification.title}
                                    </p>
                                    {!notification.read && (
                                      <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {notification.time}
                                  </div>
                                  {link && (
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                      View {notification.relatedEntityType === 'client' ? 'client' : notification.relatedEntityType} →
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Wrapper>
                          )
                        })
                      )}
                    </div>
                    
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                        <button className="w-full text-center text-sm text-yellow-600 hover:text-yellow-500 font-medium">
                          Mark all as read
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="h-7 w-7 sm:h-8 sm:w-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                    {(() => {
                      if (user?.name) return user.name.charAt(0).toUpperCase()
                      if (user?.firstName) return user.firstName.charAt(0).toUpperCase()
                      if (user?.lastName) return user.lastName.charAt(0).toUpperCase()
                      if (user?.email) return user.email.charAt(0).toUpperCase()
                      return 'A'
                    })()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {(() => {
                      if (user?.name) return user.name
                      if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`
                      if (user?.firstName) return user.firstName
                      if (user?.lastName) return user.lastName
                      return 'Admin User'
                    })()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email || 'admin@example.com'}
                  </p>
                  {user && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5 font-medium" title="Subscription plan">
                      Plan: {subscriptionPlanDisplay}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-3 sm:p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
        isLoggingOut={isLoggingOut}
      />
      </div>
    </>
  )
} 