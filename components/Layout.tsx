'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
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
  FolderOpen,
  CreditCard,
  Upload,
  Briefcase,
  CalendarClock,
  AlertOctagon,
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import ThemeToggle from './ThemeToggle'
import LogoutModal from './LogoutModal'
import CaseSnapLoader from './CaseSnapLoader'
import {
  useLazyGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from '@/redux/api/notificationsApi'
import type { Notification as ApiNotification } from '@/redux/api/notificationsApi'
import { useGetOnboardingStatusQuery } from '@/redux/api/onboardingApi'
import { getAssigneeHeaderLabel, getAssigneeScopeFromModules } from '@/utils/permissions'

const APP_BACKEND_URL =
  process.env.NEXT_PUBLIC_APP_BACKEND_URL || 'https://casesnapbackend.onrender.com/'

interface LayoutProps {
  children: React.ReactNode
}

interface Module {
  _id: string
  name: string
  displayName: string
  description: string
  /** Effective permissions for the current user (from GET `/api/modules`). */
  actions?: string[]
  permissions?: string[]
}

interface ModulesResponse {
  data: Module[]
}

interface ModulesCache {
  data: Module[]
  cachedAt: number
}

const MODULES_CACHE_TTL_MS = 1000 * 60 * 60 * 12 // 12 hours
const MODULES_CACHE_KEY_PREFIX = 'sidebarModulesCache'

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
   { name: 'Subscription', href: '/subscription', icon: CreditCard },
]

// Maps every backend notification type to an icon component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NOTIFICATION_TYPE_ICON: Record<string, any> = {
  // legacy generic types
  success: CheckCircle,
  info: Info,
  warning: AlertCircle,
  error: AlertOctagon,
  client: Building,
  case: FolderOpen,
  // client-specific
  client_created: UserPlus,
  client_assigned: UserCheck,
  client_bulk_imported: Upload,
  // case-specific
  case_created: Briefcase,
  case_assigned: Briefcase,
  case_bulk_imported: Upload,
  // stage / reminder
  case_stage_needs_confirmation: AlertCircle,
  case_stage_reminder_5_days: Clock,
  case_stage_reminder_2_days: Clock,
  case_stage_reminder_1_day: CalendarClock,
  case_stage_followup_after_date: AlertOctagon,
}

// Icon colour per notification type
function getNotificationIconColor(type: string): string {
  if (type.startsWith('client')) return 'text-blue-500'
  if (type === 'case_created' || type === 'case_assigned' || type === 'case_bulk_imported') return 'text-indigo-500'
  if (type === 'case_stage_needs_confirmation') return 'text-yellow-500'
  if (type === 'case_stage_reminder_5_days' || type === 'case_stage_reminder_2_days') return 'text-orange-400'
  if (type === 'case_stage_reminder_1_day') return 'text-orange-500'
  if (type === 'case_stage_followup_after_date') return 'text-red-500'
  if (type === 'success') return 'text-green-500'
  if (type === 'warning') return 'text-yellow-500'
  if (type === 'error') return 'text-red-500'
  return 'text-blue-500'
}

// Icon background per notification type
function getNotificationIconBg(type: string): string {
  if (type.startsWith('client')) return 'bg-blue-50 dark:bg-blue-900/20'
  if (type === 'case_created' || type === 'case_assigned' || type === 'case_bulk_imported') return 'bg-indigo-50 dark:bg-indigo-900/20'
  if (type.includes('reminder') || type === 'case_stage_needs_confirmation') return 'bg-orange-50 dark:bg-orange-900/20'
  if (type === 'case_stage_followup_after_date') return 'bg-red-50 dark:bg-red-900/20'
  if (type === 'success') return 'bg-green-50 dark:bg-green-900/20'
  if (type === 'warning') return 'bg-yellow-50 dark:bg-yellow-900/20'
  if (type === 'error') return 'bg-red-50 dark:bg-red-900/20'
  return 'bg-blue-50 dark:bg-blue-900/20'
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

/**
 * Returns the URL a notification should navigate to.
 * - Single entity  (relatedEntityId present) → opens the detail dialog via ?open=
 * - Bulk / no ID   (relatedEntityId absent)  → goes to the listing page
 * Falls back to notifType prefix when relatedEntityType is not set.
 */
function getNotificationLink(
  relatedEntityType?: string,
  relatedEntityId?: string,
  notifType?: string,
): { href: string; isBulk: boolean; entityLabel: string } | null {
  const rawType = relatedEntityType?.toLowerCase() ?? ''
  const isClient =
    rawType === 'client' || rawType === 'clients' || !!notifType?.startsWith('client')
  const isCase =
    rawType === 'case' || rawType === 'cases' || !!notifType?.startsWith('case')

  if (!isClient && !isCase) return null

  if (relatedEntityId) {
    const id = encodeURIComponent(relatedEntityId)
    if (isClient) return { href: `/clients?open=${id}`, isBulk: false, entityLabel: 'client' }
    if (isCase)   return { href: `/cases?open=${id}&fromNotification=1`, isBulk: false, entityLabel: 'case' }
  }

  // No single entity ID — send to listing page
  if (isClient) return { href: '/clients', isBulk: true, entityLabel: 'clients' }
  if (isCase)   return { href: '/cases',   isBulk: true, entityLabel: 'cases' }
  return null
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [modules, setModules] = useState<Module[]>([])
  const [modulesLoading, setModulesLoading] = useState(true)
  const [isRouteLoading, setIsRouteLoading] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { theme } = useTheme()
  const { logout, user } = useAuth()
  // v2: cache entries include per-user `actions` from `/api/modules` (used for assignee badge).
  const modulesCacheKey = `${MODULES_CACHE_KEY_PREFIX}:v2:${user?.organizationId || user?.id || 'default'}`

  const { data: onboarding } = useGetOnboardingStatusQuery(undefined, {
    skip: !user,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })

  const onboardingOrgId = onboarding?.organizationId ?? ''
  const inviteStorageKey = onboardingOrgId ? `onboarding:invite-dismissed:${onboardingOrgId}` : ''
  const roleBannerStorageKey = onboardingOrgId ? `onboarding:role-banner-dismissed:${onboardingOrgId}` : ''

  const [inviteBannerDismissed, setInviteBannerDismissed] = useState(false)
  const [roleBannerDismissed, setRoleBannerDismissed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !inviteStorageKey) {
      setInviteBannerDismissed(false)
      return
    }
    setInviteBannerDismissed(sessionStorage.getItem(inviteStorageKey) === '1')
  }, [inviteStorageKey])

  useEffect(() => {
    if (typeof window === 'undefined' || !roleBannerStorageKey) {
      setRoleBannerDismissed(false)
      return
    }
    setRoleBannerDismissed(sessionStorage.getItem(roleBannerStorageKey) === '1')
  }, [roleBannerStorageKey])

  const dismissInviteBanner = () => {
    if (inviteStorageKey) sessionStorage.setItem(inviteStorageKey, '1')
    setInviteBannerDismissed(true)
  }

  const dismissRoleBanner = () => {
    if (roleBannerStorageKey) sessionStorage.setItem(roleBannerStorageKey, '1')
    setRoleBannerDismissed(true)
  }

  const showInviteBanner =
    !!onboarding?.readiness?.suggestInviteMoreUsers && !inviteBannerDismissed
  const showRoleSetupBanner =
    onboarding?.suggestedNextStep === 'create_custom_role' &&
    !roleBannerDismissed &&
    !pathname.startsWith('/roles')
  
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
  const [canManageTemp, setCanManageTemp] = useState(false)

  useEffect(() => {
    try {
      const v = typeof window !== 'undefined' && sessionStorage.getItem('canManageSubscriptionTemp') === '1'
      setCanManageTemp(!!v)
    } catch {
      setCanManageTemp(false)
    }
  }, [])

  const hasSubscriptionPermission = !!user?.canManageSubscription || canManageTemp
  const subscriptionOnlyMode = hasSubscriptionPermission && !isSuperAdminUser

  useEffect(() => {
    if (!subscriptionOnlyMode) return
    if (typeof window === 'undefined') return
    if (pathname !== '/subscription') {
      router.replace('/subscription')
    }
  }, [subscriptionOnlyMode, pathname, router])

  const bottomNavigation = staticBottomNavigation.filter(item => {
    if (subscriptionOnlyMode) {
      return item.name === 'Subscription'
    }
    return item.name !== 'Subscription' || isSuperAdminUser || canManageTemp || (!!user && !!(user as any).canManageSubscription)
  })

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
  const assigneeHeaderScope = useMemo(() => getAssigneeScopeFromModules(modules), [modules])
  const assigneeHeaderLabel = assigneeHeaderScope
    ? getAssigneeHeaderLabel(assigneeHeaderScope)
    : ''
  const assigneeHeaderTitle = assigneeHeaderScope
    ? assigneeHeaderScope === 'case'
      ? 'You can be assigned to cases'
      : assigneeHeaderScope === 'client'
        ? 'You can be assigned to clients'
        : assigneeHeaderScope === 'both'
          ? 'You can be assigned to cases and clients'
          : 'You are an assignee'
    : ''
  
  // Load modules from cache first, then refresh from API
  useEffect(() => {
    let isMounted = true

    const loadCachedModules = (): boolean => {
      if (typeof window === 'undefined') return false
      try {
        const cached = sessionStorage.getItem(modulesCacheKey)
        if (!cached) return false

        const parsed: ModulesCache = JSON.parse(cached)
        const isValidCache =
          Array.isArray(parsed?.data) &&
          typeof parsed?.cachedAt === 'number' &&
          Date.now() - parsed.cachedAt < MODULES_CACHE_TTL_MS

        if (!isValidCache) {
          sessionStorage.removeItem(modulesCacheKey)
          return false
        }

        setModules(parsed.data)
        setModulesLoading(false)
        return true
      } catch (error) {
        console.warn('Failed to read module cache:', error)
        return false
      }
    }

    const saveModulesToCache = (modulesData: Module[]) => {
      if (typeof window === 'undefined') return
      try {
        const cachePayload: ModulesCache = {
          data: modulesData,
          cachedAt: Date.now(),
        }
        sessionStorage.setItem(modulesCacheKey, JSON.stringify(cachePayload))
      } catch (error) {
        console.warn('Failed to write module cache:', error)
      }
    }

    const fetchModules = async () => {
      const hasCachedModules = loadCachedModules()
      if (!hasCachedModules) {
        setModulesLoading(true)
      }

      try {
        // Remove trailing slash if present
        const backendUrl = APP_BACKEND_URL.replace(/\/$/, '')
        const token =
          typeof window !== 'undefined'
            ? sessionStorage.getItem('authToken') || sessionStorage.getItem('token') || ''
            : ''
        const response = await fetch(`${backendUrl}/api/modules`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
        if (response.ok) {
          const responseData: ModulesResponse = await response.json()
          // Get modules from data array
          const modulesData = responseData.data || []
          if (isMounted) {
            setModules(modulesData)
          }
          saveModulesToCache(modulesData)
        } else {
          console.error('Failed to fetch modules:', response.statusText)
        }
      } catch (error) {
        console.error('Failed to fetch modules:', error)
      } finally {
        if (isMounted) {
          setModulesLoading(false)
        }
      }
    }
    
    fetchModules()
    return () => {
      isMounted = false
    }
  }, [modulesCacheKey])
  
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
  
  // Build one continuous navigation list so Settings feels part of modules
  const topNavigation = subscriptionOnlyMode
    ? staticBottomNavigation.filter((item) => item.name === 'Subscription')
    : [
        ...staticTopNavigation,
        ...dynamicNavigation,
        ...bottomNavigation,
      ]
  const prefetchKey = topNavigation.map((item) => item.href).join('|')

  const isDark = theme === 'dark'

  const [fetchNotifications, { data: notificationsData, isLoading: notificationsLoading }] =
    useLazyGetNotificationsQuery()
  const [markOneAsRead] = useMarkNotificationAsReadMutation()
  const [markAllAsRead, { isLoading: markingAllRead }] = useMarkAllNotificationsAsReadMutation()

  // Optimistic per-item read override: Set of notification IDs marked read locally
  const [localReadIds, setLocalReadIds] = useState<Set<string>>(new Set())
  const [allReadOverride, setAllReadOverride] = useState(false)

  // Badge via 60-second poll (independent of panel open state)
  const { data: unreadCountData } = useGetUnreadCountQuery(undefined, {
    skip: !user,
    pollingInterval: 60_000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })

  // Badge count: prefer poll data, fall back to list response, then local count
  const [optimisticBadge, setOptimisticBadge] = useState<number | null>(null)
  const serverBadge = unreadCountData?.unreadCount ?? notificationsData?.unreadCount ?? null

  // Sync optimistic badge with server whenever server data arrives
  useEffect(() => {
    if (serverBadge != null) setOptimisticBadge(serverBadge)
  }, [serverBadge])

  const badgeCount = allReadOverride ? 0 : (optimisticBadge ?? 0)

  useEffect(() => {
    if (user) fetchNotifications({ limit: 30 })
  }, [user])

  // Clear optimistic overrides whenever fresh list data arrives
  useEffect(() => {
    if (notificationsData) {
      setAllReadOverride(false)
      setLocalReadIds(new Set())
    }
  }, [notificationsData])

  useEffect(() => {
    // Prefetching every route makes dev navigation feel "stuck" because it triggers
    // compilation of heavy pages (DataGrid, large client bundles) upfront.
    // In production this can be useful, but in dev it hurts UX a lot.
    if (process.env.NODE_ENV === 'development') return

    const run = () => {
      topNavigation.slice(0, 4).forEach((item) => {
        router.prefetch(item.href)
      })
    }

    // Defer prefetch so first paint isn't blocked.
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      ;(window as any).requestIdleCallback(run, { timeout: 2000 })
    } else {
      setTimeout(run, 600)
    }
  }, [router, prefetchKey])

  useEffect(() => {
    // Hide redirect loader as soon as route changes.
    setIsRouteLoading(false)
  }, [pathname])

  const apiNotifications: ApiNotification[] = notificationsData?.data ?? []
  const notifications = apiNotifications.map((n) => {
    const id = n._id || n.id || ''
    return {
      id,
      type: n.type,
      title: n.title,
      message: n.message,
      time: formatNotificationTime(n.createdAt),
      icon: NOTIFICATION_TYPE_ICON[n.type] ?? Info,
      read: allReadOverride || localReadIds.has(id) ? true : n.read,
      relatedEntityId: n.relatedEntityId,
      relatedEntityType: n.relatedEntityType,
    }
  })

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

  const handleNotificationClick = async (notification: typeof notifications[0]) => {
    // Mark as read optimistically, then call API
    if (!notification.read) {
      setLocalReadIds((prev) => new Set(prev).add(notification.id))
      setOptimisticBadge((prev) => Math.max(0, (prev ?? 0) - 1))
      try {
        await markOneAsRead({ notificationId: notification.id }).unwrap()
      } catch {
        // rollback on failure
        setLocalReadIds((prev) => {
          const next = new Set(prev)
          next.delete(notification.id)
          return next
        })
        setOptimisticBadge((prev) => (prev ?? 0) + 1)
      }
    }
    const dest = getNotificationLink(notification.relatedEntityType, notification.relatedEntityId, notification.type)
    if (dest) {
      setShowNotifications(false)
      navigateWithLoader(dest.href)
    }
  }

  const navigateWithLoader = (href: string) => {
    if (!href || href === pathname) {
      setSidebarOpen(false)
      return
    }

    setIsRouteLoading(true)
    router.push(href)
    setSidebarOpen(false)

    // Fallback: avoid infinite loader if navigation gets interrupted.
    setTimeout(() => {
      setIsRouteLoading(false)
    }, 12000)
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
      {isRouteLoading && (
        <CaseSnapLoader message="Opening page..." />
      )}
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
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={false}
                    onClick={() => {
                      // Let <Link> perform the navigation; we only control the loader UI here.
                      if (item.href === pathname) {
                        setSidebarOpen(false)
                        return
                      }
                      setIsRouteLoading(true)
                      setSidebarOpen(false)
                      // Fallback: avoid infinite loader if navigation gets interrupted.
                      setTimeout(() => {
                        setIsRouteLoading(false)
                      }, 12000)
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
                  </Link>
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
          <div className="flex items-center h-14 sm:h-16 px-3 sm:px-4 lg:px-6 gap-2 sm:gap-3">

            {/* Left: hamburger + search — takes remaining space, never shrinks below 0 */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden shrink-0 p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              {/* Search bar */}
              <div className="flex-1 min-w-0 max-w-xs sm:max-w-sm lg:max-w-lg">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="block w-full pl-9 pr-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Right: controls — shrink-0 so they never compress the search bar */}
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <ThemeToggle size="sm" />

              {/* Assignee badge — icon-only on xs, full label on sm+ */}
              {user && assigneeHeaderScope && (
                <span
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-yellow-500/35 bg-yellow-500/10 px-1.5 sm:px-2.5 font-semibold uppercase leading-none tracking-wide text-yellow-700 shadow-sm dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-400"
                  title={assigneeHeaderTitle}
                >
                  <UserCheck className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
                  <span className="hidden sm:inline whitespace-nowrap text-[11px]">{assigneeHeaderLabel}</span>
                </span>
              )}

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    const next = !showNotifications
                    setShowNotifications(next)
                    if (next && user) fetchNotifications({ limit: 30 })
                  }}
                  className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                >
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                  {badgeCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-yellow-500 px-1 text-[10px] font-bold leading-none text-gray-900">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Notifications</h3>
                      <div className="flex items-center gap-2">
                        {badgeCount > 0 && (
                          <span className="bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
                            {badgeCount} new
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Mark all as read — only shown when there are unread items */}
                    {badgeCount > 0 && (
                      <div className="flex justify-end px-4 py-1.5 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                        <button
                          disabled={markingAllRead}
                          onClick={async () => {
                            setAllReadOverride(true)
                            setOptimisticBadge(0)
                            try {
                              await markAllAsRead().unwrap()
                            } catch {
                              setAllReadOverride(false)
                              setOptimisticBadge(serverBadge ?? 0)
                            }
                            fetchNotifications({ limit: 30 })
                          }}
                          className="text-xs font-medium text-yellow-600 hover:text-yellow-500 dark:text-yellow-400 dark:hover:text-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {markingAllRead ? 'Marking…' : 'Mark all as read'}
                        </button>
                      </div>
                    )}

                    {/* List */}
                    <div className="max-h-[26rem] overflow-y-auto notification-scroll">
                      {notificationsLoading ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400 dark:text-gray-500">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-yellow-500" />
                          <p className="text-sm">Loading…</p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400 dark:text-gray-500">
                          <Bell className="h-8 w-8 opacity-40" />
                          <p className="text-sm">No notifications</p>
                        </div>
                      ) : (
                        notifications.map((notification) => {
                          const Icon = notification.icon
                          const link = getNotificationLink(notification.relatedEntityType, notification.relatedEntityId, notification.type)
                          const isUnread = !notification.read
                          return (
                            <button
                              key={notification.id}
                              type="button"
                              onClick={() => handleNotificationClick(notification)}
                              className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700/60 transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                                isUnread
                                  ? 'bg-blue-50/60 dark:bg-blue-900/10 border-l-2 border-l-blue-500'
                                  : 'border-l-2 border-l-transparent'
                              }`}
                            >
                              {/* Type icon */}
                              <div className={`mt-0.5 flex-shrink-0 rounded-full p-1.5 ${getNotificationIconBg(notification.type)}`}>
                                <Icon className={`h-3.5 w-3.5 ${getNotificationIconColor(notification.type)}`} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-sm leading-snug ${isUnread ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                    {notification.title}
                                  </p>
                                  {isUnread && (
                                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                                  )}
                                </div>
                                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                  {notification.message}
                                </p>
                                <div className="mt-1 flex items-center gap-3">
                                  <span className="flex items-center gap-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                                    <Clock className="h-3 w-3" />
                                    {notification.time}
                                  </span>
                                  {link && (
                                    <span className="text-[11px] font-medium text-yellow-600 dark:text-yellow-400">
                                      {link.isBulk ? `View all ${link.entityLabel}` : `View ${link.entityLabel}`} →
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          )
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-gray-200 dark:border-gray-700">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-yellow-500 sm:h-8 sm:w-8">
                  <span className="text-xs font-medium text-gray-900 sm:text-sm">
                    {(() => {
                      if (user?.name) return user.name.charAt(0).toUpperCase()
                      if (user?.firstName) return user.firstName.charAt(0).toUpperCase()
                      if (user?.lastName) return user.lastName.charAt(0).toUpperCase()
                      if (user?.email) return user.email.charAt(0).toUpperCase()
                      return 'A'
                    })()}
                  </span>
                </div>
                <div className="hidden min-w-0 max-w-[10rem] lg:max-w-[14rem] flex-col items-stretch text-left sm:flex">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {(() => {
                      if (user?.name) return user.name
                      if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`
                      if (user?.firstName) return user.firstName
                      if (user?.lastName) return user.lastName
                      return 'Admin User'
                    })()}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {user?.email || 'admin@example.com'}
                  </p>
                  {user && (
                    <p
                      className="mt-0.5 truncate text-xs font-medium text-yellow-600 dark:text-yellow-400"
                      title="Subscription plan"
                    >
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
          <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
            {showRoleSetupBanner && (
              <div
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-950 dark:border-amber-800/80 dark:bg-amber-950/40 dark:text-amber-100"
                role="status"
              >
                <p className="pr-2">
                  <span className="font-medium">Set up roles:</span>{' '}
                  Create a custom role for your team (beyond the built-in Super Admin), then assign it when you add users.
                </p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href="/roles"
                    className="inline-flex items-center justify-center rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                  >
                    Go to Roles
                  </Link>
                  <button
                    type="button"
                    onClick={dismissRoleBanner}
                    className="text-xs font-medium text-amber-800 underline dark:text-amber-200"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
            {showInviteBanner && (
              <div
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm text-blue-950 dark:border-blue-800/80 dark:bg-blue-950/40 dark:text-blue-100"
                role="status"
              >
                <p className="pr-2">
                  <span className="font-medium">Grow your team:</span> You have custom roles set up, but only one approved
                  user. Invite teammates from Users so they can collaborate.
                </p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href="/users"
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Invite users
                  </Link>
                  <button
                    type="button"
                    onClick={dismissInviteBanner}
                    className="text-xs font-medium text-blue-800 underline dark:text-blue-200"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
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