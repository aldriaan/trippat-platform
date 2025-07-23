const mongoose = require('mongoose');

const mediaSizeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['thumbnail', 'small', 'medium', 'large', 'original']
  },
  width: Number,
  height: Number,
  url: String,
  size: Number, // in bytes
  format: String
});

const mediaMetadataSchema = new mongoose.Schema({
  altText: {
    en: String,
    ar: String
  },
  caption: {
    en: String,
    ar: String
  },
  tags: [String],
  credit: String,
  copyright: String,
  location: {
    name: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  }
});

const imageOptimizationSchema = new mongoose.Schema({
  qualityScore: {
    type: Number,
    min: 0,
    max: 100
  },
  suggestions: [{
    type: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    message: String
  }],
  metadata: {
    format: String,
    colorSpace: String,
    hasTransparency: Boolean,
    isProgressive: Boolean,
    density: Number
  }
});

const videoMetadataSchema = new mongoose.Schema({
  duration: Number, // in seconds
  resolution: {
    width: Number,
    height: Number
  },
  format: String,
  codec: String,
  bitrate: Number,
  frameRate: Number,
  thumbnail: {
    url: String,
    customThumbnail: Boolean,
    timestamp: Number // thumbnail capture time in seconds
  }
});

const mediaSchema = new mongoose.Schema({
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['image', 'video']
  },
  provider: {
    type: String,
    enum: ['local', 's3', 'cloudinary', 'youtube', 'vimeo'],
    default: 'local'
  },
  
  // Basic info
  filename: {
    type: String,
    required: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  mimeType: String,
  size: Number, // in bytes
  
  // Image specific
  sizes: [mediaSizeSchema],
  imageOptimization: imageOptimizationSchema,
  
  // Video specific
  videoMetadata: videoMetadataSchema,
  videoId: String, // For external video providers
  embedUrl: String,
  
  // Common metadata
  metadata: mediaMetadataSchema,
  
  // Gallery management
  order: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  
  // Processing status
  status: {
    type: String,
    enum: ['uploading', 'processing', 'ready', 'failed'],
    default: 'uploading'
  },
  processingError: String,
  
  // Cloud storage info
  cloudStorage: {
    provider: String,
    publicId: String,
    version: String,
    signature: String,
    resourceType: String,
    folder: String
  },
  
  // Usage tracking
  usage: {
    views: {
      type: Number,
      default: 0
    },
    lastViewed: Date,
    usedIn: [{
      type: {
        type: String,
        enum: ['featured', 'gallery', 'content', 'thumbnail']
      },
      location: String,
      addedAt: Date
    }]
  },
  
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
mediaSchema.index({ package: 1, order: 1 });
mediaSchema.index({ package: 1, isFeatured: 1 });
mediaSchema.index({ type: 1, status: 1 });
mediaSchema.index({ 'metadata.tags': 1 });

// Virtual for responsive image srcset
mediaSchema.virtual('srcset').get(function() {
  if (this.type !== 'image' || !this.sizes) return '';
  
  return this.sizes
    .map(size => `${size.url} ${size.width}w`)
    .join(', ');
});

// Method to get optimal image size
mediaSchema.methods.getOptimalSize = function(requestedWidth) {
  if (this.type !== 'image' || !this.sizes) return this.originalUrl;
  
  // Find the smallest size that's still larger than requested
  const sortedSizes = this.sizes.sort((a, b) => a.width - b.width);
  const optimal = sortedSizes.find(size => size.width >= requestedWidth);
  
  return optimal ? optimal.url : this.originalUrl;
};

// Method to get video embed code
mediaSchema.methods.getEmbedCode = function(options = {}) {
  if (this.type !== 'video') return null;
  
  const { width = 560, height = 315, autoplay = false } = options;
  
  switch (this.provider) {
    case 'youtube':
      return `<iframe width="${width}" height="${height}" src="https://www.youtube.com/embed/${this.videoId}${autoplay ? '?autoplay=1' : ''}" frameborder="0" allowfullscreen></iframe>`;
    case 'vimeo':
      return `<iframe width="${width}" height="${height}" src="https://player.vimeo.com/video/${this.videoId}${autoplay ? '?autoplay=1' : ''}" frameborder="0" allowfullscreen></iframe>`;
    default:
      return `<video width="${width}" height="${height}" controls${autoplay ? ' autoplay' : ''}><source src="${this.originalUrl}" type="${this.mimeType}"></video>`;
  }
};

// Static method to reorder gallery
mediaSchema.statics.reorderGallery = async function(packageId, orderedIds) {
  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id, package: packageId },
      update: { order: index }
    }
  }));
  
  return this.bulkWrite(bulkOps);
};

// Pre-save hook to ensure only one featured image per package
mediaSchema.pre('save', async function(next) {
  if (this.isFeatured && this.type === 'image') {
    await this.constructor.updateMany(
      { 
        package: this.package, 
        _id: { $ne: this._id },
        type: 'image'
      },
      { isFeatured: false }
    );
  }
  next();
});

module.exports = mongoose.model('Media', mediaSchema);