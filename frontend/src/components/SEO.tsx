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
  location?: string;
  category?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Student Prep Hub Kanpur | Best Coaching, PG, Hostels, Libraries & Tiffin Services in Kanpur',
  description = 'Find verified coaching centers, PG accommodations, hostels, tiffin services, and libraries in Kanpur, UP. Kanpur\'s #1 student services platform. List your services or find the best facilities near IIT Kanpur, CSJM University, HBTU & more.',
  keywords = 'coaching centers Kanpur, PG in Kanpur, hostels near IIT Kanpur, tiffin services Kanpur, libraries Kanpur, student accommodation Kanpur, PG near CSJM University, coaching classes Kidwai Nagar, PG Kakadeo Kanpur, student housing Kalyanpur, Kanpur student services, list your PG Kanpur, register coaching center Kanpur, Uttar Pradesh student platform',
  ogImage = 'https://skstudentpath.com/og-image.jpg',
  ogType = 'website',
  canonical,
  noindex = false,
  schemaMarkup,
  location,
  category,
}) => {
  const siteUrl = 'https://skstudentpath.com';
  const currentUrl = canonical || `${siteUrl}${window.location.pathname}${window.location.search}`;

  // Dynamic title based on location and category
  let dynamicTitle = title;
  let dynamicDescription = description;
  
  if (category && location) {
    dynamicTitle = `Best ${category} in ${location}, Kanpur | Student Prep Hub`;
    dynamicDescription = `Find top-rated ${category} services in ${location}, Kanpur. Verified listings, genuine reviews, easy booking. Kanpur's trusted student platform.`;
  } else if (category) {
    dynamicTitle = `Best ${category} in Kanpur | Student Prep Hub`;
    dynamicDescription = `Discover verified ${category} services in Kanpur, UP. Compare prices, read reviews, book instantly. Trusted by 2000+ students.`;
  } else if (location) {
    dynamicTitle = `Student Services in ${location}, Kanpur | Coaching, PG, Hostels`;
    dynamicDescription = `Find coaching centers, PGs, hostels, libraries & tiffin services in ${location}, Kanpur. All verified listings with reviews.`;
  }

  // LocalBusiness schema for Kanpur
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Student Prep Hub",
    "description": "Kanpur's leading platform for student services - coaching centers, PG accommodations, hostels, libraries, and tiffin services",
    "url": siteUrl,
    "logo": "https://skstudentpath.com/logo.png",
    "image": ogImage,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Kanpur",
      "addressRegion": "Uttar Pradesh",
      "addressCountry": "IN",
      "postalCode": "208001"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "26.4499",
      "longitude": "80.3319"
    },
    "areaServed": {
      "@type": "City",
      "name": "Kanpur",
      "containedInPlace": {
        "@type": "State",
        "name": "Uttar Pradesh"
      }
    },
    "priceRange": "₹₹",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    }
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{dynamicTitle}</title>
      <meta name="title" content={dynamicTitle} />
      <meta name="description" content={dynamicDescription} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Geo Meta Tags for Kanpur */}
      <meta name="geo.region" content="IN-UP" />
      <meta name="geo.placename" content="Kanpur" />
      <meta name="geo.position" content="26.4499;80.3319" />
      <meta name="ICBM" content="26.4499, 80.3319" />
      
      {/* Language & Locale */}
      <meta name="language" content="English" />
      <meta httpEquiv="content-language" content="en-IN" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={dynamicTitle} />
      <meta property="og:description" content={dynamicDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Student Prep Hub Kanpur" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={dynamicTitle} />
      <meta name="twitter:description" content={dynamicDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* LocalBusiness Schema */}
      <script type="application/ld+json">
        {JSON.stringify(localBusinessSchema)}
      </script>

      {/* Additional Schema.org Structured Data */}
      {schemaMarkup && (
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;