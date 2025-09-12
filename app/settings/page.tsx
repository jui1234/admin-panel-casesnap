'use client'

import { Settings, Save, User, Shield, Bell, Globe, Database, Key } from 'lucide-react'
import Layout from '@/components/Layout'
import Head from 'next/head'

export default function SettingsPage() {
  return (
    <>
      <Head>
        <title>Legal Practice Management Settings - CaseSnap Lawyer Case Management Software</title>
        <meta name="description" content="Configure your law firm management software settings. Secure advocate admin panel with case tracking, document management, and legal billing software for lawyers in India." />
        <meta name="keywords" content="legal practice management settings, law firm management software configuration, advocate admin panel settings, case tracking software settings, legal billing software configuration" />
        <link rel="canonical" href="https://casesnap.com/settings" />
      </Head>
      <Layout>
        <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Legal Practice Management Settings</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Configure your law firm management software settings and advocate admin panel preferences for optimal legal case tracking</p>
          </div>
          <button className="flex items-center px-3 sm:px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-600 transition-colors duration-200 w-full sm:w-auto justify-center">
            <Save className="h-4 w-4 mr-2" />
            <span className="text-sm">Save Changes</span>
          </button>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Account Settings */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
                <div className="flex items-center mb-3 sm:mb-4">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 mr-2" />
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white">Lawyer Account Settings</h3>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      defaultValue="Admin User"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      defaultValue="admin@example.com"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Legal Practice Title</label>
                    <input
                      type="text"
                      defaultValue="Senior Advocate"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 mr-2" />
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white">Legal Data Security Settings</h3>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      id="two-factor"
                      type="checkbox"
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <label htmlFor="two-factor" className="ml-2 block text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      Enable two-factor authentication
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 mr-2" />
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white">Legal Practice System Settings</h3>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                    <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200">
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Bengali</option>
                      <option>Tamil</option>
                      <option>Telugu</option>
                      <option>Marathi</option>
                      <option>Gujarati</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Zone</label>
                    <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200">
                      <option>IST (Indian Standard Time)</option>
                      <option>UTC (Coordinated Universal Time)</option>
                      <option>EST (Eastern Standard Time)</option>
                      <option>PST (Pacific Standard Time)</option>
                      <option>GMT (Greenwich Mean Time)</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="auto-save"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <label htmlFor="auto-save" className="ml-2 block text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      Auto-save case management changes
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-4 sm:space-y-6">
            {/* Notification Settings */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 mr-2" />
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white">Legal Case Notifications</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Case Update Notifications</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Court Date Reminders</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Client Communication Alerts</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Legal Software Updates</span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* API Settings */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Key className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 mr-2" />
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white">Legal Software API Settings</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
                    <input
                      type="text"
                      defaultValue="sk-1234567890abcdef"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                    />
                  </div>
                  <button className="w-full flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-gray-700 dark:text-gray-300">
                    <Key className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm">Regenerate API Key</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Database Settings */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Database className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 mr-2" />
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white">Legal Case Database</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Auto Case Data Backup</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Daily Legal Document Backup</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                  <button className="w-full flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-gray-700 dark:text-gray-300">
                    <Database className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm">Create Legal Case Backup Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </Layout>
    </>
  )
} 