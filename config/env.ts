// Environment Configuration for CaseSnap
// This file centralizes all environment variable access

export const env = {
  // Application Configuration
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'CaseSnap',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Best Lawyer Case Management Software for Law Firms in India',
  
  // API Configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  API_SECRET_KEY: process.env.API_SECRET_KEY || 'dev-secret-key',
  
  // Authentication Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'dev-nextauth-secret',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_HOST: process.env.DATABASE_HOST || 'localhost',
  DATABASE_PORT: process.env.DATABASE_PORT || '5432',
  DATABASE_NAME: process.env.DATABASE_NAME || 'casesnap_dev',
  DATABASE_USER: process.env.DATABASE_USER,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  
  // Email Configuration
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT || '587',
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_FROM: process.env.SMTP_FROM || 'noreply@casesnap.com',
  
  // File Storage Configuration
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  
  // Analytics and Monitoring
  GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
  SENTRY_DSN: process.env.SENTRY_DSN,
  
  // Feature Flags
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
  ENABLE_MAINTENANCE_MODE: process.env.NEXT_PUBLIC_ENABLE_MAINTENANCE_MODE === 'true',
  
  // Legal Practice Areas
  DEFAULT_PRACTICE_AREAS: process.env.NEXT_PUBLIC_DEFAULT_PRACTICE_AREAS?.split(',') || [
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
  ],
  
  // Indian States
  INDIAN_STATES: process.env.NEXT_PUBLIC_INDIAN_STATES?.split(',') || [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
    'Ladakh', 'Chandigarh', 'Puducherry', 'Andaman and Nicobar Islands',
    'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep'
  ],
  
  // Environment Detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
}

// Validation function to check required environment variables
export function validateEnv() {
  const requiredVars = [
    'NEXT_PUBLIC_APP_NAME',
    'NEXT_PUBLIC_APP_URL',
  ]
  
  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars)
  }
  
  return missingVars.length === 0
}

// Export individual environment variables for convenience
export const {
  APP_NAME,
  APP_URL,
  APP_DESCRIPTION,
  API_URL,
  API_SECRET_KEY,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  NEXTAUTH_SECRET,
  NEXTAUTH_URL,
  DATABASE_URL,
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_S3_BUCKET,
  GOOGLE_ANALYTICS_ID,
  SENTRY_DSN,
  ENABLE_ANALYTICS,
  ENABLE_DEBUG,
  ENABLE_MAINTENANCE_MODE,
  DEFAULT_PRACTICE_AREAS,
  INDIAN_STATES,
  isDevelopment,
  isProduction,
  isTest,
} = env
