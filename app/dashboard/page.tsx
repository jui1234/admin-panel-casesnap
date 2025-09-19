'use client'

import { Shield, Users, Settings, TrendingUp, Activity, Clock, UserCheck, BarChart3, Building2, Mail, Phone, MapPin } from 'lucide-react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { ROLES } from '@/utils/roles'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [organizationData, setOrganizationData] = useState<any>(null)

  useEffect(() => {
    // Load organization data from localStorage
    try {
      const orgData = localStorage.getItem('organizationData')
      if (orgData) {
        setOrganizationData(JSON.parse(orgData))
      }
    } catch (error) {
      console.error('Error loading organization data:', error)
    }
  }, [])

  const stats = [
    {
      name: 'Total Users',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
    },
    {
      name: 'Active Sessions',
      value: '56',
      change: '+5%',
      changeType: 'positive',
      icon: Activity,
    },
    {
      name: 'System Status',
      value: 'Online',
      change: '99.9%',
      changeType: 'positive',
      icon: Shield,
    },
    {
      name: 'Response Time',
      value: '2.3s',
      change: '-0.2s',
      changeType: 'positive',
      icon: Clock,
    },
  ]

  const recentActivity = [
    { id: 1, user: user?.name || 'Admin User', action: 'Logged in', time: 'Just now', role: user?.role || 'Admin' },
    { id: 2, user: 'Jane Smith', action: 'Updated profile', time: '5 minutes ago', role: 'Admin' },
    { id: 3, user: 'Mike Johnson', action: 'Created new user', time: '10 minutes ago', role: 'Admin' },
    { id: 4, user: 'Sarah Wilson', action: 'Changed permissions', time: '15 minutes ago', role: 'Employee' },
  ]

  const roleStats = [
    { role: 'Super Admin', count: 2, color: 'bg-red-100 text-red-800' },
    { role: 'Admin', count: 5, color: 'bg-yellow-100 text-yellow-800' },
    { role: 'Employee', count: 17, color: 'bg-green-100 text-green-800' },
  ]

  return (
    <ProtectedRoute>
      <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Welcome back, {user?.name || 'Admin'}! Here's what's happening with your admin panel.
          </p>
        </div>

        {/* Welcome Section with User & Organization Info */}
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg border border-yellow-200 dark:border-yellow-800 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Welcome to {organizationData?.companyName || 'CaseSnap'} Dashboard
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center">
                  <UserCheck className="h-4 w-4 mr-2 text-yellow-600" />
                  <span>Role: <span className="font-medium capitalize">{user?.role || 'Admin'}</span></span>
                </div>
                {organizationData && (
                  <>
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2 text-yellow-600" />
                      <span>Industry: <span className="font-medium">{organizationData.industry}</span></span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-yellow-600" />
                      <span>{organizationData.city}, {organizationData.province}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            {organizationData && (
              <div className="mt-4 sm:mt-0 sm:ml-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-yellow-200 dark:border-yellow-700">
                  <div className="flex items-center mb-2">
                    <Building2 className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">Organization</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Mail className="h-3 w-3 mr-2" />
                      <span>{organizationData.companyEmail}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Phone className="h-3 w-3 mr-2" />
                      <span>{organizationData.companyPhone}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.name} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
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
                        <dd className="flex items-baseline">
                          <div className="text-base sm:text-lg lg:text-2xl font-semibold text-gray-900 dark:text-white">
                            {stat.value}
                          </div>
                          <div className={`ml-1 sm:ml-2 flex items-baseline text-xs sm:text-sm font-semibold ${
                            stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            <TrendingUp className="self-center flex-shrink-0 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="sr-only">
                              {stat.changeType === 'positive' ? 'Increased' : 'Decreased'} by
                            </span>
                            {stat.change}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
                Recent Activity
              </h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentActivity.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== recentActivity.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center ring-4 sm:ring-8 ring-white dark:ring-gray-800">
                              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 dark:text-yellow-400" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex flex-col sm:flex-row sm:justify-between sm:space-x-4">
                            <div>
                              <p className="text-xs sm:text-sm text-gray-900 dark:text-white">
                                <span className="font-medium">{activity.user}</span>{' '}
                                {activity.action}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Role: {activity.role}
                              </p>
                            </div>
                            <div className="text-right text-xs sm:text-sm whitespace-nowrap text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
                              {activity.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Role Distribution */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
                Role Distribution
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {roleStats.map((roleStat) => (
                  <div key={roleStat.role} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        roleStat.role === 'Super Admin' 
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                          : roleStat.role === 'Admin'
                          ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                          : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                      }`}>
                        {roleStat.role}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{roleStat.count}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {((roleStat.count / 24) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
            <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <button className="flex flex-col items-center p-3 sm:p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-yellow-500 mb-2" />
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-center">Add User</span>
              </button>
              <button className="flex flex-col items-center p-3 sm:p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-yellow-500 mb-2" />
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-center">Settings</span>
              </button>
              <button className="flex flex-col items-center p-3 sm:p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-yellow-500 mb-2" />
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-center">Permissions</span>
              </button>
              <button className="flex flex-col items-center p-3 sm:p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-yellow-500 mb-2" />
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-center">Reports</span>
              </button>
            </div>
          </div>
        </div>

        {/* Organization Details */}
        {organizationData && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
                Organization Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</p>
                  <p className="text-sm text-gray-900 dark:text-white">{organizationData.companyName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Industry</p>
                  <p className="text-sm text-gray-900 dark:text-white">{organizationData.industry}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</p>
                  <p className="text-sm text-gray-900 dark:text-white">{organizationData.city}, {organizationData.province}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Website</p>
                  <a href={organizationData.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-sm text-yellow-600 hover:text-yellow-500">
                    {organizationData.companyWebsite}
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</p>
                  <p className="text-sm text-gray-900 dark:text-white">{organizationData.streetAddress}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Postal Code</p>
                  <p className="text-sm text-gray-900 dark:text-white">{organizationData.postalCode}</p>
                </div>
              </div>
              {organizationData.practiceAreas && organizationData.practiceAreas.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Practice Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {organizationData.practiceAreas.map((area: string, index: number) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* System Health */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
                System Health
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">CPU Usage</span>
                  <div className="flex items-center">
                    <div className="w-12 sm:w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">45%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Memory Usage</span>
                  <div className="flex items-center">
                    <div className="w-12 sm:w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">68%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Disk Usage</span>
                  <div className="flex items-center">
                    <div className="w-12 sm:w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">32%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Logins */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
                Recent Logins
              </h3>
              <div className="space-y-3">
                {recentActivity.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                        <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                          {activity.user.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.user}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.role}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </Layout>
    </ProtectedRoute>
  )
}