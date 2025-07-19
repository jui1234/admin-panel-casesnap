'use client'

import { Settings, Save, User, Shield, Bell, Globe, Database, Key } from 'lucide-react'
import Layout from '@/components/Layout'

export default function SettingsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-tile-900">Settings</h1>
            <p className="text-tile-600">Manage your account and system preferences</p>
          </div>
          <button className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Settings */}
            <div className="bg-white shadow rounded-lg border border-tile-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center mb-4">
                  <User className="h-5 w-5 text-primary-500 mr-2" />
                  <h3 className="text-lg leading-6 font-medium text-tile-900">Account Settings</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-tile-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      defaultValue="Admin User"
                      className="w-full px-3 py-2 border border-tile-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-tile-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      defaultValue="admin@example.com"
                      className="w-full px-3 py-2 border border-tile-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-tile-700 mb-1">Job Title</label>
                    <input
                      type="text"
                      defaultValue="System Administrator"
                      className="w-full px-3 py-2 border border-tile-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white shadow rounded-lg border border-tile-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-5 w-5 text-primary-500 mr-2" />
                  <h3 className="text-lg leading-6 font-medium text-tile-900">Security Settings</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-tile-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      className="w-full px-3 py-2 border border-tile-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-tile-700 mb-1">New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 border border-tile-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-tile-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2 border border-tile-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      id="two-factor"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-tile-300 rounded"
                    />
                    <label htmlFor="two-factor" className="ml-2 block text-sm text-tile-700">
                      Enable two-factor authentication
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div className="bg-white shadow rounded-lg border border-tile-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center mb-4">
                  <Settings className="h-5 w-5 text-primary-500 mr-2" />
                  <h3 className="text-lg leading-6 font-medium text-tile-900">System Settings</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-tile-700 mb-1">Language</label>
                    <select className="w-full px-3 py-2 border border-tile-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-tile-700 mb-1">Time Zone</label>
                    <select className="w-full px-3 py-2 border border-tile-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
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
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-tile-300 rounded"
                    />
                    <label htmlFor="auto-save" className="ml-2 block text-sm text-tile-700">
                      Auto-save changes
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            {/* Notification Settings */}
            <div className="bg-white shadow rounded-lg border border-tile-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center mb-4">
                  <Bell className="h-5 w-5 text-primary-500 mr-2" />
                  <h3 className="text-lg leading-6 font-medium text-tile-900">Notifications</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-tile-700">Email Notifications</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-tile-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-tile-700">Push Notifications</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-tile-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-tile-700">Security Alerts</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-tile-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-tile-700">System Updates</span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-tile-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* API Settings */}
            <div className="bg-white shadow rounded-lg border border-tile-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center mb-4">
                  <Key className="h-5 w-5 text-primary-500 mr-2" />
                  <h3 className="text-lg leading-6 font-medium text-tile-900">API Settings</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-tile-700 mb-1">API Key</label>
                    <input
                      type="text"
                      defaultValue="sk-1234567890abcdef"
                      className="w-full px-3 py-2 border border-tile-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                  </div>
                  <button className="w-full flex items-center justify-center px-4 py-2 border border-tile-300 rounded-lg hover:bg-tile-50 transition-colors duration-200">
                    <Key className="h-4 w-4 mr-2 text-tile-400" />
                    Regenerate API Key
                  </button>
                </div>
              </div>
            </div>

            {/* Database Settings */}
            <div className="bg-white shadow rounded-lg border border-tile-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center mb-4">
                  <Database className="h-5 w-5 text-primary-500 mr-2" />
                  <h3 className="text-lg leading-6 font-medium text-tile-900">Database</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-tile-700">Auto Backup</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-tile-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-tile-700">Daily Backup</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-tile-300 rounded"
                    />
                  </div>
                  <button className="w-full flex items-center justify-center px-4 py-2 border border-tile-300 rounded-lg hover:bg-tile-50 transition-colors duration-200">
                    <Database className="h-4 w-4 mr-2 text-tile-400" />
                    Create Backup Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 