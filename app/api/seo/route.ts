import { NextResponse } from 'next/server'

export async function GET() {
  const seoData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CaseSnap",
    "description": "Best Lawyer Case Management Software for Law Firms in India. Professional legal practice management system with cloud-based case tracking, document management, and billing software.",
    "url": "https://casesnap.com",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "29",
      "priceCurrency": "USD",
      "priceValidUntil": "2025-12-31",
      "availability": "https://schema.org/InStock"
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
    "keywords": [
      "lawyer case management software",
      "law firm management software",
      "legal practice management system",
      "advocate admin panel software",
      "case tracking software for lawyers",
      "best software for law firms",
      "cloud-based legal management system",
      "court case management software India",
      "legal billing and invoicing software",
      "document management system for lawyers",
      "affordable lawyer management software India",
      "legal case tracking software",
      "secure document management for advocates",
      "daily case reminder software for lawyers",
      "legal calendar and task management software"
    ],
    "featureList": [
      "Case Management",
      "Document Management",
      "Legal Billing",
      "Client Management",
      "Court Calendar",
      "Task Management",
      "Role-based Access Control",
      "Analytics Dashboard",
      "Secure File Storage",
      "Team Collaboration",
      "Mobile App Access",
      "API Integration"
    ],
    "screenshot": "https://casesnap.com/screenshot.jpg",
    "softwareVersion": "1.0.0",
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    "inLanguage": "en-IN",
    "audience": {
      "@type": "Audience",
      "audienceType": "Lawyers, Legal Professionals, Law Firms"
    },
    "serviceType": "Legal Technology",
    "areaServed": {
      "@type": "Country",
      "name": "India"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "CaseSnap Plans",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Free Trial",
            "description": "14-day free trial with full access"
          },
          "price": "0",
          "priceCurrency": "USD"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Monthly Plan",
            "description": "Unlimited users and advanced features"
          },
          "price": "29",
          "priceCurrency": "USD"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Yearly Plan",
            "description": "Best value with 2 months free"
          },
          "price": "290",
          "priceCurrency": "USD"
        }
      ]
    }
  }

  return NextResponse.json(seoData, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}
