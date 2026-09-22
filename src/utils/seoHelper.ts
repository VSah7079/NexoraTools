import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
}

const DEFAULT_TITLE = 'Nexora Tools • Free Photo, ID Card, PDF & Print Utility Suite';
const DEFAULT_DESC =
  '100% Free online photo, ID card, PDF and document utility platform by Nexora Lab Technologies. Background remover, passport photo maker, ID card merger, document scanner, and print sheets with zero watermark and complete privacy.';

export const updatePageSEO = ({
  title,
  description,
  keywords,
  canonicalPath,
}: SEOProps) => {
  // 1. Update Title
  const fullTitle = title
    ? `${title} • Nexora Tools`
    : DEFAULT_TITLE;
  document.title = fullTitle;

  // 2. Update Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description || DEFAULT_DESC);

  // 3. Update Meta Keywords if provided
  if (keywords) {
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);
  }

  // 4. Update OpenGraph Title & Description
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', fullTitle);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', description || DEFAULT_DESC);

  // 5. Update Canonical Tag
  if (canonicalPath) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://nexoratools.com${canonicalPath}`);
  }
};

export const usePageSEO = (props: SEOProps) => {
  useEffect(() => {
    updatePageSEO(props);
  }, [props.title, props.description, props.keywords, props.canonicalPath]);
};
