import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import SetupGuard from '@/components/SetupGuard'
import MuiThemeProviderWrapper from '@/components/ThemeProvider'
import ReduxProvider from '@/components/ReduxProvider'
import { env } from '@/config/env'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_URL),
  title: 'CaseSnap - Best Lawyer Case Management Software | Legal Practice Management System',
  description: 'Professional lawyer case management software for law firms. Cloud-based legal practice management system with case tracking, document management, and billing. Trusted by 500+ law firms in India.',
  keywords: [
    'lawyer case management software',
    'law firm management software', 
    'legal practice management system',
    'advocate admin panel software',
    'case tracking software for lawyers',
    'best software for law firms',
    'cloud-based legal management system',
    'court case management software India',
    'legal billing and invoicing software',
    'document management system for lawyers',
    'affordable lawyer management software India',
    'legal case tracking software',
    'secure document management for advocates',
    'daily case reminder software for lawyers',
    'legal calendar and task management software'
  ],
  authors: [{ name: 'CaseSnap Team' }],
  creator: 'CaseSnap',
  publisher: 'CaseSnap',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://casesnap.com',
    siteName: 'CaseSnap - Lawyer Case Management Software',
    title: 'CaseSnap - Best Lawyer Case Management Software | Legal Practice Management System',
    description: 'Professional lawyer case management software for law firms. Cloud-based legal practice management system with case tracking, document management, and billing. Trusted by 500+ law firms in India.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CaseSnap - Lawyer Case Management Software',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CaseSnap - Best Lawyer Case Management Software',
    description: 'Professional lawyer case management software for law firms. Cloud-based legal practice management system.',
    images: ['/twitter-image.jpg'],
  },
  alternates: {
    canonical: 'https://casesnap.com',
  },
  category: 'Legal Technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CaseSnap",
    "description": "Professional lawyer case management software for law firms. Cloud-based legal practice management system with case tracking, document management, and billing.",
    "url": "https://casesnap.com",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "29",
      "priceCurrency": "USD",
      "priceValidUntil": "2025-12-31"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "500",
      "bestRating": "5",
      "worstRating": "1"
    },
    "author": {
      "@type": "Organization",
      "name": "CaseSnap",
      "url": "https://casesnap.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "CaseSnap",
      "url": "https://casesnap.com"
    },
    "keywords": "lawyer case management software, law firm management software, legal practice management system, advocate admin panel software, case tracking software for lawyers",
    "featureList": [
      "Case Management",
      "Document Management", 
      "Legal Billing",
      "Client Management",
      "Court Calendar",
      "Task Management",
      "Role-based Access Control",
      "Analytics Dashboard"
    ]
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <link rel="canonical" href="https://casesnap.com" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="geo.position" content="20.5937;78.9629" />
        <meta name="ICBM" content="20.5937, 78.9629" />
      </head>
      <body className="antialiased">
        {/* NoScript Fallback */}
        <noscript>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            zIndex: 9999
          }}>
            <div style={{
              maxWidth: '600px',
              textAlign: 'center',
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '1rem'
              }}>
                CaseSnap - Legal Case Management Software
              </h1>
              <p style={{
                fontSize: '1.1rem',
                color: '#6b7280',
                marginBottom: '2rem',
                lineHeight: '1.6'
              }}>
                Best lawyer case management software for law firms in India. Professional legal practice management system with cloud-based case tracking, document management, and billing.
              </p>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                alignItems: 'center'
              }}>
                <a href="/get-started" style={{
                  backgroundColor: '#f59e0b',
                  color: '#1f2937',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}>
                  Get Started
                </a>
                <a href="/auth/login" style={{
                  backgroundColor: 'transparent',
                  color: '#374151',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '1rem',
                  border: '2px solid #d1d5db'
                }}>
                  Login
                </a>
              </div>
              <p style={{
                fontSize: '0.9rem',
                color: '#9ca3af',
                marginTop: '2rem'
              }}>
                JavaScript is required for the full experience. Please enable JavaScript to access all features.
              </p>
            </div>
          </div>
        </noscript>

        <ReduxProvider>
          <ThemeProvider>
            <AuthProvider>
              <SetupGuard>
                <MuiThemeProviderWrapper>
                  {children}
                </MuiThemeProviderWrapper>
              </SetupGuard>
            </AuthProvider>
          </ThemeProvider>
        </ReduxProvider>
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
} 