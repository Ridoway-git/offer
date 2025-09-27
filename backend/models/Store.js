const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  website: { type: String, required: true },
  logo: { type: String, default: '' },
  category: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  totalCoupons: { type: Number, default: 0 },
  activeCoupons: { type: Number, default: 0 },
  tags: [{ type: String }],
  affiliateLink: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for better query performance
storeSchema.index({ name: 1 });
storeSchema.index({ category: 1, isActive: 1 });
storeSchema.index({ isFeatured: 1, isActive: 1 });

// Update the updatedAt field before saving
storeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Store', storeSchema); 