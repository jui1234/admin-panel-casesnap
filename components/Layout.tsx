'use client'

import { useState } from 'react'
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
  Building
} from 'lucide-react'
import ThemeProvider from './ThemeProvider'

interface LayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Client List', href: '/clients', icon: Building },
  { name: 'Employee List', href: '/employees', icon: UserPlus },
  { name: 'Permissions', href: '/permissions', icon: UserCheck },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    // Here you would typically clear auth state
    router.push('/auth/login')
  }

  const isActive = (href: string) => {
    return pathname === href
  }

  return (
    <ThemeProvider>
      <div className="h-screen flex overflow-hidden bg-tile-50">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-tile-900 bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-tile-200">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-primary-600 mr-3" />
            <h1 className="text-xl font-semibold text-tile-900">Admin Panel</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-tile-400 hover:text-tile-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 flex-1">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault()
                    router.push(item.href)
                    setSidebarOpen(false)
                  }}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                      : 'text-tile-600 hover:bg-tile-50 hover:text-tile-900'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${
                    isActive(item.href) ? 'text-primary-500' : 'text-tile-400 group-hover:text-tile-500'
                  }`} />
                  {item.name}
                </a>
              )
            })}
          </div>
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-tile-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-tile-600 hover:bg-tile-50 hover:text-tile-900 rounded-lg transition-colors duration-200"
          >
            <LogOut className="mr-3 h-5 w-5 text-tile-400" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-tile-200 z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-tile-400 hover:text-tile-600 hover:bg-tile-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              {/* Search bar */}
              <div className="ml-4 lg:ml-0 flex-1 max-w-lg">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-tile-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="block w-full pl-10 pr-3 py-2 border border-tile-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Right side header items */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-tile-400 hover:text-tile-600 hover:bg-tile-100 rounded-lg transition-colors duration-200 relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-primary-500 rounded-full"></span>
              </button>

              {/* User menu */}
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">A</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-tile-900">Admin User</p>
                  <p className="text-xs text-tile-500">admin@example.com</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-tile-50">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
    </ThemeProvider>
  )
} 