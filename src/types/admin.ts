import type { ToolItem, ToolCategory } from './tools';
export type { ToolCategory };

export interface CustomToolItem extends ToolItem {
  enabled?: boolean;
  isCustom?: boolean;
  order?: number;
}

export interface RouteSEOConfig {
  path: string;
  title: string;
  description: string;
  keywords: string;
  canonicalUrl?: string;
  ogImage?: string;
  robots?: string; // 'index, follow' | 'noindex, nofollow'
  categoryName?: string;
  toolName?: string;
  lastUpdated?: string;
}

export interface GlobalSEOSettings {
  siteName: string;
  titleTemplate: string; // e.g. "%s • Nexora Tools"
  defaultDescription: string;
  defaultKeywords: string;
  googleVerificationId?: string;
  bingVerificationId?: string;
  ga4MeasurementId?: string; // e.g. G-XXXXXXXXXX
  adsensePubId?: string; // e.g. ca-pub-XXXXXXXXXXXXXXXX
  robotsTxtContent?: string;
  customHeadScripts?: string;
  customFooterScripts?: string;
}

export interface AnnouncementConfig {
  enabled: boolean;
  message: string;
  type: 'info' | 'success' | 'warning' | 'promo';
  linkText?: string;
  linkUrl?: string;
  closable: boolean;
  badgeText?: string;
}

export interface BrandingConfig {
  siteName: string;
  tagline: string;
  contactEmail: string;
  copyrightText: string;
  supportPhone?: string;
  twitterUrl?: string;
  githubUrl?: string;
  telegramUrl?: string;
  youtubeUrl?: string;
}

export interface SiteConfigState {
  tools: CustomToolItem[];
  seoRoutes: Record<string, RouteSEOConfig>;
  globalSEO: GlobalSEOSettings;
  announcement: AnnouncementConfig;
  branding: BrandingConfig;
  adminPin: string;
  lastUpdated: string;
}
