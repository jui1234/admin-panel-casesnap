'use client'

import { BarChart3, TrendingUp, Users, Activity, Eye, Download, Calendar } from 'lucide-react'
import Layout from '@/components/Layout'

export default function AnalyticsPage() {
  const metrics = [
    { name: 'Total Users', value: '1,234', change: '+12%', icon: Users },
    { name: 'Active Sessions', value: '56', change: '+5%', icon: Activity },
    { name: 'Page Views', value: '89.2K', change: '+18%', icon: Eye },
    { name: 'Conversion Rate', value: '3.2%', change: '+2.1%', icon: TrendingUp },
  ]

  const topPages = [
    { name: '/dashboard', views: '12,543', change: '+15%' },
    { name: '/users', views: '8,921', change: '+8%' },
    { name: '/reports', views: '6,234', change: '+12%' },
    { name: '/settings', views: '4,567', change: '+3%' },
  ]

  const userActivity = [
    { time: '00:00', users: 45 },
    { time: '04:00', users: 32 },
    { time: '08:00', users: 78 },
    { time: '12:00', users: 156 },
    { time: '16:00', users: 134 },
    { time: '20:00', users: 89 },
  ]

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Monitor system performance and user activity</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <button className="flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-gray-700 dark:text-gray-300">
              <Calendar className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
              <span className="text-sm">Last 30 days</span>
            </button>
            <button className="flex items-center justify-center px-3 sm:px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-600 transition-colors duration-200">
              <Download className="h-4 w-4 mr-2" />
              <span className="text-sm">Export Data</span>
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <div key={metric.name} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">{metric.name}</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">{metric.value}</p>
                    <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">{metric.change}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* User Activity Chart */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
                User Activity (24h)
              </h3>
              <div className="h-48 sm:h-64 flex items-end justify-between space-x-1 sm:space-x-2">
                {userActivity.map((data, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-yellow-500 rounded-t"
                      style={{ height: `${(data.users / 156) * 150}px` }}
                    ></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{data.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Pages */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
                Top Pages
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center mr-2 sm:mr-3">
                        {index + 1}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{page.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{page.views}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">{page.change}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Traffic Sources */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
                Traffic Sources
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Direct</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">45%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Organic Search</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">32%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Referral</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">18%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '18%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Social</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">5%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Device Types */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
                Device Types
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Desktop</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">58%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '58%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Mobile</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">35%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Tablet</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">7%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '7%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Stats */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
                Real-time Stats
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Current Users</span>
                  <span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">156</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Active Sessions</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Page Views/min</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Bounce Rate</span>
                  <span className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400">23%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 