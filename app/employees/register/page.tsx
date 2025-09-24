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

interface EmployeeRegistrationData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: string
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

    if (token && employeeName && organizationName && adminName && employeeEmail) {
      setUrlParams({
        token,
        employeeName: decodeURIComponent(employeeName),
        organizationName: decodeURIComponent(organizationName),
        adminName: decodeURIComponent(adminName),
        employeeEmail: decodeURIComponent(employeeEmail)
      })

      // Pre-fill form data from URL parameters
      const nameParts = decodeURIComponent(employeeName).split(' ')
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: decodeURIComponent(employeeEmail)
      }))
    }
  }, [searchParams])

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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
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
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Registering employee:', formData)
      
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
      
    } catch (error) {
      console.error('Error registering employee:', error)
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

        {/* Registration Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-200 dark:border-gray-700 mx-2 sm:mx-0">
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
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    disabled={isSubmitting}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
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
                  <FormControl fullWidth error={!!errors.gender} disabled={isSubmitting} required>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={formData.gender}
                      label="Gender"
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                      <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
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
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                    error={!!errors.salary}
                    helperText={errors.salary}
                    disabled={isSubmitting}
                    required
                    placeholder="e.g., 50000"
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
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    error={!!errors.emergencyContactName}
                    helperText={errors.emergencyContactName}
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
                    onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                    error={!!errors.emergencyContactRelation}
                    helperText={errors.emergencyContactRelation}
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
                    helperText={errors.password}
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
                      disabled={isSubmitting}
                      startIcon={isSubmitting ? <CircularProgress size={16} /> : <UserCheck size={16} />}
                      sx={{ ...buttonBoxSx }}
                    >
                      {isSubmitting ? 'Registering...' : 'Complete Registration'}
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
