# CaseSnap Environment Setup Guide

This guide will help you set up environment variables for your CaseSnap project.

## 🚀 Quick Setup

### 1. Create Environment Files

Create the following files in your project root:

#### `.env.local` (for local development)
```bash
# Application Configuration
NEXT_PUBLIC_APP_NAME=CaseSnap
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_DESCRIPTION=Best Lawyer Case Management Software for Law Firms in India

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
API_SECRET_KEY=your-secret-key-here-change-in-production

# Authentication Configuration
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=7d
NEXTAUTH_SECRET=your-nextauth-secret-change-in-production
NEXTAUTH_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_MAINTENANCE_MODE=false
```

#### `.env.production` (for production)
```bash
# Application Configuration
NEXT_PUBLIC_APP_NAME=CaseSnap
NEXT_PUBLIC_APP_URL=https://casesnap.com
NEXT_PUBLIC_APP_DESCRIPTION=Best Lawyer Case Management Software for Law Firms in India

# API Configuration
NEXT_PUBLIC_API_URL=https://casesnap.com/api
API_SECRET_KEY=your-production-secret-key

# Authentication Configuration
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRES_IN=7d
NEXTAUTH_SECRET=your-production-nextauth-secret
NEXTAUTH_URL=https://casesnap.com

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
NEXT_PUBLIC_ENABLE_MAINTENANCE_MODE=false
```

## 📋 Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_NAME` | Application name | `CaseSnap` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |
| `API_SECRET_KEY` | Secret key for API | `your-secret-key` |
| `JWT_SECRET` | JWT signing secret | `your-jwt-secret` |
| `NEXTAUTH_SECRET` | NextAuth secret | `your-nextauth-secret` |

### Optional Variables

#### Database Configuration
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/casesnap_dev
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=casesnap_dev
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
```

#### Email Configuration
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@casesnap.com
```

#### File Storage (AWS S3)
```bash
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=casesnap-files
```

#### Analytics and Monitoring
```bash
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
SENTRY_DSN=your-sentry-dsn
```

#### Legal Practice Areas
```bash
NEXT_PUBLIC_DEFAULT_PRACTICE_AREAS=Criminal Law,Civil Law,Corporate Law,Family Law,Property Law,Tax Law,Labour Law,Constitutional Law,Intellectual Property,Banking & Finance,Real Estate,Immigration Law,Medical Malpractice,Environmental Law,International Law
```

#### Indian States
```bash
NEXT_PUBLIC_INDIAN_STATES=Andhra Pradesh,Arunachal Pradesh,Assam,Bihar,Chhattisgarh,Goa,Gujarat,Haryana,Himachal Pradesh,Jharkhand,Karnataka,Kerala,Madhya Pradesh,Maharashtra,Manipur,Meghalaya,Mizoram,Nagaland,Odisha,Punjab,Rajasthan,Sikkim,Tamil Nadu,Telangana,Tripura,Uttar Pradesh,Uttarakhand,West Bengal,Delhi,Jammu and Kashmir,Ladakh,Chandigarh,Puducherry,Andaman and Nicobar Islands,Dadra and Nagar Haveli and Daman and Diu,Lakshadweep
```

## 🔧 Setup Instructions

### 1. Create Environment Files

```bash
# Navigate to your project directory
cd admin-panel-casesnap

# Create .env.local for development
touch .env.local

# Create .env.production for production
touch .env.production
```

### 2. Copy the Environment Variables

Copy the appropriate environment variables from above into your `.env.local` file.

### 3. Generate Secure Secrets

For production, generate secure secrets:

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate NextAuth secret
openssl rand -base64 32

# Generate API secret
openssl rand -base64 32
```

### 4. Update Your Environment Files

Replace the placeholder values with your actual secrets and configuration.

## 🚀 Usage in Code

The environment configuration is centralized in `config/env.ts`. You can import and use it like this:

```typescript
import { env } from '@/config/env'

// Use environment variables
console.log(env.APP_NAME) // CaseSnap
console.log(env.APP_URL) // http://localhost:3000
console.log(env.isDevelopment) // true in development
```

## 🔒 Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use strong secrets** - Generate random strings for production
3. **Rotate secrets regularly** - Change secrets periodically
4. **Use different secrets** - Don't reuse secrets across environments
5. **Limit access** - Only give access to necessary team members

## 🌍 Environment-Specific Configuration

### Development
- `NEXT_PUBLIC_ENABLE_DEBUG=true`
- `NEXT_PUBLIC_ENABLE_ANALYTICS=false`
- Use local database and services

### Production
- `NEXT_PUBLIC_ENABLE_DEBUG=false`
- `NEXT_PUBLIC_ENABLE_ANALYTICS=true`
- Use production database and services
- Use strong, unique secrets

## 🐛 Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Check file name (`.env.local` not `.env`)
   - Restart your development server
   - Check for typos in variable names

2. **Build errors**
   - Ensure all required variables are set
   - Check that `NEXT_PUBLIC_` prefix is used for client-side variables

3. **Runtime errors**
   - Validate environment variables on startup
   - Check the console for missing variable warnings

### Validation

The environment configuration includes validation. Check the console for warnings about missing variables.

## 📝 Notes

- Variables prefixed with `NEXT_PUBLIC_` are available on the client side
- Variables without the prefix are only available on the server side
- Environment files are loaded in this order:
  1. `.env.local`
  2. `.env.development` / `.env.production`
  3. `.env`

## 🔄 Updates

When adding new environment variables:

1. Add them to `config/env.ts`
2. Update this documentation
3. Add them to your deployment platform (Vercel, Netlify, etc.)
4. Update your team about the new variables
