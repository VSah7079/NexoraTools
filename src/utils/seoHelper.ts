import { useEffect } from 'react';
import type { RouteSEOConfig, GlobalSEOSettings } from '../types/admin';

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

// Helper to retrieve live SEO override from LocalStorage
function getDynamicSEOSettings(pathname: string): { routeSEO?: RouteSEOConfig; globalSEO?: GlobalSEOSettings } {
  try {
    const raw = localStorage.getItem('nexora_site_config_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
      const routeSEO = parsed.seoRoutes?.[cleanPath];
      const globalSEO = parsed.globalSEO;
      return { routeSEO, globalSEO };
    }
  } catch (e) {
    // Ignore error
  }
  return {};
}

export const updatePageSEO = ({
  title,
  description,
  keywords,
  canonicalPath = typeof window !== 'undefined' ? window.location.pathname : '/',
  categoryName = 'Online Tools',
  toolName,
  schemaType = 'WebApplication',
}: SEOProps) => {
  const currentPath = canonicalPath.startsWith('/') ? canonicalPath : '/' + canonicalPath;
  const { routeSEO, globalSEO } = getDynamicSEOSettings(currentPath);

  const effectiveTitle = routeSEO?.title || title;
  const effectiveDesc = routeSEO?.description || description || globalSEO?.defaultDescription || DEFAULT_DESC;
  const effectiveKeywords = routeSEO?.keywords || keywords || globalSEO?.defaultKeywords || DEFAULT_KEYWORDS;
  const effectiveCanonical = routeSEO?.canonicalUrl || `https://nexoratools.com${currentPath === '/' ? '' : currentPath}`;

  const siteName = globalSEO?.siteName || 'Nexora Tools';
  const fullTitle = effectiveTitle
    ? (effectiveTitle.includes(siteName) ? effectiveTitle : `${effectiveTitle} • ${siteName}`)
    : (globalSEO?.defaultDescription ? `${siteName} • Free Workstation` : DEFAULT_TITLE);

  // 1. Update Title
  document.title = fullTitle;

  // 2. Update Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', effectiveDesc);

  // 3. Update Meta Keywords
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta');
    metaKeywords.setAttribute('name', 'keywords');
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.setAttribute('content', effectiveKeywords);

  // 4. Update Canonical Tag
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', effectiveCanonical);

  // 5. Update Robots meta tag if customized
  if (routeSEO?.robots) {
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', routeSEO.robots);
  }

  // 6. Global Webmaster / Analytics Verifications
  if (globalSEO?.googleVerificationId) {
    let gMeta = document.querySelector('meta[name="google-site-verification"]');
    if (!gMeta) {
      gMeta = document.createElement('meta');
      gMeta.setAttribute('name', 'google-site-verification');
      document.head.appendChild(gMeta);
    }
    gMeta.setAttribute('content', globalSEO.googleVerificationId);
  }

  if (globalSEO?.bingVerificationId) {
    let bMeta = document.querySelector('meta[name="msvalidate.01"]');
    if (!bMeta) {
      bMeta = document.createElement('meta');
      bMeta.setAttribute('name', 'msvalidate.01');
      document.head.appendChild(bMeta);
    }
    bMeta.setAttribute('content', globalSEO.bingVerificationId);
  }

  // 7. Update OpenGraph Tags
  const setMetaProperty = (property: string, content: string) => {
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  const ogImage = routeSEO?.ogImage || 'https://nexoratools.com/favicon.svg';

  setMetaProperty('og:title', fullTitle);
  setMetaProperty('og:description', effectiveDesc);
  setMetaProperty('og:url', effectiveCanonical);
  setMetaProperty('og:type', 'website');
  setMetaProperty('og:site_name', siteName);
  setMetaProperty('og:image', ogImage);

  // 8. Update Twitter Tags
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
  setMetaName('twitter:description', effectiveDesc);
  setMetaName('twitter:image', ogImage);
  setMetaName('twitter:url', effectiveCanonical);

  // 9. Dynamic JSON-LD Structured Data
  let schemaScript = document.getElementById('dynamic-tool-jsonld');
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.id = 'dynamic-tool-jsonld';
    schemaScript.setAttribute('type', 'application/ld+json');
    document.head.appendChild(schemaScript);
  }

  const cleanToolName = toolName || routeSEO?.toolName || (effectiveTitle ? effectiveTitle.split('•')[0].trim() : siteName);
  const effectiveCategory = routeSEO?.categoryName || categoryName;

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': schemaType,
        name: cleanToolName,
        url: effectiveCanonical,
        applicationCategory: effectiveCategory,
        operatingSystem: 'All (Web Browser, Windows, Mac, Android, iOS)',
        description: effectiveDesc,
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
          name: siteName,
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
            name: effectiveCategory,
            item: effectiveCanonical,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: cleanToolName,
            item: effectiveCanonical,
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
