import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import SetupGuard from '@/components/SetupGuard'
import MuiThemeProviderWrapper from '@/components/ThemeProvider'

export const metadata: Metadata = {
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
        <ThemeProvider>
          <AuthProvider>
            <SetupGuard>
              <MuiThemeProviderWrapper>
                {children}
              </MuiThemeProviderWrapper>
            </SetupGuard>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 