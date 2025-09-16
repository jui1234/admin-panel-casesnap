#!/usr/bin/env node

/**
 * Environment Setup Script for CaseSnap
 * This script helps you create environment files with proper configuration
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a random secret
function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

// Environment templates
const envTemplates = {
  local: `# CaseSnap Environment Variables - Local Development
# Generated on ${new Date().toISOString()}

# Application Configuration
NEXT_PUBLIC_APP_NAME=CaseSnap
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_DESCRIPTION=Best Lawyer Case Management Software for Law Firms in India

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
API_SECRET_KEY=${generateSecret()}

# Authentication Configuration
JWT_SECRET=${generateSecret()}
JWT_EXPIRES_IN=7d
NEXTAUTH_SECRET=${generateSecret()}
NEXTAUTH_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_MAINTENANCE_MODE=false

# Legal Practice Areas (comma-separated)
NEXT_PUBLIC_DEFAULT_PRACTICE_AREAS=Criminal Law,Civil Law,Corporate Law,Family Law,Property Law,Tax Law,Labour Law,Constitutional Law,Intellectual Property,Banking & Finance,Real Estate,Immigration Law,Medical Malpractice,Environmental Law,International Law

# Indian States (comma-separated)
NEXT_PUBLIC_INDIAN_STATES=Andhra Pradesh,Arunachal Pradesh,Assam,Bihar,Chhattisgarh,Goa,Gujarat,Haryana,Himachal Pradesh,Jharkhand,Karnataka,Kerala,Madhya Pradesh,Maharashtra,Manipur,Meghalaya,Mizoram,Nagaland,Odisha,Punjab,Rajasthan,Sikkim,Tamil Nadu,Telangana,Tripura,Uttar Pradesh,Uttarakhand,West Bengal,Delhi,Jammu and Kashmir,Ladakh,Chandigarh,Puducherry,Andaman and Nicobar Islands,Dadra and Nagar Haveli and Daman and Diu,Lakshadweep
`,

  production: `# CaseSnap Environment Variables - Production
# Generated on ${new Date().toISOString()}
# ⚠️  IMPORTANT: Update these values for your production environment

# Application Configuration
NEXT_PUBLIC_APP_NAME=CaseSnap
NEXT_PUBLIC_APP_URL=https://casesnap.com
NEXT_PUBLIC_APP_DESCRIPTION=Best Lawyer Case Management Software for Law Firms in India

# API Configuration
NEXT_PUBLIC_API_URL=https://casesnap.com/api
API_SECRET_KEY=${generateSecret()}

# Authentication Configuration
JWT_SECRET=${generateSecret()}
JWT_EXPIRES_IN=7d
NEXTAUTH_SECRET=${generateSecret()}
NEXTAUTH_URL=https://casesnap.com

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
NEXT_PUBLIC_ENABLE_MAINTENANCE_MODE=false

# Database Configuration (uncomment and configure as needed)
# DATABASE_URL=postgresql://username:password@localhost:5432/casesnap_prod
# DATABASE_HOST=your-db-host
# DATABASE_PORT=5432
# DATABASE_NAME=casesnap_prod
# DATABASE_USER=your_db_user
# DATABASE_PASSWORD=your_db_password

# Email Configuration (uncomment and configure as needed)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
# SMTP_FROM=noreply@casesnap.com

# File Storage Configuration (uncomment and configure as needed)
# AWS_ACCESS_KEY_ID=your-aws-access-key
# AWS_SECRET_ACCESS_KEY=your-aws-secret-key
# AWS_REGION=us-east-1
# AWS_S3_BUCKET=casesnap-files

# Analytics and Monitoring (uncomment and configure as needed)
# GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
# SENTRY_DSN=your-sentry-dsn

# Legal Practice Areas (comma-separated)
NEXT_PUBLIC_DEFAULT_PRACTICE_AREAS=Criminal Law,Civil Law,Corporate Law,Family Law,Property Law,Tax Law,Labour Law,Constitutional Law,Intellectual Property,Banking & Finance,Real Estate,Immigration Law,Medical Malpractice,Environmental Law,International Law

# Indian States (comma-separated)
NEXT_PUBLIC_INDIAN_STATES=Andhra Pradesh,Arunachal Pradesh,Assam,Bihar,Chhattisgarh,Goa,Gujarat,Haryana,Himachal Pradesh,Jharkhand,Karnataka,Kerala,Madhya Pradesh,Maharashtra,Manipur,Meghalaya,Mizoram,Nagaland,Odisha,Punjab,Rajasthan,Sikkim,Tamil Nadu,Telangana,Tripura,Uttar Pradesh,Uttarakhand,West Bengal,Delhi,Jammu and Kashmir,Ladakh,Chandigarh,Puducherry,Andaman and Nicobar Islands,Dadra and Nagar Haveli and Daman and Diu,Lakshadweep
`
};

// Main function
function setupEnvironment() {
  const projectRoot = path.resolve(__dirname, '..');
  
  console.log('🚀 Setting up CaseSnap environment files...\n');
  
  // Create .env.local
  const localEnvPath = path.join(projectRoot, '.env.local');
  if (!fs.existsSync(localEnvPath)) {
    fs.writeFileSync(localEnvPath, envTemplates.local);
    console.log('✅ Created .env.local');
  } else {
    console.log('⚠️  .env.local already exists, skipping...');
  }
  
  // Create .env.production
  const prodEnvPath = path.join(projectRoot, '.env.production');
  if (!fs.existsSync(prodEnvPath)) {
    fs.writeFileSync(prodEnvPath, envTemplates.production);
    console.log('✅ Created .env.production');
  } else {
    console.log('⚠️  .env.production already exists, skipping...');
  }
  
  console.log('\n🎉 Environment setup complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Review and update the generated environment files');
  console.log('2. Add your database, email, and other service configurations');
  console.log('3. Restart your development server');
  console.log('\n📖 For detailed instructions, see ENVIRONMENT_SETUP.md');
}

// Run the setup
if (import.meta.url === `file://${process.argv[1]}`) {
  setupEnvironment();
}

export { setupEnvironment, generateSecret };
