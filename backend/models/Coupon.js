const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  discount: { type: String, required: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  code: { type: String, required: true, unique: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  storeName: { type: String, required: true },
  category: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  expiryDate: { type: Date, required: true },
  usageCount: { type: Number, default: 0 },
  minPurchaseAmount: { type: Number, default: 0 },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for better query performance
couponSchema.index({ storeId: 1, isActive: 1, expiryDate: 1 });
couponSchema.index({ category: 1, isActive: 1 });
couponSchema.index({ isFeatured: 1, isActive: 1 });

// Update the updatedAt field before saving
couponSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Coupon', couponSchema); 