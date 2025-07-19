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
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-tile-900">Permissions</h1>
            <p className="text-tile-600">Manage user roles and access permissions</p>
          </div>
          <button className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 w-full sm:w-auto justify-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Permission
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-tile-200">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <UserCheck className="h-5 w-6 text-primary-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-sm font-medium text-tile-500">Total Roles</p>
                <p className="text-lg sm:text-2xl font-semibold text-tile-900">{ROLES.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-tile-200">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Shield className="h-5 w-6 text-primary-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-sm font-medium text-tile-500">Total Permissions</p>
                <p className="text-lg sm:text-2xl font-semibold text-tile-900">{PERMISSIONS.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-tile-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-sm font-medium text-tile-500">Active Users</p>
                <p className="text-lg sm:text-2xl font-semibold text-tile-900">21</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-tile-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Settings className="h-5 w-6 text-yellow-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-sm font-medium text-tile-500">System Status</p>
                <p className="text-lg sm:text-2xl font-semibold text-green-600">Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="bg-white shadow rounded-lg border border-tile-200">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-tile-900 mb-4">
              Select Role to Manage
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 border rounded-lg text-left transition-colors duration-200 ${
                    selectedRole === role.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-tile-200 hover:bg-tile-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${role.color}`}>
                      {role.name}
                    </span>
                    {selectedRole === role.id && (
                      <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-sm text-tile-600">{role.description}</p>
                  <p className="text-xs text-tile-500 mt-2">
                    {role.permissions.length} permissions
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions Management */}
        {selectedRoleData && (
          <div className="space-y-6">
            {/* Role Header */}
            <div className="bg-white shadow rounded-lg border border-tile-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-tile-900">
                      Permissions for {selectedRoleData.name}
                    </h3>
                    <p className="text-sm text-tile-600 mt-1">
                      {selectedRoleData.description}
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <button className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200">
                      <Lock className="h-4 w-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions by Category */}
            <div className="space-y-6">
              {permissionsByCategory.map((category) => (
                <div key={category.category} className="bg-white shadow rounded-lg border border-tile-200">
                  <div className="px-4 py-5 sm:p-6">
                    <h4 className="text-md font-medium text-tile-900 mb-4">
                      {category.category}
                    </h4>
                    <div className="space-y-3">
                      {category.permissions.map((permission) => {
                        const isEnabled = getPermissionStatus(permission.id)
                        return (
                          <div key={permission.id} className="flex items-center justify-between p-3 border border-tile-200 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={isEnabled}
                                  onChange={() => {
                                    // Handle permission toggle
                                    console.log(`Toggle ${permission.id} for ${selectedRole}`)
                                  }}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-tile-300 rounded"
                                />
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-tile-900">
                                    {permission.name}
                                  </p>
                                  <p className="text-sm text-tile-500">
                                    {permission.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                isEnabled ? 'bg-green-100 text-green-800' : 'bg-tile-100 text-tile-800'
                              }`}>
                                {isEnabled ? 'Enabled' : 'Disabled'}
                              </span>
                              <div className="flex space-x-1">
                                <button className="p-1 text-tile-400 hover:text-tile-600">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button className="p-1 text-tile-400 hover:text-tile-600">
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
        <div className="bg-white shadow rounded-lg border border-tile-200">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-tile-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-4 border border-tile-200 rounded-lg hover:bg-tile-50 transition-colors duration-200">
                <UserCheck className="h-8 w-8 text-primary-500 mb-2" />
                <span className="text-sm font-medium text-tile-900">Create Role</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-tile-200 rounded-lg hover:bg-tile-50 transition-colors duration-200">
                <Shield className="h-8 w-8 text-primary-500 mb-2" />
                <span className="text-sm font-medium text-tile-900">Manage Permissions</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-tile-200 rounded-lg hover:bg-tile-50 transition-colors duration-200">
                <Users className="h-8 w-8 text-primary-500 mb-2" />
                <span className="text-sm font-medium text-tile-900">Assign Roles</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-tile-200 rounded-lg hover:bg-tile-50 transition-colors duration-200">
                <Settings className="h-8 w-8 text-primary-500 mb-2" />
                <span className="text-sm font-medium text-tile-900">Role Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 