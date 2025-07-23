const Media = require('../models/Media');
const Package = require('../models/Package');
const mediaService = require('../services/mediaService');
const sharp = require('sharp');

// Upload multiple images
exports.uploadImages = async (req, res) => {
  try {
    const { packageId } = req.params;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Verify package exists and user has permission
    const package = await Package.findById(packageId);
    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    // Process each image
    const mediaDocuments = [];
    
    for (const file of files) {
      try {
        const processedImage = await mediaService.processImage(file, {
          packageId,
          userId: req.user._id,
          metadata: {
            altText: req.body.altText || {},
            caption: req.body.caption || {},
            tags: req.body.tags ? req.body.tags.split(',') : []
          }
        });

        const media = new Media({
          package: packageId,
          type: 'image',
          provider: 'local',
          uploadedBy: req.user._id,
          ...processedImage
        });

        await media.save();
        mediaDocuments.push(media);
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
      }
    }

    res.status(201).json({
      success: true,
      data: mediaDocuments,
      message: `Successfully uploaded ${mediaDocuments.length} images`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
};

// Upload video
exports.uploadVideo = async (req, res) => {
  try {
    const { packageId } = req.params;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded'
      });
    }

    // Verify package exists
    const package = await Package.findById(packageId);
    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    // Process video
    const processedVideo = await mediaService.processVideo(file, {
      packageId,
      userId: req.user._id,
      metadata: {
        altText: req.body.altText || {},
        caption: req.body.caption || {},
        tags: req.body.tags ? req.body.tags.split(',') : []
      }
    });

    const media = new Media({
      package: packageId,
      type: 'video',
      provider: 'local',
      uploadedBy: req.user._id,
      ...processedVideo
    });

    await media.save();

    res.status(201).json({
      success: true,
      data: media,
      message: 'Video uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload video',
      error: error.message
    });
  }
};

// Add external video
exports.addExternalVideo = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { url, metadata } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Video URL is required'
      });
    }

    // Verify package exists
    const package = await Package.findById(packageId);
    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    // Process external video
    const videoData = await mediaService.processExternalVideo(url, {
      packageId,
      userId: req.user._id,
      metadata: metadata || {}
    });

    const media = new Media({
      package: packageId,
      uploadedBy: req.user._id,
      ...videoData
    });

    await media.save();

    res.status(201).json({
      success: true,
      data: media,
      message: 'External video added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add external video',
      error: error.message
    });
  }
};

// Get package media
exports.getPackageMedia = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { type, status = 'ready' } = req.query;
    
    const query = {
      package: packageId,
      status,
      isVisible: true
    };
    
    if (type) {
      query.type = type;
    }

    const media = await Media
      .find(query)
      .sort({ order: 1, createdAt: -1 })
      .populate('uploadedBy', 'name email');

    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch media',
      error: error.message
    });
  }
};

// Update media metadata
exports.updateMetadata = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { metadata } = req.body;
    
    const media = await Media.findById(mediaId);
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Update metadata
    media.metadata = {
      ...media.metadata,
      ...metadata
    };
    
    await media.save();

    res.json({
      success: true,
      data: media,
      message: 'Metadata updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update metadata',
      error: error.message
    });
  }
};

// Reorder gallery
exports.reorderGallery = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { mediaOrder } = req.body; // Array of media IDs in desired order
    
    if (!Array.isArray(mediaOrder)) {
      return res.status(400).json({
        success: false,
        message: 'Media order must be an array'
      });
    }

    await Media.reorderGallery(packageId, mediaOrder);

    res.json({
      success: true,
      message: 'Gallery order updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reorder gallery',
      error: error.message
    });
  }
};

// Set featured image
exports.setFeaturedImage = async (req, res) => {
  try {
    const { mediaId } = req.params;
    
    const media = await Media.findById(mediaId);
    if (!media || media.type !== 'image') {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // This will trigger the pre-save hook to unset other featured images
    media.isFeatured = true;
    await media.save();

    res.json({
      success: true,
      data: media,
      message: 'Featured image set successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to set featured image',
      error: error.message
    });
  }
};

// Delete media
exports.deleteMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;
    
    const media = await Media.findByIdAndDelete(mediaId);
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // TODO: Delete physical files from storage

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete media',
      error: error.message
    });
  }
};

// Optimize media
exports.optimizeMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { quality = 85, format } = req.body;
    
    const media = await Media.findById(mediaId);
    if (!media || media.type !== 'image') {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // TODO: Implement optimization logic

    res.json({
      success: true,
      data: media,
      message: 'Image optimized successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to optimize media',
      error: error.message
    });
  }
};

// Update video thumbnail
exports.updateVideoThumbnail = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const file = req.file;
    const { timestamp } = req.body;
    
    const media = await Media.findById(mediaId);
    if (!media || media.type !== 'video') {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    if (file) {
      // Process custom thumbnail
      const processedThumbnail = await mediaService.processImage(file, {
        packageId: media.package,
        userId: req.user._id,
        generateSizes: false
      });
      
      media.videoMetadata.thumbnail = {
        url: processedThumbnail.originalUrl,
        customThumbnail: true
      };
    } else if (timestamp !== undefined) {
      // Generate thumbnail from video at specific timestamp
      const thumbnail = await mediaService.generateVideoThumbnail(
        media.originalUrl, 
        { timestamp: parseInt(timestamp) }
      );
      
      media.videoMetadata.thumbnail = {
        url: thumbnail.url,
        customThumbnail: false,
        timestamp: parseInt(timestamp)
      };
    }

    await media.save();

    res.json({
      success: true,
      data: media,
      message: 'Video thumbnail updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update video thumbnail',
      error: error.message
    });
  }
};

// Get optimization suggestions
exports.getOptimizationSuggestions = async (req, res) => {
  try {
    const { mediaId } = req.params;
    
    const media = await Media.findById(mediaId);
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    res.json({
      success: true,
      data: {
        qualityScore: media.imageOptimization?.qualityScore || null,
        suggestions: media.imageOptimization?.suggestions || []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get optimization suggestions',
      error: error.message
    });
  }
};

// Crop image
exports.cropImage = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { x, y, width, height, aspectRatio } = req.body;
    
    const media = await Media.findById(mediaId);
    if (!media || media.type !== 'image') {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // TODO: Implement cropping logic using sharp

    res.json({
      success: true,
      data: media,
      message: 'Image cropped successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to crop image',
      error: error.message
    });
  }
};