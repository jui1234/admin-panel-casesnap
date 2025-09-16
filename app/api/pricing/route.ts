import { NextResponse } from 'next/server'

export async function GET() {
  const pricingPlans = [
    {
      id: "free-trial",
      name: "Free Trial",
      price: "0",
      currency: "USD",
      period: "14 days",
      description: "Perfect for trying out our platform",
      features: [
        "Full access to all features",
        "Up to 10 users",
        "Basic support",
        "Standard templates",
        "Mobile app access"
      ],
      popular: false,
      cta: "Start Free Trial",
      color: "bg-gray-100 dark:bg-gray-700"
    },
    {
      id: "monthly",
      name: "Monthly Plan",
      price: "29",
      currency: "USD",
      period: "per month",
      description: "Ideal for growing organizations",
      features: [
        "Unlimited users",
        "Advanced analytics",
        "Priority support",
        "Custom templates",
        "API access",
        "Advanced security"
      ],
      popular: true,
      cta: "Choose Monthly",
      color: "bg-yellow-50 dark:bg-yellow-900/20"
    },
    {
      id: "yearly",
      name: "Yearly Plan",
      price: "290",
      currency: "USD",
      period: "per year",
      description: "Best value for established teams",
      features: [
        "Everything in Monthly",
        "2 months free",
        "Dedicated account manager",
        "Custom integrations",
        "White-label options",
        "24/7 phone support"
      ],
      popular: false,
      cta: "Choose Yearly",
      color: "bg-gray-100 dark:bg-gray-700"
    }
  ]

  const response = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "CaseSnap Pricing Plans",
    "description": "Affordable pricing plans for CaseSnap legal case management software",
    "numberOfItems": pricingPlans.length,
    "itemListElement": pricingPlans.map((plan, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Offer",
        "name": plan.name,
        "description": plan.description,
        "price": plan.price,
        "priceCurrency": plan.currency,
        "priceSpecification": {
          "@type": "PriceSpecification",
          "price": plan.price,
          "priceCurrency": plan.currency,
          "billingDuration": plan.period
        },
        "availability": "https://schema.org/InStock",
        "validFrom": "2024-01-01",
        "validThrough": "2025-12-31",
        "category": "Software Subscription",
        "itemOffered": {
          "@type": "SoftwareApplication",
          "name": "CaseSnap",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web Browser"
        },
        "includesObject": {
          "@type": "ItemList",
          "name": "Features",
          "itemListElement": plan.features.map((feature, featureIndex) => ({
            "@type": "ListItem",
            "position": featureIndex + 1,
            "item": {
              "@type": "Text",
              "value": feature
            }
          }))
        },
        "seller": {
          "@type": "Organization",
          "name": "CaseSnap",
          "url": "https://casesnap.com"
        }
      }
    }))
  }

  return NextResponse.json(response, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}
