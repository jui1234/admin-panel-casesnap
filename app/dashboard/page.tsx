'use client'

import { Shield, Users, Settings, TrendingUp, Activity, Clock, UserCheck, BarChart3 } from 'lucide-react'
import Layout from '@/components/Layout'
import { ROLES } from '@/utils/roles'

export default function DashboardPage() {
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
    { id: 1, user: 'John Doe', action: 'Logged in', time: '2 minutes ago', role: 'Super Admin' },
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
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-tile-900">Dashboard</h1>
          <p className="text-tile-600">Welcome back! Here's what's happening with your admin panel.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg border border-tile-200">
                <div className="p-4 sm:p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Icon className="h-5 w-6 sm:h-6 text-primary-500" />
                    </div>
                    <div className="ml-3 sm:ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-tile-500 truncate">
                          {stat.name}
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-lg sm:text-2xl font-semibold text-tile-900">
                            {stat.value}
                          </div>
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white shadow rounded-lg border border-tile-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-tile-900 mb-4">
                Recent Activity
              </h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentActivity.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== recentActivity.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-tile-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center ring-8 ring-white">
                              <Users className="h-4 w-4 text-primary-600" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex flex-col sm:flex-row sm:justify-between sm:space-x-4">
                            <div>
                              <p className="text-sm text-tile-900">
                                <span className="font-medium">{activity.user}</span>{' '}
                                {activity.action}
                              </p>
                              <p className="text-xs text-tile-500 mt-1">
                                Role: {activity.role}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-tile-500 mt-1 sm:mt-0">
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
          <div className="bg-white shadow rounded-lg border border-tile-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-tile-900 mb-4">
                Role Distribution
              </h3>
              <div className="space-y-4">
                {roleStats.map((roleStat) => (
                  <div key={roleStat.role} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleStat.color}`}>
                        {roleStat.role}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-tile-900">{roleStat.count}</p>
                      <p className="text-xs text-tile-500">
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
        <div className="bg-white shadow rounded-lg border border-tile-200">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-tile-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-4 border border-tile-200 rounded-lg hover:bg-tile-50 transition-colors duration-200">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary-500 mb-2" />
                <span className="text-xs sm:text-sm font-medium text-tile-900 text-center">Add User</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-tile-200 rounded-lg hover:bg-tile-50 transition-colors duration-200">
                <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-primary-500 mb-2" />
                <span className="text-xs sm:text-sm font-medium text-tile-900 text-center">Settings</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-tile-200 rounded-lg hover:bg-tile-50 transition-colors duration-200">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary-500 mb-2" />
                <span className="text-xs sm:text-sm font-medium text-tile-900 text-center">Permissions</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-tile-200 rounded-lg hover:bg-tile-50 transition-colors duration-200">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary-500 mb-2" />
                <span className="text-xs sm:text-sm font-medium text-tile-900 text-center">Reports</span>
              </button>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Health */}
          <div className="bg-white shadow rounded-lg border border-tile-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-tile-900 mb-4">
                System Health
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tile-700">CPU Usage</span>
                  <div className="flex items-center">
                    <div className="w-16 bg-tile-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-tile-900">45%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tile-700">Memory Usage</span>
                  <div className="flex items-center">
                    <div className="w-16 bg-tile-200 rounded-full h-2 mr-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-tile-900">68%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tile-700">Disk Usage</span>
                  <div className="flex items-center">
                    <div className="w-16 bg-tile-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-tile-900">32%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Logins */}
          <div className="bg-white shadow rounded-lg border border-tile-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-tile-900 mb-4">
                Recent Logins
              </h3>
              <div className="space-y-3">
                {recentActivity.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-tile-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary-700">
                          {activity.user.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-tile-900">{activity.user}</p>
                        <p className="text-xs text-tile-500">{activity.role}</p>
                      </div>
                    </div>
                    <span className="text-xs text-tile-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}