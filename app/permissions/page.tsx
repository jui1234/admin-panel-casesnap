'use client'

import { useState } from 'react'
import { UserCheck, Shield, Plus, Settings, Eye, Edit, Trash2, Users, Lock } from 'lucide-react'
import Layout from '@/components/Layout'
import { ROLES, PERMISSIONS, getPermissionsByCategory } from '@/utils/roles'

export default function PermissionsPage() {
  const [selectedRole, setSelectedRole] = useState('super-admin')
  const [showAddPermission, setShowAddPermission] = useState(false)

  const selectedRoleData = ROLES.find(role => role.id === selectedRole)
  const permissionsByCategory = getPermissionsByCategory()

  const getPermissionStatus = (permissionId: string) => {
    return selectedRoleData?.permissions.includes(permissionId) || false
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Permissions</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Manage user roles and access permissions</p>
          </div>
          <button className="flex items-center px-3 sm:px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-600 transition-colors duration-200 w-full sm:w-auto justify-center">
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-sm">Add Permission</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <UserCheck className="h-4 w-4 sm:h-5 sm:w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-2 sm:ml-3 lg:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Total Roles</p>
                <p className="text-base sm:text-lg lg:text-2xl font-semibold text-gray-900 dark:text-white">{ROLES.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Shield className="h-4 w-4 sm:h-5 sm:w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-2 sm:ml-3 lg:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Total Permissions</p>
                <p className="text-base sm:text-lg lg:text-2xl font-semibold text-gray-900 dark:text-white">{PERMISSIONS.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-2 sm:ml-3 lg:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Active Users</p>
                <p className="text-base sm:text-lg lg:text-2xl font-semibold text-gray-900 dark:text-white">21</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Settings className="h-4 w-4 sm:h-5 sm:w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-2 sm:ml-3 lg:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">System Status</p>
                <p className="text-base sm:text-lg lg:text-2xl font-semibold text-green-600 dark:text-green-400">Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
            <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
              Select Role to Manage
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-3 sm:p-4 border rounded-lg text-left transition-all duration-200 hover:scale-105 ${
                    selectedRole === role.id
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      role.id === 'super-admin' 
                        ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                        : role.id === 'admin'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                        : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                    }`}>
                      {role.name}
                    </span>
                    {selectedRole === role.id && (
                      <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{role.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {role.permissions.length} permissions
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions Management */}
        {selectedRoleData && (
          <div className="space-y-4 sm:space-y-6">
            {/* Role Header */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Permissions for {selectedRoleData.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {selectedRoleData.description}
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <button className="flex items-center px-3 sm:px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-600 transition-colors duration-200">
                      <Lock className="h-4 w-4 mr-2" />
                      <span className="text-sm">Save Changes</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions by Category */}
            <div className="space-y-4 sm:space-y-6">
              {permissionsByCategory.map((category) => (
                <div key={category.category} className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
                    <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
                      {category.category}
                    </h4>
                    <div className="space-y-3">
                      {category.permissions.map((permission) => {
                        const isEnabled = getPermissionStatus(permission.id)
                        return (
                          <div key={permission.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={isEnabled}
                                  onChange={() => {
                                    // Handle permission toggle
                                    console.log(`Toggle ${permission.id} for ${selectedRole}`)
                                  }}
                                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 dark:border-gray-600 rounded"
                                />
                                <div className="ml-3">
                                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                    {permission.name}
                                  </p>
                                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    {permission.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                isEnabled ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                              }`}>
                                {isEnabled ? 'Enabled' : 'Disabled'}
                              </span>
                              <div className="flex space-x-1">
                                <button className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                                  <Edit className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
            <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <button className="flex flex-col items-center p-3 sm:p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105">
                <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 mb-2" />
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-center">Create Role</span>
              </button>
              <button className="flex flex-col items-center p-3 sm:p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 mb-2" />
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-center">Manage Permissions</span>
              </button>
              <button className="flex flex-col items-center p-3 sm:p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 mb-2" />
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-center">Assign Roles</span>
              </button>
              <button className="flex flex-col items-center p-3 sm:p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105">
                <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 mb-2" />
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-center">Role Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 