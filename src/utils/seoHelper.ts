import { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
  categoryName?: string;
  toolName?: string;
  schemaType?: 'WebApplication' | 'SoftwareApplication';
}

const DEFAULT_TITLE = 'Nexora Tools • Free Photo, ID Card, PDF & Print Workstation';
const DEFAULT_DESC =
  '100% Free online workstation for passport photo maker (35x45mm), Aadhaar & ID card front+back merger on A4 sheet, exact 20KB/50KB image compressor, AI background remover, and PDF security tools. Zero watermarks, runs in browser RAM.';
const DEFAULT_KEYWORDS =
  'passport photo maker online, bg remover, remove background free, pdf to jpg, jpg to pdf, merge pdf, compress pdf, id card merger a4, exact 20kb image compressor, signature resize, free cyber cafe tools, csc center printing tools, nexora tools';

export const updatePageSEO = ({
  title,
  description,
  keywords,
  canonicalPath = '/',
  categoryName = 'Online Tools',
  toolName,
  schemaType = 'WebApplication',
}: SEOProps) => {
  const fullTitle = title
    ? `${title} • Nexora Tools`
    : DEFAULT_TITLE;
  const fullDesc = description || DEFAULT_DESC;
  const fullKeywords = keywords || DEFAULT_KEYWORDS;
  const canonicalUrl = `https://nexoratools.com${canonicalPath.startsWith('/') ? canonicalPath : '/' + canonicalPath}`;

  // 1. Update Title
  document.title = fullTitle;

  // 2. Update Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', fullDesc);

  // 3. Update Meta Keywords
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta');
    metaKeywords.setAttribute('name', 'keywords');
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.setAttribute('content', fullKeywords);

  // 4. Update Canonical Tag
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', canonicalUrl);

  // 5. Update OpenGraph Tags
  const setMetaProperty = (property: string, content: string) => {
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMetaProperty('og:title', fullTitle);
  setMetaProperty('og:description', fullDesc);
  setMetaProperty('og:url', canonicalUrl);
  setMetaProperty('og:type', 'website');
  setMetaProperty('og:site_name', 'Nexora Tools');
  setMetaProperty('og:image', 'https://nexoratools.com/favicon.svg');

  // 6. Update Twitter Tags
  const setMetaName = (name: string, content: string) => {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMetaName('twitter:card', 'summary_large_image');
  setMetaName('twitter:title', fullTitle);
  setMetaName('twitter:description', fullDesc);
  setMetaName('twitter:image', 'https://nexoratools.com/favicon.svg');
  setMetaName('twitter:url', canonicalUrl);

  // 7. Inject Dynamic JSON-LD Structured Data for Google Rich Snippets & Direct Sitelinks
  let schemaScript = document.getElementById('dynamic-tool-jsonld');
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.id = 'dynamic-tool-jsonld';
    schemaScript.setAttribute('type', 'application/ld+json');
    document.head.appendChild(schemaScript);
  }

  const cleanToolName = toolName || (title ? title.split('•')[0].trim() : 'Nexora Tools');

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': schemaType,
        name: cleanToolName,
        url: canonicalUrl,
        applicationCategory: categoryName,
        operatingSystem: 'All (Web Browser, Windows, Mac, Android, iOS)',
        description: fullDesc,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        browserRequirements: 'Requires JavaScript. Requires HTML5 Canvas.',
        softwareRequirements: 'Web Browser with HTML5 & WebAssembly support.',
        featureList: [
          'Zero Server Uploads (100% Client-Side Privacy)',
          'High Resolution 300 DPI Processing',
          'Zero Watermark and Instant Download',
        ],
        creator: {
          '@type': 'Organization',
          name: 'Nexora Lab Technologies',
          url: 'https://nexoratools.com',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://nexoratools.com/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: categoryName,
            item: canonicalUrl,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: cleanToolName,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  schemaScript.textContent = JSON.stringify(jsonLdData);
};

export const usePageSEO = (props: SEOProps) => {
  useEffect(() => {
    updatePageSEO(props);
  }, [
    props.title,
    props.description,
    props.keywords,
    props.canonicalPath,
    props.categoryName,
    props.toolName,
    props.schemaType,
  ]);
};
