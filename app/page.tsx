'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { 
  Shield, 
  Users, 
  BarChart3, 
  FileText, 
  UserCheck, 
  Settings, 
  User, 
  Bell, 
  Receipt, 
  CalendarCheck, 
  ArrowRight,
  Star
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import ThemeToggle from '@/components/ThemeToggle'

export default function DemoPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { isAuthenticated, isLoading } = useAuth()
  const isDark = theme === 'dark'

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      // If still loading after 5 seconds, assume no authentication
      if (isLoading) {
        console.log('Authentication check timeout - proceeding without auth')
      }
    }, 5000)

    return () => clearTimeout(timeout)
  }, [isLoading])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${isDark ? 'dark bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-50 via-white to-yellow-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-yellow-500 dark:to-yellow-600 rounded-full flex items-center justify-center mb-6">
            <Shield className="h-8 w-8 text-yellow-400 dark:text-gray-900 animate-pulse" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading CaseSnap...</p>
        </div>
      </div>
    )
  }

  const features = [
    {
      icon: <User className="w-8 h-8" />,
      title: "Client Detail",
      description:
        "Centralized client profiles with personal details, case history, and secure document storage for efficient legal case management."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Legal Case Management",
      description:
        "Advanced case tracking software for lawyers with role-based access control and secure document management for advocates"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Client Management System",
      description:
        "Comprehensive client administration with detailed case profiles and legal practice management for law firms"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Legal Analytics Dashboard",
      description:
        "Real-time insights and performance metrics for law firm management software with case progress tracking"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Court Case Management",
      description:
        "Professional case tracking software for lawyers with court calendar integration, daily case reminders, and smart notifications via Google Calendar or our in-app calendar."
    },
    {
      icon: <Receipt className="w-8 h-8" />,
      title: "Fees Related Details",
      description:
        "Track client payments, outstanding balances, and fee history with automated billing records for transparent financial management."
    },
    {
      icon: <CalendarCheck className="w-8 h-8" />,
      title: "Next Date Reminder",
      description:
        "Automated reminders sent one day prior to hearings or tasks, with the option to download schedules in PDF or Excel format."
    },
    {
      icon: <UserCheck className="w-8 h-8" />,
      title: "Legal Team Portal",
      description:
        "Dedicated advocate admin panel with employee management and legal calendar for task management"
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Legal Billing Software",
      description:
        "Cloud-based legal management system with billing, invoicing, and document management for lawyers"
    }
  ];

  const stats = [
    { label: "Lawyers Using CaseSnap", value: "2,500+" },
    { label: "Legal Cases Managed", value: "15,000+" },
    { label: "Law Firms in India", value: "500+" },
    { label: "System Uptime", value: "99.9%" }
  ]

  const pricingPlans = [
    {
      name: "Free Trial",
      price: "Free",
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
      name: "Monthly Plan",
      price: "$29",
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
      name: "Yearly Plan",
      price: "$290",
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

  // Structured data for AI crawling
  const structuredData = {
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
    <>
      {/* Structured Data for AI Crawling */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
    <div className={`min-h-screen transition-all duration-500 ${isDark ? 'dark bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-50 via-white to-yellow-50'}`}>
      {/* Header */}
      <header className="relative z-10 animate-fade-in">
        <nav className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 animate-slide-in-left">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 animate-pulse" />
              <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">CaseSnap</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 animate-slide-in-right">
              <ThemeToggle size="sm" className="sm:hidden" />
              <ThemeToggle className="hidden sm:block" />
              <button
                onClick={() => router.push('/auth/login')}
                className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base hover:scale-105 hover:shadow-lg cursor-pointer"
              >
                <span className="hidden sm:inline">Login</span>
                <span className="sm:hidden">Login</span>
              </button>
              <button
                onClick={() => router.push('/get-started')}
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-3 py-2 sm:px-6 sm:py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base hover:scale-105 hover:shadow-lg cursor-pointer"
              >
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight animate-fade-in-up">
            Best Lawyer Case Management Software
            <span className="text-yellow-500 block animate-pulse">for Law Firms in India</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 sm:px-0 animate-fade-in-up animation-delay-200">
            Professional legal practice management system with cloud-based case tracking, document management, and billing software. Trusted by 500+ law firms across India for secure advocate admin panel operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0 animate-fade-in-up animation-delay-400">
            <button
              onClick={() => router.push('/get-started')}
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 flex items-center justify-center space-x-2 w-full sm:w-auto hover:scale-105 hover:shadow-xl group cursor-pointer"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => router.push('/auth/login')}
              className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 w-full sm:w-auto hover:scale-105 hover:shadow-lg cursor-pointer"
            >
              Login to Existing Account
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in-up group" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-500 mb-1 sm:mb-2 transition-transform duration-300 group-hover:scale-110">{stat.value}</div>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4 sm:px-0">
              Complete Legal Practice Management System for Law Firms
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4 sm:px-0">
              Affordable lawyer management software India with cloud-based legal management system designed to streamline law firm operations and boost lawyer productivity.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 hover:scale-105 hover:border-yellow-500/30 group animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="text-yellow-500 mb-3 sm:mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">{feature.icon}</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors duration-300">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4 sm:px-0">
              Affordable Lawyer Management Software Plans
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4 sm:px-0">
              Start with a free trial of our legal case tracking software, then choose the plan that fits your law firm's needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative ${plan.color} p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${plan.popular ? 'border-yellow-500 dark:border-yellow-400 scale-105' : 'border-gray-200/50 dark:border-gray-700/50'} hover:scale-105 group animate-fade-in-up`} style={{ animationDelay: `${index * 200}ms` }}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-500 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl sm:text-4xl font-bold text-yellow-500">{plan.price}</span>
                    <span className="text-gray-600 dark:text-gray-400 ml-1">{plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm sm:text-base text-gray-700 dark:text-gray-300">
                      <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <svg className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => router.push('/get-started')}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 cursor-pointer ${
                    plan.popular
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900 hover:scale-105 hover:shadow-lg'
                      : 'bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white hover:scale-105 hover:shadow-lg'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 px-4 sm:px-0">
              Trusted by Law Firms and Lawyers Across India
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: "Advocate Rajesh Kumar",
                role: "Senior Partner",
                company: "Kumar & Associates Law Firm",
                content: "CaseSnap has revolutionized our legal case management process. The secure document management for advocates gives us complete peace of mind.",
                rating: 5
              },
              {
                name: "Dr. Priya Sharma",
                role: "Managing Partner", 
                company: "Sharma Legal Services",
                content: "The legal analytics dashboard provides insights we never had before. Our law firm productivity has increased by 40% with this case tracking software for lawyers.",
                rating: 5
              },
              {
                name: "Advocate Amit Patel",
                role: "Founder",
                company: "Patel & Co. Advocates",
                content: "This affordable lawyer management software India has made client management effortless. The advocate admin panel interface is intuitive and perfect for our legal practice management needs.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group animate-fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="flex mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-current transition-transform duration-300 group-hover:scale-110" style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">{testimonial.name}</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{testimonial.role}, {testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 px-4 sm:px-0">
              Ready to Transform Your Law Firm with Best Legal Practice Management System?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 px-4 sm:px-0">
              Join 500+ law firms already using CaseSnap's cloud-based legal management system to streamline their legal operations and case management.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <button
                onClick={() => router.push('/get-started')}
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 flex items-center justify-center space-x-2 w-full sm:w-auto hover:scale-105 hover:shadow-xl group cursor-pointer"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => router.push('/auth/login')}
                className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 w-full sm:w-auto hover:scale-105 hover:shadow-lg cursor-pointer"
              >
                Login to Existing Account
              </button>
            </div>
          </div>
        </div>
      </section>
      

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2 lg:col-span-1 animate-fade-in-up">
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 animate-pulse" />
                <span className="text-lg sm:text-xl font-bold">CaseSnap</span>
              </div>
              <p className="text-sm sm:text-base text-gray-400">
                Best lawyer case management software for law firms in India. Cloud-based legal practice management system with case tracking, document management, and billing software for advocates.
              </p>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h3>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block cursor-pointer">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block cursor-pointer">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block cursor-pointer">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block cursor-pointer">Integrations</a></li>
              </ul>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block cursor-pointer">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block cursor-pointer">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block cursor-pointer">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block cursor-pointer">Contact</a></li>
              </ul>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h3>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block cursor-pointer">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block cursor-pointer">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block cursor-pointer">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block cursor-pointer">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm sm:text-base text-gray-400 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <p>&copy; 2024 CaseSnap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
} 