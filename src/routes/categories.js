const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authenticate } = require('../middleware/auth');

// Get all categories with statistics
router.get('/', async (req, res) => {
  try {
    const categories = await Category.getAllWithStats();
    
    res.json({
      success: true,
      data: categories,
      message: 'Categories retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// Get category by ID with statistics
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    const stats = await category.getStats();
    
    res.json({
      success: true,
      data: {
        ...category.toObject(),
        stats
      },
      message: 'Category retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
});

// Create new category (admin only)
router.post('/', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create categories'
      });
    }
    
    const categoryData = req.body;
    
    // Generate slug if not provided
    if (!categoryData.slug) {
      categoryData.slug = categoryData.name.en
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    // Set order if not provided
    if (!categoryData.order) {
      const maxOrder = await Category.findOne().sort({ order: -1 }).select('order');
      categoryData.order = maxOrder ? maxOrder.order + 1 : 1;
    }
    
    const category = new Category(categoryData);
    await category.save();
    
    const stats = await category.getStats();
    
    res.status(201).json({
      success: true,
      data: {
        ...category.toObject(),
        stats
      },
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Error creating category:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category slug already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
});

// Update category (admin only)
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update categories'
      });
    }
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    const stats = await category.getStats();
    
    res.json({
      success: true,
      data: {
        ...category.toObject(),
        stats
      },
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category slug already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete categories'
      });
    }
    
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
});

// Update category status (admin only)
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update category status'
      });
    }
    
    const { status } = req.body;
    
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "active" or "inactive"'
      });
    }
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    const stats = await category.getStats();
    
    res.json({
      success: true,
      data: {
        ...category.toObject(),
        stats
      },
      message: 'Category status updated successfully'
    });
  } catch (error) {
    console.error('Error updating category status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category status',
      error: error.message
    });
  }
});

// Update category order (admin only)
router.patch('/order', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update category order'
      });
    }
    
    const { categories } = req.body;
    
    if (!Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        message: 'Categories must be an array'
      });
    }
    
    // Update each category's order
    await Promise.all(
      categories.map(({ id, order }) => 
        Category.findByIdAndUpdate(id, { order }, { new: true })
      )
    );
    
    res.json({
      success: true,
      message: 'Category order updated successfully'
    });
  } catch (error) {
    console.error('Error updating category order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category order',
      error: error.message
    });
  }
});

// Bulk actions (admin only)
router.post('/bulk', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can perform bulk actions'
      });
    }
    
    const { categoryIds, action } = req.body;
    
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Category IDs must be a non-empty array'
      });
    }
    
    let updateData = {};
    let message = '';
    
    switch (action) {
      case 'activate':
        updateData = { status: 'active' };
        message = 'Categories activated successfully';
        break;
      case 'deactivate':
        updateData = { status: 'inactive' };
        message = 'Categories deactivated successfully';
        break;
      case 'delete':
        await Category.deleteMany({ _id: { $in: categoryIds } });
        return res.json({
          success: true,
          message: 'Categories deleted successfully'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Must be "activate", "deactivate", or "delete"'
        });
    }
    
    await Category.updateMany(
      { _id: { $in: categoryIds } },
      updateData
    );
    
    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk action',
      error: error.message
    });
  }
});

// Export categories
router.get('/export', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can export categories'
      });
    }
    
    const { format = 'json' } = req.query;
    const categories = await Category.getAllWithStats();
    
    if (format === 'csv') {
      const csv = categories.map(cat => 
        `${cat._id},"${cat.name.en}","${cat.name.ar}","${cat.description.en}","${cat.description.ar}",${cat.slug},${cat.status},${cat.order},${cat.stats.packageCount},${cat.stats.totalBookings},${cat.stats.revenue},${cat.stats.conversionRate}`
      ).join('\n');
      
      const header = 'id,name_en,name_ar,description_en,description_ar,slug,status,order,package_count,total_bookings,revenue,conversion_rate\n';
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="categories.csv"');
      res.send(header + csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="categories.json"');
      res.json(categories);
    }
  } catch (error) {
    console.error('Error exporting categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export categories',
      error: error.message
    });
  }
});

module.exports = router;