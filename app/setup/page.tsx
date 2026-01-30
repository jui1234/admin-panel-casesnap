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
  EyeOff,
  Info
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import ThemeToggle from '@/components/ThemeToggle'
import { useSetupOrganizationMutation, useLoginMutation } from '@/redux/api/authApi'
import toast from 'react-hot-toast'
import * as yup from 'yup'

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

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  period: 'monthly' | 'yearly'
  features: string[]
  popular?: boolean
}

// Yup validation schemas
const organizationSchema = yup.object().shape({
  companyName: yup.string().required('Company name is required').min(2, 'Company name must be at least 2 characters'),
  companyEmail: yup.string().email('Please enter a valid email address').required('Company email is required'),
  companyPhone: yup.string().required('Company phone is required').matches(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  streetAddress: yup.string().required('Street address is required').min(5, 'Address must be at least 5 characters'),
  city: yup.string().required('City is required').min(2, 'City must be at least 2 characters'),
  province: yup.string().required('Province/State is required'),
  postalCode: yup.string().required('Postal code is required').min(3, 'Postal code must be at least 3 characters'),
  country: yup.string().required('Country is required'),
  companyWebsite: yup.string().url('Please enter a valid website URL').optional(),
  industry: yup.string().required('Industry is required'),
  practiceAreas: yup.array().of(yup.string()).min(1, 'Please select at least one practice area').required('Practice areas are required')
})

const superAdminSchema = yup.object().shape({
  firstName: yup.string().required('First name is required').min(2, 'First name must be at least 2 characters'),
  lastName: yup.string().required('Last name is required').min(2, 'Last name must be at least 2 characters'),
  email: yup.string().email('Please enter a valid email address').required('Email is required'),
  phone: yup.string().required('Phone number is required').matches(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string().required('Please confirm your password').oneOf([yup.ref('password')], 'Passwords must match')
})

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isPracticeAreasOpen, setIsPracticeAreasOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // RTK Query mutations
  const [setupOrganization, { isLoading, error: setupError }] = useSetupOrganizationMutation()
  const [loginMutation] = useLoginMutation()

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

  const validateOrganizationData = async () => {
    try {
      await organizationSchema.validate(organizationData, { abortEarly: false })
      return true
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const firstError = error.errors[0]
        setError(firstError)
        toast.error(firstError)
      return false
    }
        return false
      }
    }

  const validateSuperAdminData = async () => {
    try {
      await superAdminSchema.validate(superAdminData, { abortEarly: false })
      return true
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const firstError = error.errors[0]
        setError(firstError)
        toast.error(firstError)
      return false
    }
      return false
    }
  }

  const handleNext = async () => {
    setError('')
    if (currentStep === 1) {
      const isValid = await validateOrganizationData()
      if (isValid) {
        setCurrentStep(2)
        toast.success('Organization details validated successfully!')
      }
    } else if (currentStep === 2) {
      const isValid = await validateSuperAdminData()
      if (isValid) {
        setCurrentStep(3)
        toast.success('Super admin details validated successfully!')
      }
    }
  }

  const handlePrevious = () => {
    setError('')
    if (currentStep === 2) {
      setCurrentStep(1)
    } else if (currentStep === 3) {
      setCurrentStep(2)
    }
  }

  const fillTestData = () => {
    setOrganizationData({
      companyName: 'CaseSnap Legal Inc.',
      companyEmail: 'contact@casesnap.com',
      companyPhone: '9876543210',
      streetAddress: '101 Legal Avenue',
      city: 'Mumbai',
      province: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
      companyWebsite: 'https://www.casesnap.com',
      industry: 'Legal Services',
      practiceAreas: ['Civil Law', 'Corporate Law']
    })

    setSuperAdminData({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@casesnap.com',
      phone: '9988776655',
      password: 'StrongPassword123',
      confirmPassword: 'StrongPassword123'
    })
    
    toast.success('✅ Test data filled successfully!')
  }

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    
    // Only submit on step 3 (subscription plan step)
    if (currentStep !== 3) {
      handleNext()
      return
    }
    
    const isValid = await validateSuperAdminData()
    if (!isValid) return
    
    if (!selectedPlan) {
      setError('Please select a subscription plan')
      toast.error('Please select a subscription plan')
      return
    }

    const loadingToast = toast.loading('Setting up your organization...')
    
    try {
      // Map plan ID to API value
      const planMapping: Record<string, string> = {
        'free-trial': 'free',
        'basic': 'base',
        'professional': 'popular'
      }
      const subscriptionPlanValue = planMapping[selectedPlan] || 'free'

      // Prepare the API payload
      const payload = {
        organization: {
          companyName: organizationData.companyName,
          companyEmail: organizationData.companyEmail,
          companyPhone: organizationData.companyPhone,
          streetAddress: organizationData.streetAddress,
          city: organizationData.city,
          province: organizationData.province,
          postalCode: organizationData.postalCode,
          country: organizationData.country,
          companyWebsite: organizationData.companyWebsite,
          industry: organizationData.industry,
          practiceAreas: organizationData.practiceAreas,
          subscriptionPlan: subscriptionPlanValue
        },
        superAdmin: {
          firstName: superAdminData.firstName,
          lastName: superAdminData.lastName,
          email: superAdminData.email,
          phone: superAdminData.phone,
          password: superAdminData.password,
          confirmPassword: superAdminData.confirmPassword
        }
      }

      console.log('Sending setup request to API:', payload)

      // Call the API using RTK Query
      const result = await setupOrganization(payload).unwrap()
      console.log('Setup successful:', result)

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success('🎉 Organization and super admin account created successfully!')

      setSuccess('Organization and super admin account created successfully!')

      // Store organization data locally
      try {
        localStorage.setItem('organizationData', JSON.stringify(organizationData))
      } catch (error) {
        console.log('localStorage not available, continuing without storing')
      }

      // Now call login API with the same email and password
      try {
        toast.loading('Logging you in...', { id: 'login-toast' })
        
        const loginResult = await loginMutation({
          email: superAdminData.email,
          password: superAdminData.password
        }).unwrap()

        if (loginResult.success) {
          // Store token from login response
          localStorage.setItem('authToken', loginResult.token)
          localStorage.setItem('token', loginResult.token)

          // Store user data from login response
          const userName = loginResult.user.name || 
            (loginResult.user.firstName && loginResult.user.lastName 
              ? `${loginResult.user.firstName} ${loginResult.user.lastName}`.trim()
              : loginResult.user.firstName || loginResult.user.lastName || loginResult.user.email.split('@')[0])
          
          const userData = {
            id: loginResult.user.id,
            email: loginResult.user.email,
            name: userName,
            firstName: loginResult.user.firstName,
            lastName: loginResult.user.lastName,
            role: loginResult.user.role, // Can be string or Role object
            subscriptionPlan: (loginResult.user as { subscriptionPlan?: string }).subscriptionPlan,
            assigneePermissions: (loginResult.user as { assigneePermissions?: { canAssignClient?: boolean; canAssignCase?: boolean } }).assigneePermissions,
            organizationId: loginResult.user.organizationId || loginResult.user.organization?._id,
            organizationName: loginResult.user.organization?.companyName
          }
          localStorage.setItem('userData', JSON.stringify(userData))

          // Store organization data from login response if available
          if (loginResult.user?.organization) {
            localStorage.setItem('organizationData', JSON.stringify(loginResult.user.organization))
          }

          // Update AuthContext by calling login function
          const loginSuccess = await login(superAdminData.email, superAdminData.password)

          toast.dismiss('login-toast')
          toast.success('🚀 Setup completed! Redirecting to dashboard...')
          setSuccess('Setup completed successfully! Redirecting to dashboard...')
          
          setTimeout(() => {
            router.push('/dashboard')
          }, 1000)
        } else {
          toast.dismiss('login-toast')
          toast.error('Account created but login failed. Please try logging in manually.')
          setError('Account created successfully, but login failed. Please try logging in manually.')
        }
      } catch (loginError: any) {
        toast.dismiss('login-toast')
        const errorMessage = loginError?.data?.error || loginError?.message || 'Login failed. Please try logging in manually.'
        toast.error(errorMessage)
        setError('Account created successfully, but login failed. Please try logging in manually.')
      }
    } catch (err: any) {
      console.error('Setup error:', err)
      
      // Dismiss loading toast
      toast.dismiss(loadingToast)
      
      let errorMessage = 'Setup failed. Please try again.'
      
      if (err?.data?.error) {
        errorMessage = err.data.error
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      // Check if the error is about email already being registered
      if (errorMessage.includes('This email address is already registered as an admin user') || 
          errorMessage.includes('email address is already registered') ||
          errorMessage.includes('already registered')) {
        // Show specific message and redirect to login with pre-filled email
        toast.error('This email is already registered. Redirecting to login...')
        setError('This email address is already registered. Redirecting to login page...')
        
        // Redirect to login page with the email pre-filled
        setTimeout(() => {
          const encodedEmail = encodeURIComponent(superAdminData.email)
          router.push(`/auth/login?email=${encodedEmail}&message=email_already_registered`)
        }, 2000)
        return
      }
      
      setError(errorMessage)
      toast.error(`❌ ${errorMessage}`)
    }
  }

  const steps = [
    { number: 1, title: 'Organization Details', icon: Building2 },
    { number: 2, title: 'Super Admin Setup', icon: User },
    { number: 3, title: 'Subscription Plan', icon: Shield }
  ]

  // Subscription plans
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'free-trial',
      name: '14 Days Free Trial',
      price: 0,
      period: 'monthly',
      features: [
        '14 days full access',
        'All features unlocked',
        'Unlimited employees',
        'Unlimited clients',
        'Full case management suite',
        'Advanced reporting & analytics',
        'Priority support',
        'Unlimited storage',
        'No credit card required'
      ]
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 999,
      period: 'monthly',
      features: [
        'Up to 10 employees',
        'Up to 100 clients',
        'Basic case management',
        'Standard reporting',
        'Email support',
        '10GB storage',
        'Basic document management',
        'Mobile app access'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 2499,
      period: 'monthly',
      popular: true,
      features: [
        'Unlimited employees',
        'Unlimited clients',
        'Advanced case management',
        'Advanced analytics & reporting',
        'Priority 24/7 support',
        'Unlimited storage',
        'Advanced document management',
        'Mobile app access',
        'API access & integrations',
        'Custom workflows',
        'Advanced security features',
        'Dedicated account manager'
      ]
    }
  ]

  const [selectedPlan, setSelectedPlan] = useState<string>('basic')

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
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-4 mb-4">
            Let's set up your organization and create your super admin account
          </p>
          
          {/* Test Data Button */}
          <button
            onClick={fillTestData}
            className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
          >
            Fill with test data
          </button>
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

          {success && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">{success}</p>
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

              {/* Highlighted Note */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 dark:border-yellow-400 p-4 rounded-r-lg mb-4 sm:mb-6">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                      Important Note
                    </p>
                    <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-400">
                      The person creating this organization will automatically become the <strong>Super Admin</strong> with full system access and administrative privileges.
                    </p>
                  </div>
                </div>
              </div>

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
                  onClick={handleNext}
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105 hover:shadow-lg cursor-pointer text-sm sm:text-base"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 sm:space-y-5">
              {/* Free Trial Banner - At Top */}
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-yellow-600 dark:to-yellow-500 rounded-lg p-3 sm:p-4 border border-yellow-300 dark:border-yellow-400">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 dark:text-gray-900" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-900">
                        14 Days Free Trial
                      </p>
                      <p className="text-xs text-gray-800 dark:text-gray-800">
                        Full access. No credit card required.
                      </p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg border-2 border-gray-900 dark:border-white">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      FREE
                    </span>
                  </div>
                </div>
              </div>

              {/* Header Section */}
              <div className="text-center">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Choose Your Subscription Plan
                </h3>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 max-w-6xl mx-auto">
                {subscriptionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative cursor-pointer rounded-xl border-2 transition-all duration-300 ${
                      selectedPlan === plan.id
                        ? plan.id === 'free-trial'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg ring-2 ring-green-200 dark:ring-green-800'
                          : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shadow-lg ring-2 ring-yellow-200 dark:ring-yellow-800'
                        : plan.popular
                        ? 'border-l-4 border-l-orange-500 border-r-2 border-t-2 border-b-2 border-r-gray-200 border-t-gray-200 border-b-gray-200 dark:border-r-gray-700 dark:border-t-gray-700 dark:border-b-gray-700 bg-white dark:bg-gray-800 hover:shadow-md'
                        : plan.id === 'free-trial'
                        ? 'border-green-400 dark:border-green-600 bg-white dark:bg-gray-800 hover:border-green-500 dark:hover:border-green-500 hover:shadow-md'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-yellow-400 dark:hover:border-yellow-500 hover:shadow-md'
                    }`}
                  >
                    <div className="p-4 sm:p-5">
                      {/* Plan Header */}
                      <div className="text-center mb-3">
                        <h4 className={`text-base sm:text-lg font-bold mb-2 ${
                          selectedPlan === plan.id
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-800 dark:text-gray-200'
                        }`}>
                          {plan.name}
                        </h4>
                        {plan.price === 0 ? (
                          <div className="mb-1">
                            <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                              Free
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              14 days trial period
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-baseline justify-center mb-1">
                              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mr-1">₹</span>
                              <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                {plan.price.toLocaleString()}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-1">/mo</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              After 14-day free trial
                            </p>
                          </>
                        )}
                      </div>

                      {/* Features List */}
                      <div className="mb-3">
                        <ul className="space-y-1.5">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <Check className={`w-3.5 h-3.5 mt-0.5 mr-2 flex-shrink-0 ${
                                selectedPlan === plan.id
                                  ? plan.id === 'free-trial'
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-yellow-600 dark:text-yellow-400'
                                  : 'text-gray-400 dark:text-gray-500'
                              }`} />
                              <span className={`text-xs leading-snug ${
                                selectedPlan === plan.id
                                  ? 'text-gray-700 dark:text-gray-300'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPlan(plan.id)
                        }}
                        className={`w-full py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                          selectedPlan === plan.id
                            ? plan.id === 'free-trial'
                              ? 'bg-green-500 text-white shadow-md'
                              : 'bg-yellow-500 text-gray-900 shadow-md'
                            : plan.popular
                            ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-600'
                            : plan.id === 'free-trial'
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                      </button>
                    </div>
                  </div>
                ))}
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
