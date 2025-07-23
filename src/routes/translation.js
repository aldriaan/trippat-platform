const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const translationController = require('../controllers/translationController');

// Apply auth middleware to all routes
router.use(authenticate);

// Get all translations with filtering
router.get('/', translationController.getAllTranslations);

// Get translation statistics
router.get('/stats', translationController.getTranslationStats);

// Get package translation status
router.get('/packages/status', translationController.getPackageTranslationStatus);

// Create translation task
router.post('/', translationController.createTranslationTask);

// Update translation
router.put('/:id', translationController.updateTranslation);

// Assign translation to user
router.put('/:id/assign', translationController.assignTranslation);

// Bulk create translations for a package
router.post('/packages/:packageId/bulk-create', translationController.bulkCreatePackageTranslations);

// Add comment to translation
router.post('/:id/comments', translationController.addTranslationComment);

module.exports = router;