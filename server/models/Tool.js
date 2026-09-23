import mongoose from 'mongoose';

const ToolSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    shortName: { type: String, default: '' },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['photo', 'id-card', 'pdf', 'print', 'scanner', 'batch'],
      default: 'photo',
      index: true,
    },
    path: { type: String, required: true },
    iconName: { type: String, default: 'Sparkles' },
    badge: { type: String, default: '' },
    popular: { type: Boolean, default: false },
    color: { type: String, default: 'from-indigo-500 to-purple-600' },
    enabled: { type: Boolean, default: true, index: true },
    isCustom: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Tool = mongoose.models.Tool || mongoose.model('Tool', ToolSchema);
