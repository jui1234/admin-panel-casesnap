'use client'

import { useEffect, useMemo, useState } from 'react'
import { Settings, Save, User, Shield, Bell, Globe, Database, Key, Check, ArrowUp } from 'lucide-react'
import Head from 'next/head'
import { useAuth } from '@/contexts/AuthContext'
import { useChangePasswordMutation } from '@/redux/api/authApi'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user } = useAuth()
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [legalTitle, setLegalTitle] = useState('')

  const [language, setLanguage] = useState('English')
  const [timeZone, setTimeZone] = useState('IST (Indian Standard Time)')
  const [autoSave, setAutoSave] = useState(true)
  const [twoFactor, setTwoFactor] = useState(false)

  const profile = useMemo(() => {
    const fromCtx = user
    const src = fromCtx as any
    const name =
      (src?.name as string | undefined) ||
      [src?.firstName, src?.lastName].filter(Boolean).join(' ').trim() ||
      '—'
    const mail = (src?.email as string | undefined) || '—'
    const plan = (src?.subscriptionPlan as string | undefined) || fromCtx?.subscriptionPlan || 'free'
    return { name, mail, plan }
  }, [user])

  useEffect(() => {
    setFullName(profile.name === '—' ? '' : profile.name)
    setEmail(profile.mail === '—' ? '' : profile.mail)
    try {
      const stored = localStorage.getItem('settings:legalTitle')
      if (stored) setLegalTitle(stored)
      const pref = localStorage.getItem('settings:prefs')
      if (pref) {
        const p = JSON.parse(pref) as { language?: string; timeZone?: string; autoSave?: boolean; twoFactor?: boolean }
        if (p.language) setLanguage(p.language)
        if (p.timeZone) setTimeZone(p.timeZone)
        if (typeof p.autoSave === 'boolean') setAutoSave(p.autoSave)
        if (typeof p.twoFactor === 'boolean') setTwoFactor(p.twoFactor)
      }
    } catch {
      // ignore
    }
    // only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Map subscription plan values to display names
  const getPlanDisplayName = (plan?: string): string => {
    switch (plan) {
      case 'free':
        return '14 Days Free Trial'
      case 'base':
        return 'Basic'
      case 'popular':
        return 'Professional'
      default:
        return 'Free Trial'
    }
  }

  // Get plan pricing
  const getPlanPrice = (plan?: string): string => {
    switch (plan) {
      case 'free':
        return 'Free'
      case 'base':
        return '₹999/month'
      case 'popular':
        return '₹2,499/month'
      default:
        return 'Free'
    }
  }

  const currentPlan = profile.plan || 'free'
  const planDisplayName = getPlanDisplayName(currentPlan)
  const planPrice = getPlanPrice(currentPlan)
  const isFreeTrial = currentPlan === 'free'

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all password fields.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password must match.')
      return
    }

    try {
      const result = await changePassword({ currentPassword, newPassword, confirmPassword }).unwrap()
      toast.success(result?.message || 'Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      const errorMessage = err?.data?.error || err?.data?.message || 'Failed to change password.'
      toast.error(errorMessage)
    }
  }

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('settings:legalTitle', legalTitle)
      localStorage.setItem(
        'settings:prefs',
        JSON.stringify({
          language,
          timeZone,
          autoSave,
          twoFactor,
        })
      )
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    }
  }

  return (
    <>
      <Head>
        <title>Legal Practice Management Settings - CaseSnap Lawyer Case Management Software</title>
        <meta name="description" content="Configure your law firm management software settings. Secure advocate admin panel with case tracking, document management, and legal billing software for lawyers in India." />
        <meta name="keywords" content="legal practice management settings, law firm management software configuration, advocate admin panel settings, case tracking software settings, legal billing software configuration" />
        <link rel="canonical" href="https://casesnap.com/settings" />
      </Head>
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Legal Practice Management Settings</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Configure your law firm management software settings and advocate admin panel preferences for optimal legal case tracking</p>
          </div>
          <div className="flex w-full sm:w-auto gap-2">
            <button
              type="button"
              onClick={handleSaveSettings}
              className="flex items-center px-3 sm:px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-600 transition-colors duration-200 w-full sm:w-auto justify-center"
            >
            <Save className="h-4 w-4 mr-2" />
            <span className="text-sm">Save Changes</span>
            </button>
          </div>
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
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Legal Practice Title</label>
                    <input
                      type="text"
                      value={legalTitle}
                      onChange={(e) => setLegalTitle(e.target.value)}
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
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                      className="w-full sm:w-auto px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-600 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isChangingPassword ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="two-factor"
                      type="checkbox"
                      checked={twoFactor}
                      onChange={(e) => setTwoFactor(e.target.checked)}
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
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                    >
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
                    <select
                      value={timeZone}
                      onChange={(e) => setTimeZone(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                    >
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
                      checked={autoSave}
                      onChange={(e) => setAutoSave(e.target.checked)}
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

            {/* Subscription Plan */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-3 sm:px-4 py-4 sm:py-5 lg:p-6">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 mr-2" />
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 dark:text-white">Subscription Plan</h3>
                </div>
                <div className="space-y-4">
                  {/* Free Trial Banner - Only show if on free trial */}
                  {isFreeTrial && (
                    <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 dark:from-yellow-600 dark:via-yellow-500 dark:to-yellow-600 rounded-lg p-4 border-2 border-yellow-300 dark:border-yellow-400">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                            🎉 14 Days Free Trial Active
                          </p>
                          <p className="text-xs text-gray-800 dark:text-gray-200">
                            Your trial period ends on Jan 28, 2025
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-900 px-3 py-1 rounded-lg border-2 border-gray-900 dark:border-white">
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            Free Trial
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Current Plan</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        isFreeTrial 
                          ? 'bg-green-500 text-white' 
                          : currentPlan === 'popular'
                          ? 'bg-yellow-500 text-gray-900'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {planDisplayName}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      {isFreeTrial 
                        ? 'Full access for 14 days. No credit card required.'
                        : `${planPrice} - ${currentPlan === 'popular' ? 'All features included' : 'Limited features'}`
                      }
                    </p>
                    <button className="w-full flex items-center justify-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-medium transition-colors duration-200 text-sm shadow-md hover:shadow-lg">
                      <ArrowUp className="h-4 w-4 mr-2" />
                      {isFreeTrial ? 'Choose Plan' : 'Change Plan'}
                    </button>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {isFreeTrial 
                        ? 'Switch between Basic (₹999/mo) and Professional (₹2,499/mo) plans anytime. Basic plan has limited features while Professional includes all features.'
                        : currentPlan === 'base'
                        ? 'Upgrade to Professional (₹2,499/mo) to unlock all features including unlimited employees, clients, storage, and advanced analytics.'
                        : 'Switch to Basic (₹999/mo) for limited features or stay on Professional for full access to all features.'
                      }
                    </p>
                    <button className="w-full flex items-center justify-center px-4 py-2 border-2 border-yellow-500 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg font-medium transition-colors duration-200 text-sm">
                      View All Plans
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 