'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Building2,
  UserCheck,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react'
import { 
  Box, 
  Button, 
  TextField, 
  InputAdornment, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Card, 
  CardContent, 
  Typography,
  Grid,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/ThemeToggle'
import { useRegisterEmployeeMutation, RegisterEmployeeRequest, RegisterEmployeeRequestWithToken } from '@/redux/api/employeesApi'
import toast from 'react-hot-toast'

interface EmployeeRegistrationData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: string
  aadharCard: string
  employeeType: string
  advocateLicense: string
  internYear: string
  age: string
  department: string
  position: string
  salary: string
  startDate: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelation: string
  password: string
  confirmPassword: string
}

interface URLParams {
  token: string
  employeeName: string
  organizationName: string
  adminName: string
  employeeEmail: string
  salary: string
}

export default function EmployeeRegisterPage() {
  const [formData, setFormData] = useState<EmployeeRegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    aadharCard: '',
    employeeType: '',
    advocateLicense: '',
    internYear: '',
    age: '',
    department: '',
    position: '',
    salary: '',
    startDate: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    password: '',
    confirmPassword: ''
  })
  
  const [errors, setErrors] = useState<Partial<EmployeeRegistrationData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [urlParams, setUrlParams] = useState<URLParams | null>(null)
  const [registerEmployee, { isLoading: isRegisterLoading }] = useRegisterEmployeeMutation()
  const [registrationError, setRegistrationError] = useState<string>('')
  const [isAccountActive, setIsAccountActive] = useState(false)

  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const isDark = theme === 'dark' 

  // Extract URL parameters on component mount
  useEffect(() => {
    const token = searchParams.get('token')
    const employeeName = searchParams.get('employeeName')
    const organizationName = searchParams.get('organizationName')
    const adminName = searchParams.get('adminName')
    const employeeEmail = searchParams.get('employeeEmail')
    const salary = searchParams.get('salary')

    if (token && employeeName && organizationName && adminName && employeeEmail) {
      setUrlParams({
        token,
        employeeName: decodeURIComponent(employeeName),
        organizationName: decodeURIComponent(organizationName),
        adminName: decodeURIComponent(adminName),
        employeeEmail: decodeURIComponent(employeeEmail),
        salary: salary ? decodeURIComponent(salary) : ''
      })

      // Pre-fill form data from URL parameters
      const nameParts = decodeURIComponent(employeeName).split(' ')
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: decodeURIComponent(employeeEmail),
        salary: salary ? decodeURIComponent(salary) : ''
      }))
    }
  }, [searchParams])

  // Calculate age when date of birth changes
  useEffect(() => {
    if (formData.dateOfBirth) {
      const age = calculateAge(formData.dateOfBirth)
      setFormData(prev => ({ ...prev, age: age.toString() }))
    }
  }, [formData.dateOfBirth])

  const handleInputChange = (field: keyof EmployeeRegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handlePhoneChange = (value: string) => {
    // Remove all non-digit characters and limit to 10 digits
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10)
    handleInputChange('phone', digitsOnly)
  }

  const handleEmergencyPhoneChange = (value: string) => {
    // Remove all non-digit characters and limit to 10 digits
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10)
    handleInputChange('emergencyContactPhone', digitsOnly)
  }

  const handleAadharChange = (value: string) => {
    // Remove all non-digit characters and limit to 12 digits
    const digitsOnly = value.replace(/\D/g, '').slice(0, 12)
    
    // Format with spaces: 1234 5678 8901
    let formattedValue = digitsOnly
    if (digitsOnly.length > 4) {
      formattedValue = digitsOnly.slice(0, 4) + ' ' + digitsOnly.slice(4, 8) + ' ' + digitsOnly.slice(8)
    } else if (digitsOnly.length > 8) {
      formattedValue = digitsOnly.slice(0, 4) + ' ' + digitsOnly.slice(4, 8) + ' ' + digitsOnly.slice(8)
    }
    
    handleInputChange('aadharCard', formattedValue)
  }

  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const validateAdvocateLicense = (license: string): boolean => {
    // Format: name-MAH/XXXX/YYYY
    const pattern = /^[a-zA-Z\s]+-MAH\/\d{4}\/\d{4}$/
    if (!pattern.test(license)) return false
    
    const parts = license.split('/')
    const year = parseInt(parts[2])
    const currentYear = new Date().getFullYear()
    
    return year <= currentYear
  }

  const handleAdvocateLicenseChange = (value: string) => {
    // Auto-format the license number
    let formattedValue = value
    
    // Convert 'mah' to 'MAH' (case insensitive)
    if (formattedValue.toLowerCase().startsWith('mah')) {
      formattedValue = 'MAH' + formattedValue.substring(3)
    }
    
    // After MAH/, only allow numbers and slashes
    if (formattedValue.startsWith('MAH/')) {
      // Remove any non-numeric characters except slashes after MAH/
      const afterMah = formattedValue.substring(4) // Get everything after "MAH/"
      const numbersOnly = afterMah.replace(/[^0-9/]/g, '') // Keep only numbers and slashes
      formattedValue = 'MAH/' + numbersOnly
    }
    
    // Only apply formatting if the value is longer than current value (user is typing, not deleting)
    const currentValue = formData.advocateLicense
    const isTyping = value.length > currentValue.length
    
    if (isTyping) {
      // If user types MAH, automatically add the first slash
      if (formattedValue.includes('MAH') && !formattedValue.includes('MAH/')) {
        formattedValue = formattedValue.replace('MAH', 'MAH/')
      }
      
      // If we have MAH/ followed by exactly 4 digits (not more), automatically add the second slash
      const mahWithFourDigits = /MAH\/\d{4}$/
      if (mahWithFourDigits.test(formattedValue)) {
        formattedValue = formattedValue.replace(/(MAH\/\d{4})$/, '$1/')
      }
    }
    
    // Allow up to 13 characters for the license format MAH/XXXX/YYYY
    if (formattedValue.length <= 13) {
      handleInputChange('advocateLicense', formattedValue)
    }
  }

  const handleSalaryChange = (value: string) => {
    // Only allow numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '')
    // Prevent multiple decimal points
    const parts = numericValue.split('.')
    if (parts.length > 2) {
      const finalValue = parts[0] + '.' + parts.slice(1).join('')
      handleInputChange('salary', finalValue)
    } else {
      handleInputChange('salary', numericValue)
    }
  }

  const handleContactNameChange = (value: string) => {
    // Only allow letters and spaces
    const lettersOnly = value.replace(/[^a-zA-Z\s]/g, '')
    handleInputChange('emergencyContactName', lettersOnly)
  }

  const handleContactRelationChange = (value: string) => {
    // Only allow letters and spaces
    const lettersOnly = value.replace(/[^a-zA-Z\s]/g, '')
    handleInputChange('emergencyContactRelation', lettersOnly)
  }

  const handleFirstNameChange = (value: string) => {
    // Only allow letters and spaces
    const lettersOnly = value.replace(/[^a-zA-Z\s]/g, '')
    handleInputChange('firstName', lettersOnly)
  }

  const handleLastNameChange = (value: string) => {
    // Only allow letters and spaces
    const lettersOnly = value.replace(/[^a-zA-Z\s]/g, '')
    handleInputChange('lastName', lettersOnly)
  }

  const getSalaryUnit = (salary: string) => {
    if (!salary || salary === '') return ''
    
    const num = parseFloat(salary)
    if (isNaN(num)) return ''
    
    if (num >= 10000000) { // 1 crore
      return `${(num / 10000000).toFixed(1)} Cr`
    } else if (num >= 100000) { // 1 lakh
      return `${(num / 100000).toFixed(1)} L`
    } else if (num >= 1000) { // 1 thousand
      return `${(num / 1000).toFixed(1)} K`
    } else {
      return `${num.toFixed(0)}`
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<EmployeeRegistrationData> = {}
    
    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
    if (!formData.gender) newErrors.gender = 'Gender is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.aadharCard.trim()) {
      newErrors.aadharCard = 'Aadhar Card Number is required'
    } else if (!/^\d{12}$/.test(formData.aadharCard.replace(/\s/g, ''))) {
      newErrors.aadharCard = 'Aadhar Card Number must be exactly 12 digits'
    }
    if (!formData.employeeType) newErrors.employeeType = 'Employee type is required'
    if (formData.employeeType === 'advocate') {
      if (!formData.advocateLicense.trim()) {
        newErrors.advocateLicense = 'Advocate License Number is required'
      } else {
        // Validate advocate license format: MAH/XXXX/YYYY
        const license = formData.advocateLicense.trim()
        
        // Check if it starts with MAH/
        if (!license.startsWith('MAH/')) {
          newErrors.advocateLicense = 'License must start with MAH/'
        } else {
          const parts = license.split('/')
          
          if (parts.length !== 3) {
            newErrors.advocateLicense = 'Invalid license format. Use: MAH/XXXX/YYYY'
          } else {
            const [mahPart, middleDigits, yearDigits] = parts
            
            // Check MAH part
            if (mahPart !== 'MAH') {
              newErrors.advocateLicense = 'License must start with MAH/'
            } else {
              // Check middle 4 digits are numbers
              if (!/^\d{4}$/.test(middleDigits)) {
                newErrors.advocateLicense = 'Middle part must be 4 digits'
              }
              
              // Check year is 4 digits and not greater than current year
              if (!/^\d{4}$/.test(yearDigits)) {
                newErrors.advocateLicense = 'Year must be 4 digits'
              } else {
                const year = parseInt(yearDigits)
                const currentYear = new Date().getFullYear()
                if (year > currentYear) {
                  newErrors.advocateLicense = `Please enter a proper license number. Year cannot be greater than ${currentYear}`
                }
              }
            }
          }
        }
      }
    }
    if (formData.employeeType === 'intern') {
      if (!formData.internYear.trim()) {
        newErrors.internYear = 'Intern year is required'
      }
    }
    if (!formData.department.trim()) newErrors.department = 'Department is required'
    if (!formData.position.trim()) newErrors.position = 'Position is required'
    if (!formData.salary.trim()) newErrors.salary = 'Salary is required'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = 'Emergency contact name is required'
    if (!formData.emergencyContactPhone.trim()) {
      newErrors.emergencyContactPhone = 'Emergency contact phone is required'
    } else if (!/^\d{10}$/.test(formData.emergencyContactPhone)) {
      newErrors.emergencyContactPhone = 'Please enter a valid 10-digit phone number'
    }
    if (!formData.emergencyContactRelation.trim()) newErrors.emergencyContactRelation = 'Emergency contact relation is required'
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else {
      // Check for password strength requirements
      const hasUpperCase = /[A-Z]/.test(formData.password)
      const hasLowerCase = /[a-z]/.test(formData.password)
      const hasNumbers = /\d/.test(formData.password)
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)
      
      if (!hasUpperCase) {
        newErrors.password = 'Password must contain at least one uppercase letter'
      } else if (!hasLowerCase) {
        newErrors.password = 'Password must contain at least one lowercase letter'
      } else if (!hasNumbers) {
        newErrors.password = 'Password must contain at least one number'
      } else if (!hasSpecialChar) {
        newErrors.password = 'Password must contain at least one special character'
      }
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    setSuccess(false)
    setRegistrationError('')
    setIsAccountActive(false)
    
    try {
      // Prepare API payload - ensure all fields are included
      const payload: RegisterEmployeeRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        age: parseInt(formData.age) || 0,
        aadharCardNumber: formData.aadharCard.replace(/\s/g, ''), // Remove spaces before sending to backend
        employeeType: formData.employeeType,
        salary: parseFloat(formData.salary) || 0,
        department: formData.department.trim(),
        position: formData.position.trim(),
        startDate: formData.startDate,
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactPhone: formData.emergencyContactPhone.trim(),
        emergencyContactRelation: formData.emergencyContactRelation.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      }
      
      // Add conditional fields
      if (formData.employeeType === 'advocate' && formData.advocateLicense.trim()) {
        payload.advocateLicenseNumber = formData.advocateLicense.trim()
      }
      
      if (formData.employeeType === 'intern' && formData.internYear) {
        payload.internYear = parseInt(formData.internYear) || 0
      }
      
      // Validate that all required fields are present
      const requiredFields = [
        'firstName', 'lastName', 'email', 'phone', 'address', 'gender',
        'dateOfBirth', 'aadharCardNumber', 'employeeType', 'salary',
        'department', 'position', 'startDate', 'emergencyContactName',
        'emergencyContactPhone', 'emergencyContactRelation', 'password', 'confirmPassword'
      ]
      
      const missingFields = requiredFields.filter(field => !payload[field as keyof RegisterEmployeeRequest])
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields)
        toast.error(`Missing required fields: ${missingFields.join(', ')}`)
        setIsSubmitting(false)
        return
      }
      
      console.log('Registering employee - Full payload:', JSON.stringify(payload, null, 2))
      console.log('Payload keys:', Object.keys(payload))
      console.log('Payload field count:', Object.keys(payload).length)
      
      // Prepare the API call with token in Authorization header
      const apiPayload: RegisterEmployeeRequestWithToken = {
        data: payload,
        token: urlParams?.token || ''
      }
      
      console.log('API Payload structure:', JSON.stringify(apiPayload, null, 2))
      console.log('Data object keys:', Object.keys(apiPayload.data))
      
      const response = await registerEmployee(apiPayload).unwrap()
      
      console.log('Registration response:', response)
      
      setSuccess(true)
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          gender: '',
          address: '',
          aadharCard: '',
          employeeType: '',
          advocateLicense: '',
          internYear: '',
          age: '',
          department: '',
          position: '',
          salary: '',
          startDate: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          emergencyContactRelation: '',
          password: '',
          confirmPassword: ''
        })
        setErrors({})
        setSuccess(false)
        router.push('/auth/login')
      }, 2000)
      
    } catch (error: any) {
      console.error('Error registering employee:', error)
      
      // Handle API errors
      let errorMessage = 'Registration failed. Please try again.'
      
      if (error?.data?.error) {
        errorMessage = error.data.error
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      // Show error in toast
      toast.error(errorMessage)
      
      // Check if it's the specific "already completed registration" error
      if (errorMessage.includes('account is pending admin approval')) {
        setRegistrationError(errorMessage)
      } else if (errorMessage.includes('account is active') || 
                 errorMessage.includes('Your account is active') ||
                 errorMessage.includes('cannot register again') ||
                 errorMessage.includes('You have already completed your registration and your account is active. You cannot register again.') ||
                 errorMessage.includes('You have already completed your registration and your account is active')) {
        // Show active account message with login option
        setRegistrationError(errorMessage)
        setIsAccountActive(true)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const buttonBoxSx = {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    py: 1.5,
    px: 3,
    lineHeight: 1.25,
    textTransform: 'none',
    '& .MuiButton-startIcon': { marginRight: 0.5, marginBottom: '2px', display: 'inline-flex', alignItems: 'center' },
    '& .MuiButton-startIcon svg': { display: 'block' }
  } as const

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-white to-yellow-50'} flex items-center justify-center p-2 sm:p-4`}>
      {/* Theme Toggle */}
      <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="max-w-4xl w-full space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="text-center px-2">
          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-yellow-500 dark:to-yellow-600 rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 dark:text-gray-900" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Employee Registration
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-4 mb-4">
            Join our team and get started with your new role
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">
              Employee registered successfully! Redirecting to login...
            </p>
          </div>
        )}

        {/* Organization Info */}
        {urlParams && (
          <div className="mb-4 sm:mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {urlParams.organizationName}
              </span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-300 text-center">
              Invited by {urlParams.adminName}
            </p>
          </div>
        )}


        {/* Registration Error */}
        {registrationError && (
          <div className={`mb-4 sm:mb-6 p-4 border rounded-lg ${
            isAccountActive 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
          }`}>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <UserCheck className={`w-4 h-4 ${
                isAccountActive 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-yellow-600 dark:text-yellow-400'
              }`} />
              <span className={`text-sm font-medium ${
                isAccountActive 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-yellow-800 dark:text-yellow-200'
              }`}>
                Registration Status
              </span>
            </div>
            <p className={`text-sm text-center ${
              isAccountActive 
                ? 'text-green-700 dark:text-green-300' 
                : 'text-yellow-700 dark:text-yellow-300'
            }`}>
              {registrationError}
            </p>
            {isAccountActive && (
              <div className="mt-3 flex justify-center">
                <button
                  onClick={() => {
                    const email = formData.email
                    const encodedEmail = encodeURIComponent(email)
                    router.push(`/auth/login?email=${encodedEmail}&message=account_active`)
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Go to Login</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Registration Form */}
        <div className={`bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-200 dark:border-gray-700 mx-2 sm:mx-0 ${registrationError ? 'opacity-50 pointer-events-none' : ''}`}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Personal Information Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <User size={20} />
                    Personal Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleFirstNameChange(e.target.value)}
                    error={!!errors.firstName}
                    helperText={errors.firstName || 'Letters only'}
                    disabled={isSubmitting}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleLastNameChange(e.target.value)}
                    error={!!errors.lastName}
                    helperText={errors.lastName || 'Letters only'}
                    disabled={isSubmitting}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email || (urlParams ? 'Email provided in invitation' : '')}
                    disabled={isSubmitting || !!urlParams}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail size={20} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    error={!!errors.phone}
                    helperText={errors.phone || 'Enter 10-digit phone number'}
                    disabled={isSubmitting}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone size={20} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    error={!!errors.dateOfBirth}
                    helperText={errors.dateOfBirth}
                    disabled={isSubmitting}
                    required
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Calendar size={20} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Age"
                    value={formData.age}
                    disabled
                    helperText="Calculated automatically from date of birth"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.gender} disabled={isSubmitting} required>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={formData.gender}
                      label="Gender"
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                      <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                    </Select>
                    {errors.gender && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                        {errors.gender}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={3}
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    error={!!errors.address}
                    helperText={errors.address}
                    disabled={isSubmitting}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                          <MapPin size={20} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Aadhar Card Number"
                    value={formData.aadharCard}
                    onChange={(e) => handleAadharChange(e.target.value)}
                    error={!!errors.aadharCard}
                    helperText={errors.aadharCard || 'Enter 12-digit Aadhar number'}
                    disabled={isSubmitting}
                    required
                    placeholder="123456789012"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.employeeType} disabled={isSubmitting} required>
                    <InputLabel>Employee Type</InputLabel>
                    <Select
                      value={formData.employeeType}
                      label="Employee Type"
                      onChange={(e) => handleInputChange('employeeType', e.target.value)}
                    >
                      <MenuItem value="advocate">Advocate</MenuItem>
                      <MenuItem value="intern">Intern</MenuItem>
                    </Select>
                    {errors.employeeType && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                        {errors.employeeType}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                {formData.employeeType === 'advocate' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Advocate License Number"
                      value={formData.advocateLicense}
                      onChange={(e) => handleAdvocateLicenseChange(e.target.value)}
                      error={!!errors.advocateLicense}
                      helperText={errors.advocateLicense || 'Format: MAH/XXXX/YYYY (slashes added automatically)'}
                      disabled={isSubmitting}
                      required
                      placeholder="MAH/9720/2025"
                      inputProps={{ maxLength: 13 }}
                    />
                  </Grid>
                )}

                {formData.employeeType === 'intern' && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.internYear} disabled={isSubmitting} required>
                      <InputLabel>Intern Year</InputLabel>
                      <Select
                        value={formData.internYear}
                        label="Intern Year"
                        onChange={(e) => handleInputChange('internYear', e.target.value)}
                      >
                        <MenuItem value="1">1st Year</MenuItem>
                        <MenuItem value="2">2nd Year</MenuItem>
                        <MenuItem value="3">3rd Year</MenuItem>
                        <MenuItem value="4">4th Year</MenuItem>
                        <MenuItem value="5">5th Year</MenuItem>
                      </Select>
                      {errors.internYear && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.internYear}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                )}

                {/* Employment Information Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                    <Building2 size={20} />
                    Employment Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    error={!!errors.department}
                    helperText={errors.department}
                    disabled={isSubmitting}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    error={!!errors.position}
                    helperText={errors.position}
                    disabled={isSubmitting}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Salary"
                    value={formData.salary}
                    onChange={(e) => handleSalaryChange(e.target.value)}
                    error={!!errors.salary}
                    helperText={errors.salary || (urlParams?.salary ? 'Salary provided in invitation' : 'Enter numeric value only')}
                    disabled={isSubmitting || !!urlParams?.salary}
                    required
                    placeholder="e.g., 50000"
                    InputProps={{
                      endAdornment: formData.salary && (
                        <InputAdornment position="end">
                          <Box
                            sx={{
                              bgcolor: 'primary.100',
                              color: 'primary.main',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '12px',
                              fontWeight: 600,
                              minWidth: '40px',
                              textAlign: 'center',
                              border: '1px solid',
                              borderColor: 'primary.300'
                            }}
                          >
                            {getSalaryUnit(formData.salary)}
                          </Box>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    error={!!errors.startDate}
                    helperText={errors.startDate}
                    disabled={isSubmitting}
                    required
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Calendar size={20} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Emergency Contact Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                    <Phone size={20} />
                    Emergency Contact
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Contact Name"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleContactNameChange(e.target.value)}
                    error={!!errors.emergencyContactName}
                    helperText={errors.emergencyContactName || 'Letters only'}
                    disabled={isSubmitting}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Contact Phone"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleEmergencyPhoneChange(e.target.value)}
                    error={!!errors.emergencyContactPhone}
                    helperText={errors.emergencyContactPhone || 'Enter 10-digit phone number'}
                    disabled={isSubmitting}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone size={20} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Relation"
                    value={formData.emergencyContactRelation}
                    onChange={(e) => handleContactRelationChange(e.target.value)}
                    error={!!errors.emergencyContactRelation}
                    helperText={errors.emergencyContactRelation || 'Letters only'}
                    disabled={isSubmitting}
                    required
                    placeholder="e.g., Spouse, Parent, Sibling"
                  />
                </Grid>

                {/* Account Information Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                    <UserCheck size={20} />
                    Account Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password || 'Must contain: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char'}
                    disabled={isSubmitting}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    disabled={isSubmitting}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Submit Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting || isRegisterLoading}
                      startIcon={isSubmitting || isRegisterLoading ? <CircularProgress size={16} /> : <UserCheck size={16} />}
                      sx={{ ...buttonBoxSx }}
                    >
                      {isSubmitting || isRegisterLoading ? 'Registering...' : 'Complete Registration'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/auth/login')}
              className="font-medium text-yellow-600 hover:text-yellow-500 transition-colors duration-200"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
