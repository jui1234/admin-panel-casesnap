'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Check,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import ThemeToggle from '@/components/ThemeToggle'

interface OrganizationData {
  companyName: string
  companyEmail: string
  companyPhone: string
  streetAddress: string
  city: string
  province: string
  postalCode: string
  country: string
  companyWebsite: string
  industry: string
  practiceAreas: string[]
}

interface SuperAdminData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isPracticeAreasOpen, setIsPracticeAreasOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [organizationData, setOrganizationData] = useState<OrganizationData>({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    streetAddress: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'India',
    companyWebsite: '',
    industry: '',
    practiceAreas: []
  })

  const [superAdminData, setSuperAdminData] = useState<SuperAdminData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const router = useRouter()
  const { theme } = useTheme()
  const { login } = useAuth()
  const isDark = theme === 'dark'

  const handleOrganizationChange = (field: keyof OrganizationData, value: string | string[]) => {
    setOrganizationData(prev => ({ ...prev, [field]: value }))
  }

  const handlePhoneChange = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '')
    // Remove leading zeros
    const noLeadingZeros = digitsOnly.replace(/^0+/, '')
    // Limit to 10 digits
    const limitedDigits = noLeadingZeros.slice(0, 10)
    setOrganizationData(prev => ({ ...prev, companyPhone: limitedDigits }))
  }

  const handleSuperAdminPhoneChange = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '')
    // Remove leading zeros
    const noLeadingZeros = digitsOnly.replace(/^0+/, '')
    // Limit to 10 digits
    const limitedDigits = noLeadingZeros.slice(0, 10)
    setSuperAdminData(prev => ({ ...prev, phone: limitedDigits }))
  }

  const handlePracticeAreaToggle = (area: string) => {
    setOrganizationData(prev => ({
      ...prev,
      practiceAreas: prev.practiceAreas.includes(area)
        ? prev.practiceAreas.filter(a => a !== area)
        : [...prev.practiceAreas, area]
    }))
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPracticeAreasOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])


  const handleSuperAdminChange = (field: keyof SuperAdminData, value: string) => {
    setSuperAdminData(prev => ({ ...prev, [field]: value }))
  }

  const validateOrganizationData = () => {
    const required = ['companyName', 'companyEmail', 'companyPhone', 'streetAddress', 'city', 'province', 'postalCode', 'industry']
    for (const field of required) {
      if (!organizationData[field as keyof OrganizationData]) {
        setError(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
        return false
      }
    }
    if (!organizationData.companyEmail.includes('@')) {
      setError('Please enter a valid company email address')
      return false
    }
    if (organizationData.companyPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      return false
    }
    if (organizationData.practiceAreas.length === 0) {
      setError('Please select at least one practice area')
      return false
    }
    return true
  }

  const validateSuperAdminData = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword']
    for (const field of required) {
      if (!superAdminData[field as keyof SuperAdminData]) {
        setError(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
        return false
      }
    }
    if (!superAdminData.email.includes('@')) {
      setError('Please enter a valid email address')
      return false
    }
    if (superAdminData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    if (superAdminData.password !== superAdminData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const handleNext = () => {
    setError('')
    if (currentStep === 1 && validateOrganizationData()) {
      setCurrentStep(2)
    }
  }

  const handlePrevious = () => {
    setError('')
    setCurrentStep(1)
  }

  const handleSubmit = async () => {
    setError('')
    if (!validateSuperAdminData()) return

    setIsLoading(true)
    try {
      // Simulate API call to create organization and super admin
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Store organization data
      localStorage.setItem('organizationData', JSON.stringify(organizationData))

      // Create super admin account and login
      const success = await login(superAdminData.email, superAdminData.password)

      if (success) {
        router.push('/dashboard')
      } else {
        setError('Failed to create account. Please try again.')
      }
    } catch (err) {
      setError('Setup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    { number: 1, title: 'Organization Details', icon: Building2 },
    { number: 2, title: 'Super Admin Setup', icon: User }
  ]

  const practiceAreas = [
    'Criminal Law',
    'Civil Law',
    'Corporate Law',
    'Family Law',
    'Property Law',
    'Tax Law',
    'Labour Law',
    'Constitutional Law',
    'Intellectual Property',
    'Banking & Finance',
    'Real Estate',
    'Immigration Law',
    'Medical Malpractice',
    'Environmental Law',
    'International Law'
  ]

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
    'Ladakh', 'Chandigarh', 'Puducherry', 'Andaman and Nicobar Islands',
    'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep'
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-white to-yellow-50'} flex items-center justify-center p-2 sm:p-4`}>
      {/* Theme Toggle */}
      <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="max-w-2xl w-full space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="text-center px-2">
          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-yellow-500 dark:to-yellow-600 rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 dark:text-gray-900" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to CaseSnap
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-4">
            Let's set up your organization and create your super admin account
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-2 sm:space-x-4 lg:space-x-8 px-2">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-colors duration-300 ${currentStep >= step.number
                  ? 'bg-yellow-500 border-yellow-500 text-gray-900'
                  : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                }`}>
                {currentStep > step.number ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </div>
              <div className="ml-2 sm:ml-3">
                <p className={`text-xs sm:text-sm font-medium ${currentStep >= step.number
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-400 dark:text-gray-500'
                  }`}>
                  <span className="hidden sm:inline">{step.title}</span>
                  <span className="sm:hidden">Step {step.number}</span>
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-4 sm:w-6 lg:w-8 h-0.5 mx-2 sm:mx-4 ${currentStep > step.number
                    ? 'bg-yellow-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-200 dark:border-gray-700 mx-2 sm:mx-0">
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Organization Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      value={organizationData.companyName}
                      onChange={(e) => handleOrganizationChange('companyName', e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your company name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="email"
                      value={organizationData.companyEmail}
                      onChange={(e) => handleOrganizationChange('companyEmail', e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="company@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Phone * (10 digits)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={organizationData.companyPhone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>
                  {organizationData.companyPhone && organizationData.companyPhone.length < 10 && (
                    <p className="text-xs text-red-500 mt-1">
                      {10 - organizationData.companyPhone.length} more digits required
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Street Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <textarea
                      value={organizationData.streetAddress}
                      onChange={(e) => handleOrganizationChange('streetAddress', e.target.value)}
                      rows={3}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your street address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={organizationData.city}
                    onChange={(e) => handleOrganizationChange('city', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Province/State *
                  </label>
                  <div className="relative">
                    <select
                      value={organizationData.province}
                      onChange={(e) => handleOrganizationChange('province', e.target.value)}
                      className="w-full px-3 sm:px-4 py-3 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer pr-10 min-h-[48px]"
                      style={{
                        fontSize: '16px', // Prevents zoom on iOS
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none'
                      }}
                    >
                      <option value="" style={{ fontSize: '16px', padding: '8px' }}>Select State/Province</option>
                      {indianStates.map((state) => (
                        <option key={state} value={state} style={{ fontSize: '16px', padding: '8px' }}>{state}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    value={organizationData.postalCode}
                    onChange={(e) => handleOrganizationChange('postalCode', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter postal code"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={organizationData.country}
                    onChange={(e) => handleOrganizationChange('country', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter country"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={organizationData.companyWebsite}
                    onChange={(e) => handleOrganizationChange('companyWebsite', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://www.example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Industry *
                  </label>
                  <div className="relative">
                    <select
                      value={organizationData.industry}
                      onChange={(e) => handleOrganizationChange('industry', e.target.value)}
                      className="w-full px-3 sm:px-4 py-3 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer pr-10 min-h-[48px]"
                      style={{
                        fontSize: '16px', // Prevents zoom on iOS
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none'
                      }}
                    >
                      <option value="" style={{ fontSize: '16px', padding: '8px' }}>Select Industry</option>
                      <option value="Legal Services" style={{ fontSize: '16px', padding: '8px' }}>Legal Services</option>
                      <option value="Law Firm" style={{ fontSize: '16px', padding: '8px' }}>Law Firm</option>
                      <option value="Corporate Legal" style={{ fontSize: '16px', padding: '8px' }}>Corporate Legal</option>
                      <option value="Government Legal" style={{ fontSize: '16px', padding: '8px' }}>Government Legal</option>
                      <option value="Other" style={{ fontSize: '16px', padding: '8px' }}>Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Practice Areas * (Select all that apply)
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    {/* Custom Multi-Select Button */}
                    <button
                      type="button"
                      onClick={() => setIsPracticeAreasOpen(!isPracticeAreasOpen)}
                      className="w-full px-3 sm:px-4 py-3 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer pr-10 min-h-[48px] text-left"
                    >
                      {organizationData.practiceAreas.length === 0 
                        ? 'Select Practice Areas' 
                        : `${organizationData.practiceAreas.length} area(s) selected`
                      }
                    </button>
                    
                    {/* Dropdown Arrow */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg 
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isPracticeAreasOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Dropdown Options */}
                    {isPracticeAreasOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {practiceAreas.map((area) => (
                          <label
                            key={area}
                            className="flex items-center px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={organizationData.practiceAreas.includes(area)}
                              onChange={() => handlePracticeAreaToggle(area)}
                              className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 dark:focus:ring-yellow-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                            />
                            <span className="ml-3 text-sm text-gray-900 dark:text-white">{area}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {organizationData.practiceAreas.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {organizationData.practiceAreas.length} practice area(s) selected
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {organizationData.practiceAreas.map((area) => (
                          <span
                            key={area}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                          >
                            {area}
                            <button
                              type="button"
                              onClick={() => handlePracticeAreaToggle(area)}
                              className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800"
                            >
                              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 sm:pt-6">
                <button
                  onClick={handleNext}
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 hover:scale-105 hover:shadow-lg cursor-pointer text-sm sm:text-base"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Super Admin Account
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      value={superAdminData.firstName}
                      onChange={(e) => handleSuperAdminChange('firstName', e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter first name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      value={superAdminData.lastName}
                      onChange={(e) => handleSuperAdminChange('lastName', e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="email"
                      value={superAdminData.email}
                      onChange={(e) => handleSuperAdminChange('email', e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number * (10 digits)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={superAdminData.phone}
                      onChange={(e) => handleSuperAdminPhoneChange(e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>
                  {superAdminData.phone && superAdminData.phone.length < 10 && (
                    <p className="text-xs text-red-500 mt-1">
                      {10 - superAdminData.phone.length} more digits required
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={superAdminData.password}
                      onChange={(e) => handleSuperAdminChange('password', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter password (min 6 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={superAdminData.confirmPassword}
                      onChange={(e) => handleSuperAdminChange('confirmPassword', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-4 sm:pt-6">
                <button
                  onClick={handlePrevious}
                  className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105 hover:shadow-lg cursor-pointer text-sm sm:text-base"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-gray-900 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105 hover:shadow-lg cursor-pointer disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      <span>Setting up...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Setup</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
