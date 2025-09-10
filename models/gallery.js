import { Schema, model } from 'mongoose';

const GallerySchema = new Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    alt: { type: String, required: true },
    category: { type: String, default: 'Tổng quan' },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for better query performance
GallerySchema.index({ createdAt: -1 });
GallerySchema.index({ isActive: 1, createdAt: -1 });

export default model('Gallery', GallerySchema);
