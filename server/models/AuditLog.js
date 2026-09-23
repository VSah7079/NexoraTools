import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    action: { type: String, required: true },
    details: { type: String, default: '' },
    timestamp: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
