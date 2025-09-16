import { NextResponse } from 'next/server'

export async function GET() {
  const features = [
    {
      id: "client-management",
      name: "Client Detail Management",
      description: "Centralized client profiles with personal details, case history, and secure document storage for efficient legal case management.",
      category: "Client Management",
      benefits: [
        "Complete client profiles",
        "Case history tracking",
        "Secure document storage",
        "Contact management"
      ],
      targetAudience: ["Lawyers", "Legal Professionals", "Law Firms"]
    },
    {
      id: "case-management",
      name: "Secure Legal Case Management",
      description: "Advanced case tracking software for lawyers with role-based access control and secure document management for advocates.",
      category: "Case Management",
      benefits: [
        "Role-based access control",
        "Secure document management",
        "Case progress tracking",
        "Team collaboration"
      ],
      targetAudience: ["Advocates", "Law Firms", "Legal Teams"]
    },
    {
      id: "client-system",
      name: "Client Management System",
      description: "Comprehensive client administration with detailed case profiles and legal practice management for law firms.",
      category: "Client Management",
      benefits: [
        "Detailed case profiles",
        "Client administration",
        "Practice management",
        "Relationship tracking"
      ],
      targetAudience: ["Law Firms", "Legal Practices"]
    },
    {
      id: "analytics",
      name: "Legal Analytics Dashboard",
      description: "Real-time insights and performance metrics for law firm management software with case progress tracking.",
      category: "Analytics",
      benefits: [
        "Real-time insights",
        "Performance metrics",
        "Case progress tracking",
        "Business intelligence"
      ],
      targetAudience: ["Law Firm Partners", "Managing Partners", "Administrators"]
    },
    {
      id: "court-management",
      name: "Court Case Management",
      description: "Professional case tracking software for lawyers with court calendar integration, daily case reminders, and smart notifications via Google Calendar or our in-app calendar.",
      category: "Court Management",
      benefits: [
        "Court calendar integration",
        "Daily case reminders",
        "Smart notifications",
        "Calendar synchronization"
      ],
      targetAudience: ["Lawyers", "Legal Assistants", "Court Representatives"]
    },
    {
      id: "billing",
      name: "Fees Related Details",
      description: "Track client payments, outstanding balances, and fee history with automated billing records for transparent financial management.",
      category: "Billing",
      benefits: [
        "Payment tracking",
        "Outstanding balance management",
        "Fee history",
        "Automated billing"
      ],
      targetAudience: ["Law Firms", "Billing Managers", "Accountants"]
    },
    {
      id: "reminders",
      name: "Next Date Reminder",
      description: "Automated reminders sent one day prior to hearings or tasks, with the option to download schedules in PDF or Excel format.",
      category: "Task Management",
      benefits: [
        "Automated reminders",
        "Schedule downloads",
        "PDF/Excel export",
        "Task notifications"
      ],
      targetAudience: ["Lawyers", "Legal Assistants", "Paralegals"]
    },
    {
      id: "team-portal",
      name: "Legal Team Portal",
      description: "Dedicated advocate admin panel with employee management and legal calendar for task management.",
      category: "Team Management",
      benefits: [
        "Employee management",
        "Legal calendar",
        "Task management",
        "Team collaboration"
      ],
      targetAudience: ["Law Firm Administrators", "HR Managers", "Team Leaders"]
    },
    {
      id: "billing-software",
      name: "Legal Billing Software",
      description: "Cloud-based legal management system with billing, invoicing, and document management for lawyers.",
      category: "Billing",
      benefits: [
        "Cloud-based system",
        "Billing and invoicing",
        "Document management",
        "Financial tracking"
      ],
      targetAudience: ["Law Firms", "Billing Departments", "Financial Managers"]
    }
  ]

  const response = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "CaseSnap Features",
    "description": "Complete list of features available in CaseSnap legal case management software",
    "numberOfItems": features.length,
    "itemListElement": features.map((feature, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "SoftwareFeature",
        "name": feature.name,
        "description": feature.description,
        "category": feature.category,
        "benefits": feature.benefits,
        "targetAudience": feature.targetAudience,
        "identifier": feature.id
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
