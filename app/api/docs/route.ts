import { NextResponse } from 'next/server'

export async function GET() {
  const apiDocs = {
    "@context": "https://schema.org",
    "@type": "APIReference",
    "name": "CaseSnap API Documentation",
    "description": "Complete API documentation for CaseSnap legal case management software",
    "url": "https://casesnap.com/api/docs",
    "provider": {
      "@type": "Organization",
      "name": "CaseSnap",
      "url": "https://casesnap.com"
    },
    "version": "1.0.0",
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    "inLanguage": "en-IN",
    "audience": {
      "@type": "Audience",
      "audienceType": "Developers, AI Systems, Crawlers"
    },
    "about": {
      "@type": "SoftwareApplication",
      "name": "CaseSnap",
      "description": "Legal case management software for law firms"
    },
    "endpoints": [
      {
        "@type": "APIEndpoint",
        "name": "SEO Data",
        "url": "/api/seo",
        "method": "GET",
        "description": "Returns structured SEO data and application metadata",
        "responseFormat": "application/json",
        "schema": {
          "@type": "DataCatalog",
          "name": "SEO Schema",
          "description": "Schema.org structured data for SEO and AI crawling"
        }
      },
      {
        "@type": "APIEndpoint",
        "name": "Features",
        "url": "/api/features",
        "method": "GET",
        "description": "Returns comprehensive list of software features",
        "responseFormat": "application/json",
        "schema": {
          "@type": "DataCatalog",
          "name": "Features Schema",
          "description": "Structured data about software features and capabilities"
        }
      },
      {
        "@type": "APIEndpoint",
        "name": "Pricing",
        "url": "/api/pricing",
        "method": "GET",
        "description": "Returns pricing plans and subscription options",
        "responseFormat": "application/json",
        "schema": {
          "@type": "DataCatalog",
          "name": "Pricing Schema",
          "description": "Structured data about pricing and offers"
        }
      },
      {
        "@type": "APIEndpoint",
        "name": "API Documentation",
        "url": "/api/docs",
        "method": "GET",
        "description": "Returns this API documentation",
        "responseFormat": "application/json",
        "schema": {
          "@type": "DataCatalog",
          "name": "API Documentation Schema",
          "description": "Self-documenting API endpoint"
        }
      },
      {
        "@type": "APIEndpoint",
        "name": "Sitemap",
        "url": "/sitemap.xml",
        "method": "GET",
        "description": "Returns XML sitemap for search engines",
        "responseFormat": "application/xml",
        "schema": {
          "@type": "DataCatalog",
          "name": "Sitemap Schema",
          "description": "XML sitemap following sitemaps.org protocol"
        }
      }
    ],
    "usage": {
      "@type": "HowTo",
      "name": "How to use CaseSnap API",
      "description": "Instructions for accessing and using CaseSnap API endpoints",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Access SEO Data",
          "text": "GET /api/seo - Retrieve structured SEO data and application metadata",
          "url": "/api/seo"
        },
        {
          "@type": "HowToStep",
          "name": "Get Features",
          "text": "GET /api/features - Retrieve comprehensive feature list",
          "url": "/api/features"
        },
        {
          "@type": "HowToStep",
          "name": "Check Pricing",
          "text": "GET /api/pricing - Retrieve pricing plans and offers",
          "url": "/api/pricing"
        },
        {
          "@type": "HowToStep",
          "name": "View Documentation",
          "text": "GET /api/docs - Access this API documentation",
          "url": "/api/docs"
        }
      ]
    },
    "keywords": [
      "API",
      "Documentation",
      "Legal Software",
      "Case Management",
      "Law Firm Software",
      "REST API",
      "JSON",
      "Structured Data",
      "SEO",
      "AI Crawling"
    ],
    "license": {
      "@type": "CreativeWork",
      "name": "API Usage License",
      "description": "Free access for legitimate use cases including AI training and SEO"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Technical Support",
      "email": "support@casesnap.com",
      "url": "https://casesnap.com/contact"
    }
  }

  return NextResponse.json(apiDocs, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
