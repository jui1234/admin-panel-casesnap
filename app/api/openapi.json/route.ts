import { NextResponse } from 'next/server'

export async function GET() {
  const openApiSpec = {
    "openapi": "3.0.0",
    "info": {
      "title": "CaseSnap API",
      "description": "API for CaseSnap legal case management software. Provides structured data for AI crawling, SEO optimization, and application metadata.",
      "version": "1.0.0",
      "contact": {
        "name": "CaseSnap Support",
        "email": "support@casesnap.com",
        "url": "https://casesnap.com/contact"
      },
      "license": {
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT"
      }
    },
    "servers": [
      {
        "url": "https://casesnap.com",
        "description": "Production server"
      },
      {
        "url": "http://localhost:3000",
        "description": "Development server"
      }
    ],
    "paths": {
      "/api/seo": {
        "get": {
          "summary": "Get SEO and application metadata",
          "description": "Returns structured SEO data and application metadata in JSON-LD format for AI crawling and search engine optimization.",
          "tags": ["SEO", "Metadata"],
          "responses": {
            "200": {
              "description": "Successful response",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/SEOData"
                  }
                }
              }
            }
          }
        }
      },
      "/api/features": {
        "get": {
          "summary": "Get software features",
          "description": "Returns comprehensive list of software features with detailed descriptions and benefits.",
          "tags": ["Features"],
          "responses": {
            "200": {
              "description": "Successful response",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/FeaturesData"
                  }
                }
              }
            }
          }
        }
      },
      "/api/pricing": {
        "get": {
          "summary": "Get pricing plans",
          "description": "Returns pricing plans and subscription options with detailed feature lists.",
          "tags": ["Pricing"],
          "responses": {
            "200": {
              "description": "Successful response",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PricingData"
                  }
                }
              }
            }
          }
        }
      },
      "/api/docs": {
        "get": {
          "summary": "Get API documentation",
          "description": "Returns this API documentation in structured format.",
          "tags": ["Documentation"],
          "responses": {
            "200": {
              "description": "Successful response",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/APIDocumentation"
                  }
                }
              }
            }
          }
        }
      },
      "/sitemap.xml": {
        "get": {
          "summary": "Get XML sitemap",
          "description": "Returns XML sitemap for search engines and crawlers.",
          "tags": ["SEO"],
          "responses": {
            "200": {
              "description": "Successful response",
              "content": {
                "application/xml": {
                  "schema": {
                    "type": "string",
                    "format": "xml"
                  }
                }
              }
            }
          }
        }
      }
    },
    "components": {
      "schemas": {
        "SEOData": {
          "type": "object",
          "properties": {
            "@context": {
              "type": "string",
              "example": "https://schema.org"
            },
            "@type": {
              "type": "string",
              "example": "SoftwareApplication"
            },
            "name": {
              "type": "string",
              "example": "CaseSnap"
            },
            "description": {
              "type": "string",
              "example": "Best Lawyer Case Management Software for Law Firms in India"
            },
            "url": {
              "type": "string",
              "example": "https://casesnap.com"
            },
            "applicationCategory": {
              "type": "string",
              "example": "BusinessApplication"
            },
            "operatingSystem": {
              "type": "string",
              "example": "Web Browser"
            },
            "offers": {
              "$ref": "#/components/schemas/Offer"
            },
            "aggregateRating": {
              "$ref": "#/components/schemas/AggregateRating"
            },
            "author": {
              "$ref": "#/components/schemas/Organization"
            },
            "publisher": {
              "$ref": "#/components/schemas/Organization"
            },
            "keywords": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "featureList": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          }
        },
        "FeaturesData": {
          "type": "object",
          "properties": {
            "@context": {
              "type": "string",
              "example": "https://schema.org"
            },
            "@type": {
              "type": "string",
              "example": "ItemList"
            },
            "name": {
              "type": "string",
              "example": "CaseSnap Features"
            },
            "description": {
              "type": "string",
              "example": "Complete list of features available in CaseSnap"
            },
            "numberOfItems": {
              "type": "integer"
            },
            "itemListElement": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/FeatureItem"
              }
            }
          }
        },
        "PricingData": {
          "type": "object",
          "properties": {
            "@context": {
              "type": "string",
              "example": "https://schema.org"
            },
            "@type": {
              "type": "string",
              "example": "ItemList"
            },
            "name": {
              "type": "string",
              "example": "CaseSnap Pricing Plans"
            },
            "description": {
              "type": "string",
              "example": "Affordable pricing plans for CaseSnap"
            },
            "numberOfItems": {
              "type": "integer"
            },
            "itemListElement": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/PricingItem"
              }
            }
          }
        },
        "APIDocumentation": {
          "type": "object",
          "properties": {
            "@context": {
              "type": "string",
              "example": "https://schema.org"
            },
            "@type": {
              "type": "string",
              "example": "APIReference"
            },
            "name": {
              "type": "string",
              "example": "CaseSnap API Documentation"
            },
            "description": {
              "type": "string",
              "example": "Complete API documentation for CaseSnap"
            },
            "url": {
              "type": "string",
              "example": "https://casesnap.com/api/docs"
            },
            "version": {
              "type": "string",
              "example": "1.0.0"
            },
            "endpoints": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/APIEndpoint"
              }
            }
          }
        },
        "Offer": {
          "type": "object",
          "properties": {
            "@type": {
              "type": "string",
              "example": "Offer"
            },
            "price": {
              "type": "string",
              "example": "29"
            },
            "priceCurrency": {
              "type": "string",
              "example": "USD"
            },
            "priceValidUntil": {
              "type": "string",
              "example": "2025-12-31"
            },
            "availability": {
              "type": "string",
              "example": "https://schema.org/InStock"
            }
          }
        },
        "AggregateRating": {
          "type": "object",
          "properties": {
            "@type": {
              "type": "string",
              "example": "AggregateRating"
            },
            "ratingValue": {
              "type": "string",
              "example": "4.8"
            },
            "ratingCount": {
              "type": "string",
              "example": "500"
            },
            "bestRating": {
              "type": "string",
              "example": "5"
            },
            "worstRating": {
              "type": "string",
              "example": "1"
            }
          }
        },
        "Organization": {
          "type": "object",
          "properties": {
            "@type": {
              "type": "string",
              "example": "Organization"
            },
            "name": {
              "type": "string",
              "example": "CaseSnap"
            },
            "url": {
              "type": "string",
              "example": "https://casesnap.com"
            }
          }
        },
        "FeatureItem": {
          "type": "object",
          "properties": {
            "@type": {
              "type": "string",
              "example": "ListItem"
            },
            "position": {
              "type": "integer"
            },
            "item": {
              "type": "object",
              "properties": {
                "@type": {
                  "type": "string",
                  "example": "SoftwareFeature"
                },
                "name": {
                  "type": "string"
                },
                "description": {
                  "type": "string"
                },
                "category": {
                  "type": "string"
                },
                "benefits": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "targetAudience": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "identifier": {
                  "type": "string"
                }
              }
            }
          }
        },
        "PricingItem": {
          "type": "object",
          "properties": {
            "@type": {
              "type": "string",
              "example": "ListItem"
            },
            "position": {
              "type": "integer"
            },
            "item": {
              "type": "object",
              "properties": {
                "@type": {
                  "type": "string",
                  "example": "Offer"
                },
                "name": {
                  "type": "string"
                },
                "description": {
                  "type": "string"
                },
                "price": {
                  "type": "string"
                },
                "priceCurrency": {
                  "type": "string"
                },
                "priceSpecification": {
                  "type": "object",
                  "properties": {
                    "@type": {
                      "type": "string",
                      "example": "PriceSpecification"
                    },
                    "price": {
                      "type": "string"
                    },
                    "priceCurrency": {
                      "type": "string"
                    },
                    "billingDuration": {
                      "type": "string"
                    }
                  }
                },
                "availability": {
                  "type": "string",
                  "example": "https://schema.org/InStock"
                }
              }
            }
          }
        },
        "APIEndpoint": {
          "type": "object",
          "properties": {
            "@type": {
              "type": "string",
              "example": "APIEndpoint"
            },
            "name": {
              "type": "string"
            },
            "url": {
              "type": "string"
            },
            "method": {
              "type": "string",
              "example": "GET"
            },
            "description": {
              "type": "string"
            },
            "responseFormat": {
              "type": "string",
              "example": "application/json"
            }
          }
        }
      }
    },
    "tags": [
      {
        "name": "SEO",
        "description": "SEO and metadata endpoints"
      },
      {
        "name": "Features",
        "description": "Software features and capabilities"
      },
      {
        "name": "Pricing",
        "description": "Pricing plans and offers"
      },
      {
        "name": "Documentation",
        "description": "API documentation and reference"
      }
    ]
  }

  return NextResponse.json(openApiSpec, {
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
