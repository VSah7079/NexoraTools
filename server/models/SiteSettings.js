import mongoose from 'mongoose';

const SiteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global_config', unique: true },
    admin_pin: { type: String, default: 'nexora2026' },
    global_seo: {
      siteName: { type: String, default: 'Nexora Tools' },
      titleTemplate: { type: String, default: '%s • Nexora Tools' },
      defaultDescription: { type: String, default: '' },
      defaultKeywords: { type: String, default: '' },
      googleVerificationId: { type: String, default: '' },
      bingVerificationId: { type: String, default: '' },
      ga4MeasurementId: { type: String, default: '' },
      adsensePubId: { type: String, default: '' },
      robotsTxtContent: { type: String, default: '' },
      customHeadScripts: { type: String, default: '' },
      customFooterScripts: { type: String, default: '' },
    },
    announcement: {
      enabled: { type: Boolean, default: true },
      message: { type: String, default: '' },
      type: { type: String, default: 'promo' },
      linkText: { type: String, default: '' },
      linkUrl: { type: String, default: '' },
      closable: { type: Boolean, default: true },
      badgeText: { type: String, default: 'New Update' },
    },
    branding: {
      siteName: { type: String, default: 'Nexora Tools' },
      tagline: { type: String, default: 'Client-Side Cyber Cafe & Document Workstation' },
      contactEmail: { type: String, default: 'support@nexoratools.com' },
      copyrightText: { type: String, default: '' },
      supportPhone: { type: String, default: '' },
      twitterUrl: { type: String, default: 'https://twitter.com' },
      githubUrl: { type: String, default: 'https://github.com' },
      telegramUrl: { type: String, default: 'https://telegram.org' },
      youtubeUrl: { type: String, default: 'https://youtube.com' },
    },
    last_updated: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const SiteSettings =
  mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema);
