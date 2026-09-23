import mongoose from 'mongoose';

const AnalyticsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global_metrics', unique: true },
    totalProcessed: { type: Number, default: 0 },
    passportPhotosCreated: { type: Number, default: 0 },
    idCardsMerged: { type: Number, default: 0 },
    pdfsGenerated: { type: Number, default: 0 },
    scansCompleted: { type: Number, default: 0 },
    batchItemsProcessed: { type: Number, default: 0 },
    lastActive: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);
