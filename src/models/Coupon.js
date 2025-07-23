const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  name_ar: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  description_ar: {
    type: String,
    trim: true
  },
  discountType: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minimumAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maximumDiscount: {
    type: Number,
    min: 0
  },
  usageLimit: {
    type: Number,
    min: 1
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  userUsageLimit: {
    type: Number,
    min: 1
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicablePackages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package'
  }],
  applicableCategories: [{
    type: String
  }],
  excludedPackages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

// Validate that validUntil is after validFrom
couponSchema.pre('validate', function(next) {
  if (this.validUntil <= this.validFrom) {
    next(new Error('Valid until date must be after valid from date'));
  } else {
    next();
  }
});

// Update updatedAt on save
couponSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to check if coupon is valid
couponSchema.methods.isValidForUse = function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.validFrom &&
    now <= this.validUntil &&
    (this.usageLimit === undefined || this.usageCount < this.usageLimit)
  );
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(amount) {
  if (!this.isValidForUse()) {
    return 0;
  }

  if (amount < this.minimumAmount) {
    return 0;
  }

  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (amount * this.discountValue) / 100;
  } else {
    discount = this.discountValue;
  }

  // Apply maximum discount limit if set
  if (this.maximumDiscount && discount > this.maximumDiscount) {
    discount = this.maximumDiscount;
  }

  // Ensure discount doesn't exceed the amount
  return Math.min(discount, amount);
};

// Method to check if coupon is applicable to a package
couponSchema.methods.isApplicableToPackage = function(packageId, packageCategories = []) {
  // If excluded packages contains this package, not applicable
  if (this.excludedPackages.includes(packageId)) {
    return false;
  }

  // If specific packages are set and this package is not included, check categories
  if (this.applicablePackages.length > 0 && !this.applicablePackages.includes(packageId)) {
    // Check if package categories match applicable categories
    if (this.applicableCategories.length > 0) {
      return packageCategories.some(category => this.applicableCategories.includes(category));
    }
    return false;
  }

  // If applicable categories are set, check if package matches
  if (this.applicableCategories.length > 0) {
    return packageCategories.some(category => this.applicableCategories.includes(category));
  }

  // If no specific restrictions, applicable to all
  return true;
};

module.exports = mongoose.model('Coupon', couponSchema);