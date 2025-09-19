// Minimal environment config to satisfy imports like `@/config/env`
// Expand as needed, but avoid hardcoding secrets

export const env = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'CaseSnap',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  APP_BACKEND_URL:process.env.NEXT_PUBLIC_APP_BACKEND_URL,
  APP_DESCRIPTION:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
    'Best Lawyer Case Management Software for Law Firms in India',
}

export const { APP_NAME, APP_URL, APP_DESCRIPTION,APP_BACKEND_URL } = env


