const Translation = require('../models/Translation');
const Package = require('../models/Package');

// Get all translations with filtering and pagination
exports.getAllTranslations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      language,
      contentType,
      assignedTo,
      priority,
      overdue
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (language) filter.targetLanguage = language;
    if (contentType) filter.contentType = contentType;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (priority) filter.priority = priority;
    
    // Handle overdue filter
    if (overdue === 'true') {
      filter.dueDate = { $lt: new Date() };
      filter.status = { $nin: ['completed', 'reviewed'] };
    }

    const translations = await Translation.find(filter)
      .populate('assignedTo', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('contentId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Translation.countDocuments(filter);

    res.json({
      translations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get translation statistics
exports.getTranslationStats = async (req, res) => {
  try {
    const stats = await Translation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgQualityScore: { $avg: '$qualityScore' }
        }
      }
    ]);

    const languageStats = await Translation.aggregate([
      {
        $group: {
          _id: '$targetLanguage',
          count: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const overdueCount = await Translation.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $nin: ['completed', 'reviewed'] }
    });

    res.json({
      statusStats: stats,
      languageStats,
      overdueCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get package translation status
exports.getPackageTranslationStatus = async (req, res) => {
  try {
    const packages = await Package.find({})
      .select('title title_ar destination destination_ar translationStatus translationCompleteness')
      .lean();

    const translationSummary = packages.map(pkg => ({
      id: pkg._id,
      title: pkg.title,
      title_ar: pkg.title_ar,
      destination: pkg.destination,
      destination_ar: pkg.destination_ar,
      translationStatus: pkg.translationStatus,
      translationCompleteness: pkg.translationCompleteness,
      needsTranslation: !pkg.title_ar || !pkg.destination_ar
    }));

    res.json(translationSummary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create translation task
exports.createTranslationTask = async (req, res) => {
  try {
    const {
      contentType,
      contentId,
      fieldName,
      sourceText,
      targetLanguage,
      priority = 'medium',
      dueDate,
      assignedTo,
      culturalNotes
    } = req.body;

    const translation = new Translation({
      contentType,
      contentId,
      fieldName,
      sourceText,
      sourceLanguage: 'en',
      targetLanguage,
      priority,
      dueDate,
      assignedTo,
      culturalNotes,
      translationMethod: 'manual'
    });

    await translation.save();

    res.status(201).json({
      message: 'Translation task created successfully',
      translation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update translation
exports.updateTranslation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      translatedText,
      status,
      qualityScore,
      culturalValidation,
      changeReason,
      culturalNotes
    } = req.body;

    const translation = await Translation.findById(id);
    if (!translation) {
      return res.status(404).json({ error: 'Translation not found' });
    }

    // Store revision if text is being updated
    if (translatedText && translatedText !== translation.translatedText) {
      translation.revisionHistory.push({
        version: translation.revisionHistory.length + 1,
        text: translation.translatedText,
        updatedBy: req.user.id,
        changeReason
      });
    }

    // Update fields
    if (translatedText) translation.translatedText = translatedText;
    if (status) translation.status = status;
    if (qualityScore) translation.qualityScore = qualityScore;
    if (culturalValidation) translation.culturalValidation = culturalValidation;
    if (culturalNotes) translation.culturalNotes = culturalNotes;

    // Set completion time if status is completed
    if (status === 'completed' && !translation.completedAt) {
      translation.completedAt = new Date();
    }

    await translation.save();

    // Update the source content if translation is completed
    if (status === 'completed' && translatedText) {
      await updateSourceContent(translation.contentType, translation.contentId, translation.fieldName, translatedText);
    }

    res.json({
      message: 'Translation updated successfully',
      translation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Assign translation to user
exports.assignTranslation = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo, dueDate } = req.body;

    const translation = await Translation.findByIdAndUpdate(id, {
      assignedTo,
      dueDate,
      status: 'in_progress'
    }, { new: true });

    if (!translation) {
      return res.status(404).json({ error: 'Translation not found' });
    }

    res.json({
      message: 'Translation assigned successfully',
      translation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Bulk create translation tasks for a package
exports.bulkCreatePackageTranslations = async (req, res) => {
  try {
    const { packageId, targetLanguage = 'ar', priority = 'medium', dueDate } = req.body;

    const packageDoc = await Package.findById(packageId);
    if (!packageDoc) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const translations = [];
    const fieldsToTranslate = [
      { field: 'title', source: packageDoc.title },
      { field: 'description', source: packageDoc.description },
      { field: 'destination', source: packageDoc.destination }
    ];

    // Add array fields
    if (packageDoc.inclusions?.length > 0) {
      packageDoc.inclusions.forEach((inclusion, index) => {
        fieldsToTranslate.push({
          field: `inclusions.${index}`,
          source: inclusion
        });
      });
    }

    if (packageDoc.exclusions?.length > 0) {
      packageDoc.exclusions.forEach((exclusion, index) => {
        fieldsToTranslate.push({
          field: `exclusions.${index}`,
          source: exclusion
        });
      });
    }

    if (packageDoc.highlights?.length > 0) {
      packageDoc.highlights.forEach((highlight, index) => {
        fieldsToTranslate.push({
          field: `highlights.${index}`,
          source: highlight
        });
      });
    }

    // Add itinerary translations
    if (packageDoc.itinerary?.length > 0) {
      packageDoc.itinerary.forEach((day, index) => {
        fieldsToTranslate.push({
          field: `itinerary.${index}.title`,
          source: day.title
        });
        fieldsToTranslate.push({
          field: `itinerary.${index}.description`,
          source: day.description
        });
      });
    }

    // Create translation tasks
    for (const fieldData of fieldsToTranslate) {
      if (fieldData.source) {
        const translation = new Translation({
          contentType: 'package',
          contentId: packageId,
          fieldName: fieldData.field,
          sourceText: fieldData.source,
          sourceLanguage: 'en',
          targetLanguage,
          priority,
          dueDate,
          translationMethod: 'manual'
        });

        translations.push(translation);
      }
    }

    await Translation.insertMany(translations);

    res.json({
      message: `Created ${translations.length} translation tasks for package`,
      count: translations.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add comment to translation
exports.addTranslationComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, type = 'general' } = req.body;

    const translation = await Translation.findById(id);
    if (!translation) {
      return res.status(404).json({ error: 'Translation not found' });
    }

    translation.comments.push({
      user: req.user.id,
      comment,
      type
    });

    await translation.save();

    res.json({
      message: 'Comment added successfully',
      translation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to update source content
async function updateSourceContent(contentType, contentId, fieldName, translatedText) {
  try {
    if (contentType === 'package') {
      const updateField = fieldName.includes('.') 
        ? fieldName.replace(/(\d+)/, '$[$1]') // Handle array indices
        : fieldName;
      
      const targetField = `${updateField}_ar`;
      
      await Package.findByIdAndUpdate(contentId, {
        [targetField]: translatedText,
        [`lastTranslationUpdate.ar`]: new Date()
      });
    }
  } catch (error) {
    console.error('Error updating source content:', error);
  }
}

module.exports = exports;