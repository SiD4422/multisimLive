import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string | string[];
  name?: string;
  type?: string;
  url?: string;
  image?: string;
  imageAlt?: string;
  canonical?: string;
  noindex?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  faqs?: FAQItem[];
  schema?: Record<string, any> | Array<Record<string, any>>;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

const DEFAULT_IMAGE = 'https://www.nodesimapp.com/og-image.png';
const DEFAULT_IMAGE_ALT = 'NodeSim Online SPICE Circuit Simulator with Schematic Capture and Real-Time Waveform Grapher';
const BASE_URL = 'https://www.nodesimapp.com';

export default function SEO({ 
  title, 
  description, 
  keywords,
  name = "NodeSim", 
  type = "website", 
  url = "https://www.nodesimapp.com",
  image = DEFAULT_IMAGE,
  imageAlt = DEFAULT_IMAGE_ALT,
  canonical,
  noindex = false,
  breadcrumbs,
  faqs,
  schema,
  publishedTime,
  modifiedTime,
  author = "NodeSim"
}: SEOProps) {
  // Normalize canonical URL to always include www and trim trailing slashes except root
  const rawCanonical = canonical || url;
  const normalizedCanonical = rawCanonical.startsWith('http') 
    ? rawCanonical.replace('https://www.nodesimapp.com', BASE_URL).replace('https://www.nodesimapp.com', BASE_URL)
    : `${BASE_URL}${rawCanonical.startsWith('/') ? '' : '/'}${rawCanonical}`;

  const formattedKeywords = Array.isArray(keywords) ? keywords.join(', ') : keywords;

  // Generate BreadcrumbList JSON-LD if breadcrumbs provided
  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.path.startsWith('http') ? item.path : `${BASE_URL}${item.path.startsWith('/') ? '' : '/'}${item.path}`
    }))
  } : null;

  // Generate FAQPage JSON-LD if faqs provided
  const faqSchema = faqs && faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {formattedKeywords && <meta name="keywords" content={formattedKeywords} />}
      <meta name="author" content={author} />
      
      {/* Robots Directive */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      
      {/* Canonical Link */}
      <link rel="canonical" href={normalizedCanonical} />

      {/* Open Graph / Facebook tags for rich social sharing */}
      <meta property="og:site_name" content={name} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={normalizedCanonical} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={imageAlt} />

      {/* Article specific metadata */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@nodesim" />
      <meta name="twitter:creator" content="@nodesim" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={imageAlt} />

      {/* Structured Data: Breadcrumbs */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}

      {/* Structured Data: FAQ */}
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}

      {/* Custom Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
