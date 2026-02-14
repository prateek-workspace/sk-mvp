import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  noindex?: boolean;
  schemaMarkup?: object;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Student Prep Hub - Find Best Coaching, PG, Hostels, Libraries & Tiffin Services',
  description = 'Discover and book verified coaching centers, PG accommodations, hostels, tiffin services, and libraries across 30+ cities in India. Join 2000+ students on India\'s largest student rental platform.',
  keywords = 'coaching centers, PG accommodation, student hostels, tiffin services, libraries, student preparation, exam coaching, affordable PG',
  ogImage = 'https://skstudentpath.com/og-image.jpg',
  ogType = 'website',
  canonical,
  noindex = false,
  schemaMarkup,
}) => {
  const siteUrl = 'https://skstudentpath.com/';
  const currentUrl = canonical || `${siteUrl}${window.location.pathname}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Student Prep Hub" />

      {/* Twitter
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} /> */}

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Schema.org Structured Data */}
      {schemaMarkup && (
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;