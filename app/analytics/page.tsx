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
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-tile-900">Analytics</h1>
            <p className="text-tile-600">Monitor system performance and user activity</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 border border-tile-300 rounded-lg hover:bg-tile-50 transition-colors duration-200">
              <Calendar className="h-4 w-4 mr-2 text-tile-400" />
              Last 30 days
            </button>
            <button className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <div key={metric.name} className="bg-white p-6 rounded-lg shadow border border-tile-200">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-tile-500">{metric.name}</p>
                    <p className="text-2xl font-semibold text-tile-900">{metric.value}</p>
                    <p className="text-sm text-green-600">{metric.change}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Activity Chart */}
          <div className="bg-white shadow rounded-lg border border-tile-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-tile-900 mb-4">
                User Activity (24h)
              </h3>
              <div className="h-64 flex items-end justify-between space-x-2">
                {userActivity.map((data, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-primary-500 rounded-t"
                      style={{ height: `${(data.users / 156) * 200}px` }}
                    ></div>
                    <span className="text-xs text-tile-500 mt-2">{data.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Pages */}
          <div className="bg-white shadow rounded-lg border border-tile-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-tile-900 mb-4">
                Top Pages
              </h3>
              <div className="space-y-4">
                {topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-tile-900 bg-tile-100 rounded-full w-6 h-6 flex items-center justify-center mr-3">
                        {index + 1}
                      </span>
                      <span className="text-sm text-tile-700">{page.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-tile-900">{page.views}</p>
                      <p className="text-xs text-green-600">{page.change}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Traffic Sources */}
          <div className="bg-white shadow rounded-lg border border-tile-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-tile-900 mb-4">
                Traffic Sources
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tile-700">Direct</span>
                  <span className="text-sm font-medium text-tile-900">45%</span>
                </div>
                <div className="w-full bg-tile-200 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tile-700">Organic Search</span>
                  <span className="text-sm font-medium text-tile-900">32%</span>
                </div>
                <div className="w-full bg-tile-200 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tile-700">Referral</span>
                  <span className="text-sm font-medium text-tile-900">18%</span>
                </div>
                <div className="w-full bg-tile-200 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: '18%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tile-700">Social</span>
                  <span className="text-sm font-medium text-tile-900">5%</span>
                </div>
                <div className="w-full bg-tile-200 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Device Types */}
          <div className="bg-white shadow rounded-lg border border-tile-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-tile-900 mb-4">
                Device Types
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tile-700">Desktop</span>
                  <span className="text-sm font-medium text-tile-900">58%</span>
                </div>
                <div className="w-full bg-tile-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '58%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tile-700">Mobile</span>
                  <span className="text-sm font-medium text-tile-900">35%</span>
                </div>
                <div className="w-full bg-tile-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tile-700">Tablet</span>
                  <span className="text-sm font-medium text-tile-900">7%</span>
                </div>
                <div className="w-full bg-tile-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '7%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Stats */}
          <div className="bg-white shadow rounded-lg border border-tile-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-tile-900 mb-4">
                Real-time Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tile-700">Current Users</span>
                  <span className="text-sm font-medium text-green-600">156</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tile-700">Active Sessions</span>
                  <span className="text-sm font-medium text-tile-900">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tile-700">Page Views/min</span>
                  <span className="text-sm font-medium text-tile-900">234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tile-700">Bounce Rate</span>
                  <span className="text-sm font-medium text-red-600">23%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 