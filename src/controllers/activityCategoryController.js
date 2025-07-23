const ActivityCategory = require('../models/ActivityCategory');
const Activity = require('../models/Activity');
const mongoose = require('mongoose');

const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data
  });
};

// Get all activity categories with hierarchy
const getAllCategories = async (req, res) => {
  try {
    const { flat = false, activeOnly = false } = req.query;

    let query = {};
    if (activeOnly === 'true') {
      query.isActive = true;
    }

    if (flat === 'true') {
      // Return flat list of categories
      const categories = await ActivityCategory.find(query)
        .populate('createdBy', 'name email')
        .sort({ level: 1, order: 1, name: 1 })
        .lean();

      // Add activity count for each category
      for (const category of categories) {
        category.activityCount = await Activity.countDocuments({ 
          category: category.slug,
          ...(activeOnly === 'true' ? { status: 'active', isPublished: true } : {})
        });
      }

      return sendResponse(res, 200, true, 'Categories retrieved successfully', {
        categories
      });
    } else {
      // Return hierarchical tree structure
      const tree = await ActivityCategory.getCategoryTree();
      
      // Add activity counts to tree structure
      const addActivityCounts = async (categories) => {
        for (const category of categories) {
          category.activityCount = await Activity.countDocuments({ 
            category: category.slug,
            ...(activeOnly === 'true' ? { status: 'active', isPublished: true } : {})
          });
          
          if (category.children && category.children.length > 0) {
            await addActivityCounts(category.children);
          }
        }
      };

      await addActivityCounts(tree);

      return sendResponse(res, 200, true, 'Category tree retrieved successfully', {
        categories: tree
      });
    }

  } catch (error) {
    console.error('Get categories error:', error);
    return sendResponse(res, 500, false, 'Failed to retrieve categories');
  }
};

// Get single category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, false, 'Invalid category ID');
    }

    const category = await ActivityCategory.findById(id)
      .populate('createdBy', 'name email')
      .populate('subcategories');

    if (!category) {
      return sendResponse(res, 404, false, 'Category not found');
    }

    // Get activity count for this category
    const activityCount = await Activity.countDocuments({ 
      category: category.slug 
    });

    const categoryData = {
      ...category.toObject(),
      activityCount
    };

    return sendResponse(res, 200, true, 'Category retrieved successfully', { 
      category: categoryData 
    });

  } catch (error) {
    console.error('Get category error:', error);
    return sendResponse(res, 500, false, 'Failed to retrieve category');
  }
};

// Create new category
const createCategory = async (req, res) => {
  try {
    // Check admin permissions
    if (req.user.role !== 'admin') {
      return sendResponse(res, 403, false, 'Access denied. Admin role required.');
    }

    const categoryData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Generate slug if not provided
    if (!categoryData.slug && categoryData.name) {
      categoryData.slug = categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // If parent is provided, calculate level and path
    if (categoryData.parent) {
      const parentCategory = await ActivityCategory.findById(categoryData.parent);
      if (!parentCategory) {
        return sendResponse(res, 400, false, 'Parent category not found');
      }
      
      categoryData.level = parentCategory.level + 1;
      categoryData.path = parentCategory.path 
        ? `${parentCategory.path}/${categoryData.slug}`
        : categoryData.slug;
    } else {
      categoryData.level = 0;
      categoryData.path = categoryData.slug;
    }

    const category = new ActivityCategory(categoryData);
    await category.save();

    const populatedCategory = await ActivityCategory.findById(category._id)
      .populate('createdBy', 'name email');

    return sendResponse(res, 201, true, 'Category created successfully', { 
      category: populatedCategory 
    });

  } catch (error) {
    console.error('Create category error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return sendResponse(res, 400, false, 'Validation error', { errors });
    }

    if (error.code === 11000) {
      return sendResponse(res, 409, false, 'Category with this name or slug already exists');
    }

    return sendResponse(res, 500, false, 'Failed to create category');
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, false, 'Invalid category ID');
    }

    // Check admin permissions
    if (req.user.role !== 'admin') {
      return sendResponse(res, 403, false, 'Access denied. Admin role required.');
    }

    const category = await ActivityCategory.findById(id);
    if (!category) {
      return sendResponse(res, 404, false, 'Category not found');
    }

    const updateData = req.body;

    // If parent is being changed, recalculate level and path
    if (updateData.parent !== undefined && updateData.parent !== category.parent?.toString()) {
      if (updateData.parent) {
        // Prevent circular reference
        if (updateData.parent === id) {
          return sendResponse(res, 400, false, 'Category cannot be its own parent');
        }

        const parentCategory = await ActivityCategory.findById(updateData.parent);
        if (!parentCategory) {
          return sendResponse(res, 400, false, 'Parent category not found');
        }
        
        // Check if the new parent is not a descendant of this category
        const checkCircular = async (parentId, targetId) => {
          const parent = await ActivityCategory.findById(parentId);
          if (!parent) return false;
          if (parent.parent?.toString() === targetId) return true;
          if (parent.parent) return await checkCircular(parent.parent, targetId);
          return false;
        };

        if (await checkCircular(updateData.parent, id)) {
          return sendResponse(res, 400, false, 'Cannot create circular reference');
        }
        
        updateData.level = parentCategory.level + 1;
        updateData.path = parentCategory.path 
          ? `${parentCategory.path}/${updateData.slug || category.slug}`
          : (updateData.slug || category.slug);
      } else {
        updateData.level = 0;
        updateData.path = updateData.slug || category.slug;
      }
    }

    // Update slug and regenerate path if name changed
    if (updateData.name && updateData.name !== category.name) {
      if (!updateData.slug) {
        updateData.slug = updateData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }
      
      // Update path if slug changed
      if (updateData.slug !== category.slug) {
        if (category.parent) {
          const parentCategory = await ActivityCategory.findById(category.parent);
          updateData.path = parentCategory.path 
            ? `${parentCategory.path}/${updateData.slug}`
            : updateData.slug;
        } else {
          updateData.path = updateData.slug;
        }
      }
    }

    const updatedCategory = await ActivityCategory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    return sendResponse(res, 200, true, 'Category updated successfully', { 
      category: updatedCategory 
    });

  } catch (error) {
    console.error('Update category error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return sendResponse(res, 400, false, 'Validation error', { errors });
    }

    if (error.code === 11000) {
      return sendResponse(res, 409, false, 'Category with this name or slug already exists');
    }

    return sendResponse(res, 500, false, 'Failed to update category');
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, false, 'Invalid category ID');
    }

    // Check admin permissions
    if (req.user.role !== 'admin') {
      return sendResponse(res, 403, false, 'Access denied. Admin role required.');
    }

    const category = await ActivityCategory.findById(id);
    if (!category) {
      return sendResponse(res, 404, false, 'Category not found');
    }

    // Check if category has subcategories
    const subcategoryCount = await ActivityCategory.countDocuments({ parent: id });
    if (subcategoryCount > 0) {
      return sendResponse(res, 400, false, 'Cannot delete category with subcategories');
    }

    // Check if category has activities
    const activityCount = await Activity.countDocuments({ category: category.slug });
    if (activityCount > 0) {
      return sendResponse(res, 400, false, 'Cannot delete category with existing activities');
    }

    await ActivityCategory.findByIdAndDelete(id);

    return sendResponse(res, 200, true, 'Category deleted successfully');

  } catch (error) {
    console.error('Delete category error:', error);
    return sendResponse(res, 500, false, 'Failed to delete category');
  }
};

// Toggle category status
const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, false, 'Invalid category ID');
    }

    // Check admin permissions
    if (req.user.role !== 'admin') {
      return sendResponse(res, 403, false, 'Access denied. Admin role required.');
    }

    if (typeof isActive !== 'boolean') {
      return sendResponse(res, 400, false, 'isActive must be a boolean value');
    }

    const category = await ActivityCategory.findById(id);
    if (!category) {
      return sendResponse(res, 404, false, 'Category not found');
    }

    category.isActive = isActive;
    await category.save();

    return sendResponse(res, 200, true, `Category ${isActive ? 'activated' : 'deactivated'} successfully`, { 
      category 
    });

  } catch (error) {
    console.error('Toggle category status error:', error);
    return sendResponse(res, 500, false, 'Failed to update category status');
  }
};

// Reorder categories
const reorderCategories = async (req, res) => {
  try {
    // Check admin permissions
    if (req.user.role !== 'admin') {
      return sendResponse(res, 403, false, 'Access denied. Admin role required.');
    }

    const { categories } = req.body;

    if (!Array.isArray(categories)) {
      return sendResponse(res, 400, false, 'Categories must be an array');
    }

    // Update order for each category
    const updatePromises = categories.map((cat, index) => {
      if (!mongoose.Types.ObjectId.isValid(cat.id)) {
        throw new Error(`Invalid category ID: ${cat.id}`);
      }
      
      return ActivityCategory.findByIdAndUpdate(
        cat.id, 
        { order: index },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    return sendResponse(res, 200, true, 'Categories reordered successfully');

  } catch (error) {
    console.error('Reorder categories error:', error);
    return sendResponse(res, 500, false, 'Failed to reorder categories');
  }
};

// Get category statistics
const getCategoryStats = async (req, res) => {
  try {
    // Check admin permissions
    if (req.user.role !== 'admin') {
      return sendResponse(res, 403, false, 'Access denied. Admin role required.');
    }

    const stats = await ActivityCategory.aggregate([
      {
        $group: {
          _id: null,
          totalCategories: { $sum: 1 },
          activeCategories: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          topLevelCategories: {
            $sum: { $cond: [{ $eq: ['$level', 0] }, 1, 0] }
          },
          subcategories: {
            $sum: { $cond: [{ $gt: ['$level', 0] }, 1, 0] }
          }
        }
      }
    ]);

    // Get categories with most activities
    const categoriesWithCounts = await ActivityCategory.find({ isActive: true })
      .sort({ order: 1 })
      .lean();

    for (const category of categoriesWithCounts) {
      category.activityCount = await Activity.countDocuments({ 
        category: category.slug,
        status: 'active',
        isPublished: true
      });
    }

    const topCategories = categoriesWithCounts
      .sort((a, b) => b.activityCount - a.activityCount)
      .slice(0, 10);

    return sendResponse(res, 200, true, 'Category statistics retrieved successfully', {
      overview: stats[0] || {
        totalCategories: 0,
        activeCategories: 0,
        topLevelCategories: 0,
        subcategories: 0
      },
      topCategories
    });

  } catch (error) {
    console.error('Get category stats error:', error);
    return sendResponse(res, 500, false, 'Failed to retrieve category statistics');
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  reorderCategories,
  getCategoryStats
};