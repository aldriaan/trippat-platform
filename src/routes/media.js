const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate, authorize } = require('../middleware/auth');
const mediaController = require('../controllers/mediaController');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-msvideo'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Upload multiple images
router.post(
  '/upload/images/:packageId',
  authenticate,
  authorize(['admin', 'expert']),
  upload.array('images', 20), // Max 20 images
  mediaController.uploadImages
);

// Upload single video
router.post(
  '/upload/video/:packageId',
  authenticate,
  authorize(['admin', 'expert']),
  upload.single('video'),
  mediaController.uploadVideo
);

// Add external video
router.post(
  '/external-video/:packageId',
  authenticate,
  authorize(['admin', 'expert']),
  mediaController.addExternalVideo
);

// Get package media
router.get(
  '/package/:packageId',
  mediaController.getPackageMedia
);

// Update media metadata
router.put(
  '/:mediaId/metadata',
  authenticate,
  authorize(['admin', 'expert']),
  mediaController.updateMetadata
);

// Reorder gallery
router.put(
  '/package/:packageId/reorder',
  authenticate,
  authorize(['admin', 'expert']),
  mediaController.reorderGallery
);

// Set featured image
router.put(
  '/:mediaId/featured',
  authenticate,
  authorize(['admin', 'expert']),
  mediaController.setFeaturedImage
);

// Delete media
router.delete(
  '/:mediaId',
  authenticate,
  authorize(['admin', 'expert']),
  mediaController.deleteMedia
);

// Generate optimized versions
router.post(
  '/:mediaId/optimize',
  authenticate,
  authorize(['admin', 'expert']),
  mediaController.optimizeMedia
);

// Update video thumbnail
router.put(
  '/:mediaId/thumbnail',
  authenticate,
  authorize(['admin', 'expert']),
  upload.single('thumbnail'),
  mediaController.updateVideoThumbnail
);

// Get optimization suggestions
router.get(
  '/:mediaId/suggestions',
  authenticate,
  authorize(['admin', 'expert']),
  mediaController.getOptimizationSuggestions
);

// Crop/resize featured image
router.post(
  '/:mediaId/crop',
  authenticate,
  authorize(['admin', 'expert']),
  mediaController.cropImage
);

module.exports = router;