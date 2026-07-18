'use client'

import { useRouter } from 'next/navigation'
import {
  Users,
  Building2,
  Mail,
  UserCheck,
  FolderOpen,
  Bell,
  CalendarClock,
  Briefcase,
  CreditCard,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { useGetDashboardQuery, type DashboardRecentCase, type DashboardRecentClient } from '@/redux/api/dashboardApi'
import { StatTilesSkeleton, ContentBlockSkeleton } from '@/components/Skeletons'

const formatDate = (value?: string) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', { dateStyle: 'medium' })
}

const displayRoleName = (role: unknown) => {
  if (!role) return 'Admin'
  const roleName = typeof role === 'string' ? role : (role as { name?: string })?.name
  if (roleName === 'SUPER_ADMIN' || roleName === 'super-admin') return 'Super Admin'
  if (roleName === 'ADMIN' || roleName === 'admin') return 'Admin'
  if (roleName === 'EMPLOYEE' || roleName === 'employee') return 'Employee'
  return roleName || 'Admin'
}

const clientDisplayName = (client: DashboardRecentClient) =>
  client.fullName || [client.firstName, client.lastName].filter(Boolean).join(' ') || client.email || 'Client'

const caseDisplayName = (c: DashboardRecentCase) => c.caseNumber || c.partyName || 'Case'

function DashboardContent() {
  const router = useRouter()
  const { user } = useAuth()
  const { data, isLoading, isFetching, isError } = useGetDashboardQuery()

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <StatTilesSkeleton />
        <ContentBlockSkeleton />
      </div>
    )
  }

  if (isError || !data?.data) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Unable to load dashboard data right now. Please try again later.
        </p>
      </div>
    )
  }

  const { organization, subscription, stats, upcomingHearings, recentCases, recentClients } = data.data

  const statCards = [
    {
      name: 'Clients',
      value: stats.clients.total,
      sub: `${stats.clients.active} active · ${stats.clients.prospect} prospect`,
      icon: Users,
      href: '/clients',
    },
    {
      name: 'Cases',
      value: stats.cases.total,
      sub: `${stats.cases.active} active · ${stats.cases.archived} archived`,
      icon: FolderOpen,
      href: '/cases',
    },
    {
      name: 'Employees',
      value: stats.employees.total,
      sub: `${stats.employees.active} active · ${stats.employees.pending} pending`,
      icon: UserCheck,
      href: '/employees',
    },
    {
      name: 'Unread Notifications',
      value: stats.notifications.unread,
      sub: stats.cases.needsStageConfirmation > 0
        ? `${stats.cases.needsStageConfirmation} case${stats.cases.needsStageConfirmation === 1 ? '' : 's'} need confirmation`
        : 'All caught up',
      icon: Bell,
      href: undefined,
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Welcome back, {user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Admin')}! Here&apos;s what&apos;s happening at {organization.companyName}.
        </p>
      </div>

      {/* Welcome / Organization + Subscription Section */}
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg border border-yellow-200 dark:border-yellow-800 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {organization.companyName}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <UserCheck className="h-4 w-4 mr-2 text-yellow-600" />
                <span>Role: <span className="font-medium capitalize">{displayRoleName(user?.role)}</span></span>
              </div>
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-yellow-600" />
                <span>Industry: <span className="font-medium">{organization.industry}</span></span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-yellow-600" />
                <span>{organization.companyEmail}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push('/subscription')}
            className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-yellow-200 dark:border-yellow-700 hover:shadow-md transition-shadow cursor-pointer text-left"
          >
            <CreditCard className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">{subscription.subscriptionLabel}</span>
                <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                  subscription.isSubscriptionActive
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                }`}>
                  {subscription.isSubscriptionActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Manage subscription</span>
            </div>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {statCards.map((stat) => {
          const Icon = stat.icon
          const Wrapper = stat.href ? 'button' : 'div'
          return (
            <Wrapper
              key={stat.name}
              {...(stat.href ? { onClick: () => router.push(stat.href as string) } : {})}
              className={`bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200 text-left w-full ${stat.href ? 'cursor-pointer' : ''}`}
            >
              <div className="p-3 sm:p-4 lg:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                  </div>
                  <div className="ml-2 sm:ml-3 lg:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {stat.name}
                      </dt>
                      <dd>
                        <div className="text-base sm:text-lg lg:text-2xl font-semibold text-gray-900 dark:text-white">
                          {stat.value}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{stat.sub}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Wrapper>
          )
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Upcoming Hearings */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Upcoming Hearings
              </h3>
              <button
                onClick={() => router.push('/cases')}
                className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-500 flex items-center gap-1 cursor-pointer"
              >
                View all cases <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {upcomingHearings.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming hearings scheduled.</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {upcomingHearings.map((hearing, idx) => (
                  <li key={`${hearing.caseId}-${idx}`}>
                    <button
                      onClick={() => router.push(`/cases?open=${hearing.caseId}`)}
                      className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center min-w-0">
                        <span className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center flex-shrink-0">
                          <CalendarClock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 dark:text-yellow-400" />
                        </span>
                        <div className="ml-3 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                            {hearing.caseNumber}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{hearing.stageName}</p>
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm whitespace-nowrap text-gray-500 dark:text-gray-400 ml-2">
                        {formatDate(hearing.nextDate)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Subscription Limits */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
            <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
              Plan Limits
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Users', value: subscription.subscriptionLimits?.maxUsers, used: stats.employees.total },
                { label: 'Clients', value: subscription.subscriptionLimits?.maxClients, used: stats.clients.total },
                { label: 'Cases', value: subscription.subscriptionLimits?.maxCases, used: stats.cases.total },
              ].map((limit) => {
                const max = limit.value
                const isUnlimited = max === null || max === undefined
                const pct = !isUnlimited && max > 0 ? Math.min(100, Math.round((limit.used / max) * 100)) : 0
                return (
                  <div key={limit.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{limit.label}</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {limit.used}{isUnlimited ? '' : ` / ${max}`}
                      </span>
                    </div>
                    {!isUnlimited && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Cases & Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Recent Cases
              </h3>
              <button
                onClick={() => router.push('/cases')}
                className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-500 flex items-center gap-1 cursor-pointer"
              >
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {recentCases.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No cases yet.</p>
            ) : (
              <div className="space-y-2">
                {recentCases.map((c, idx) => {
                  const id = c.id || c._id
                  return (
                    <button
                      key={id || idx}
                      onClick={() => id && router.push(`/cases?open=${id}`)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center min-w-0">
                        <span className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 dark:text-yellow-400" />
                        </span>
                        <div className="ml-3 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{caseDisplayName(c)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.caseType || c.status || '—'}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">{formatDate(c.createdAt)}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Recent Clients
              </h3>
              <button
                onClick={() => router.push('/clients')}
                className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-500 flex items-center gap-1 cursor-pointer"
              >
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {recentClients.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No clients yet.</p>
            ) : (
              <div className="space-y-2">
                {recentClients.map((client, idx) => {
                  const id = client.id || client._id
                  const name = clientDisplayName(client)
                  return (
                    <button
                      key={id || idx}
                      onClick={() => id && router.push(`/clients?open=${id}`)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center min-w-0">
                        <span className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                            {name.split(' ').map((n) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?'}
                          </span>
                        </span>
                        <div className="ml-3 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{client.email || client.status || '—'}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">{formatDate(client.createdAt)}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {isFetching && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-right">Refreshing…</p>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute variant="stats">
      <DashboardContent />
    </ProtectedRoute>
  )
}
