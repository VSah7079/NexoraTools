import mongoose from 'mongoose';

const SEORouteSchema = new mongoose.Schema(
  {
    path: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    keywords: { type: String, default: '' },
    canonicalUrl: { type: String, default: '' },
    ogImage: { type: String, default: '' },
    robots: { type: String, default: 'index, follow' },
    categoryName: { type: String, default: 'General' },
    toolName: { type: String, default: '' },
    lastUpdated: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const SEORoute = mongoose.models.SEORoute || mongoose.model('SEORoute', SEORouteSchema);
