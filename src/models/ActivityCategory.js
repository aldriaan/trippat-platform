const mongoose = require('mongoose');

const activityCategorySchema = new mongoose.Schema({
  // Basic Information
  name: { 
    type: String, 
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    index: true
  },
  name_ar: { type: String, trim: true, index: true },
  
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  
  description: { type: String, trim: true },
  description_ar: { type: String, trim: true },
  
  // Category Hierarchy
  parent: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ActivityCategory',
    default: null
  },
  
  level: { type: Number, default: 0 }, // 0 = top level, 1 = subcategory, etc.
  path: { type: String, index: true }, // e.g., "tours/cultural/museums"
  
  // Visual and Display
  icon: { type: String, trim: true }, // Icon class or URL
  color: { type: String, trim: true }, // Hex color code
  image: { type: String, trim: true }, // Category image URL
  
  // Ordering and Status
  order: { type: Number, default: 0, index: true },
  isActive: { type: Boolean, default: true, index: true },
  
  // SEO
  metaTitle: { type: String, trim: true },
  metaTitle_ar: { type: String, trim: true },
  metaDescription: { type: String, trim: true },
  metaDescription_ar: { type: String, trim: true },
  
  // Statistics
  activityCount: { type: Number, default: 0 },
  
  // Admin
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
activityCategorySchema.index({ parent: 1, order: 1 });
activityCategorySchema.index({ level: 1, isActive: 1 });
activityCategorySchema.index({ path: 1 });

// Virtual for subcategories
activityCategorySchema.virtual('subcategories', {
  ref: 'ActivityCategory',
  localField: '_id',
  foreignField: 'parent'
});

// Pre-save middleware
activityCategorySchema.pre('save', function(next) {
  // Generate slug if not provided
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  next();
});

// Static method to build category tree
activityCategorySchema.statics.getCategoryTree = async function() {
  const categories = await this.find({ isActive: true })
    .populate('subcategories')
    .sort({ level: 1, order: 1 });
    
  const tree = [];
  const categoryMap = {};
  
  // First pass: create map and find root categories
  categories.forEach(category => {
    categoryMap[category._id] = { ...category.toObject(), children: [] };
    if (!category.parent) {
      tree.push(categoryMap[category._id]);
    }
  });
  
  // Second pass: build tree structure
  categories.forEach(category => {
    if (category.parent && categoryMap[category.parent]) {
      categoryMap[category.parent].children.push(categoryMap[category._id]);
    }
  });
  
  return tree;
};

module.exports = mongoose.model('ActivityCategory', activityCategorySchema);