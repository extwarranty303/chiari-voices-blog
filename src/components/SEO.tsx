import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

const SEO: React.FC<SEOProps> = ({
  title,
  description = "A blog for the Chiari Malformation community.",
  keywords = [],
  image,
  url,
  type = 'website'
}) => {
  const siteTitle = "Chiari Voices Blog";
  const fullTitle = `${title} | ${siteTitle}`;
  const currentUrl = url || window.location.href;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};

export default SEO;
