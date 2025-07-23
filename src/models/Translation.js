const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
  // Reference to the content being translated
  contentType: {
    type: String,
    required: [true, 'Content type is required'],
    enum: ['package', 'itinerary', 'user_content', 'system_content']
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Content ID is required']
  },
  
  // Translation details
  fieldName: {
    type: String,
    required: [true, 'Field name is required']
  },
  sourceLanguage: {
    type: String,
    required: [true, 'Source language is required'],
    enum: ['en', 'ar'],
    default: 'en'
  },
  targetLanguage: {
    type: String,
    required: [true, 'Target language is required'],
    enum: ['en', 'ar']
  },
  
  // Content
  sourceText: {
    type: String,
    required: [true, 'Source text is required'],
    trim: true
  },
  translatedText: {
    type: String,
    trim: true
  },
  
  // Translation status and workflow
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'reviewed', 'rejected', 'needs_revision'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Translation quality and validation
  qualityScore: {
    type: Number,
    min: 0,
    max: 100
  },
  culturalValidation: {
    type: String,
    enum: ['pending', 'approved', 'needs_review', 'rejected'],
    default: 'pending'
  },
  
  // Workflow management
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Revision history
  revisionHistory: [{
    version: Number,
    text: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    changeReason: String
  }],
  
  // Cultural context and guidelines
  culturalNotes: {
    type: String,
    trim: true
  },
  culturalGuidelines: [{
    type: String,
    trim: true
  }],
  
  // Translation metadata
  translationMethod: {
    type: String,
    enum: ['manual', 'ai_assisted', 'machine', 'professional'],
    default: 'manual'
  },
  estimatedTime: {
    type: Number, // in minutes
    min: 0
  },
  actualTime: {
    type: Number, // in minutes
    min: 0
  },
  
  // Deadline and scheduling
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  
  // Comments and feedback
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['general', 'suggestion', 'issue', 'approval'],
      default: 'general'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
translationSchema.index({ contentType: 1, contentId: 1 });
translationSchema.index({ status: 1, priority: 1 });
translationSchema.index({ targetLanguage: 1, status: 1 });
translationSchema.index({ assignedTo: 1, status: 1 });
translationSchema.index({ dueDate: 1 });

// Virtual for translation progress
translationSchema.virtual('progressPercentage').get(function() {
  switch(this.status) {
    case 'pending': return 0;
    case 'in_progress': return 25;
    case 'completed': return 75;
    case 'reviewed': return 100;
    case 'rejected': return 0;
    case 'needs_revision': return 50;
    default: return 0;
  }
});

// Virtual for overdue status
translationSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'completed' && this.status !== 'reviewed';
});

// Static method to get translation statistics
translationSchema.statics.getTranslationStats = async function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgQualityScore: { $avg: '$qualityScore' }
      }
    }
  ];
  
  return await this.aggregate(pipeline);
};

// Static method to get overdue translations
translationSchema.statics.getOverdueTranslations = async function() {
  return await this.find({
    dueDate: { $lt: new Date() },
    status: { $nin: ['completed', 'reviewed'] }
  }).populate('assignedTo', 'name email');
};

module.exports = mongoose.model('Translation', translationSchema);