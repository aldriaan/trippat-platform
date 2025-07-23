const Category = require('../models/Category');
const mongoose = require('mongoose');

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const { withStats = false } = req.query;
    
    let categories;
    if (withStats === 'true') {
      categories = await Category.getAllWithStats();
    } else {
      categories = await Category.find({ status: 'active' }).sort({ order: 1 });
    }
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }
    
    const category = await Category.findById(id);
    
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
      }
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category'
    });
  }
};

// Create new category
const createCategory = async (req, res) => {
  try {
    const {
      name_en,
      name_ar,
      description_en,
      description_ar,
      packageCategory,
      icon,
      color,
      order
    } = req.body;
    
    // Validate required fields
    if (!name_en || !name_ar || !description_en || !description_ar || !packageCategory) {
      return res.status(400).json({
        success: false,
        message: 'Name (English and Arabic), description (English and Arabic), and package category are required'
      });
    }
    
    // Generate slug from English name
    const slug = name_en.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    
    const categoryData = {
      name: {
        en: name_en,
        ar: name_ar
      },
      description: {
        en: description_en,
        ar: description_ar
      },
      slug,
      packageCategory,
      icon: icon || 'Package',
      color: color || '#3B82F6',
      order: order || 0
    };
    
    const category = new Category(categoryData);
    await category.save();
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name_en,
      name_ar,
      description_en,
      description_ar,
      packageCategory,
      icon,
      color,
      order,
      status
    } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Update fields if provided
    if (name_en) category.name.en = name_en;
    if (name_ar) category.name.ar = name_ar;
    if (description_en) category.description.en = description_en;
    if (description_ar) category.description.ar = description_ar;
    if (packageCategory) category.packageCategory = packageCategory;
    if (icon) category.icon = icon;
    if (color) category.color = color;
    if (order !== undefined) category.order = order;
    if (status) category.status = status;
    
    // Update slug if English name changed
    if (name_en) {
      const newSlug = name_en.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Check if new slug conflicts with existing categories
      const existingCategory = await Category.findOne({ 
        slug: newSlug, 
        _id: { $ne: id } 
      });
      
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
      
      category.slug = newSlug;
    }
    
    await category.save();
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if category is being used by packages
    const Package = require('../models/Package');
    const packagesUsingCategory = await Package.countDocuments({ 
      category: category.packageCategory 
    });
    
    if (packagesUsingCategory > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It is being used by ${packagesUsingCategory} package(s).`
      });
    }
    
    await Category.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};