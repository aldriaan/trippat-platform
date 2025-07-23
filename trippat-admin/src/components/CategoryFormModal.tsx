'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Palette, 
  Hash, 
  Globe, 
  Image as ImageIcon,
  Eye,
  Save,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

// Types (should be moved to a shared types file)
interface Category {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  slug: string;
  icon: string;
  color: string;
  status: 'active' | 'inactive';
  parentId?: string;
  order: number;
  image?: string;
  seo: {
    metaTitle: {
      en: string;
      ar: string;
    };
    metaDescription: {
      en: string;
      ar: string;
    };
    keywords: string[];
  };
  stats: {
    packageCount: number;
    totalBookings: number;
    revenue: number;
    conversionRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface CategoryFormData {
  name: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  slug: string;
  icon: string;
  color: string;
  parentId?: string;
  image?: string;
  seo: {
    metaTitle: {
      en: string;
      ar: string;
    };
    metaDescription: {
      en: string;
      ar: string;
    };
    keywords: string[];
  };
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => void;
  type: 'create' | 'edit' | 'duplicate';
  category?: Category | null;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  type,
  category
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'seo' | 'media' | 'hierarchy'>('basic');
  const [formData, setFormData] = useState<CategoryFormData>({
    name: { en: '', ar: '' },
    description: { en: '', ar: '' },
    slug: '',
    icon: 'Package',
    color: '#3B82F6',
    parentId: undefined,
    image: undefined,
    seo: {
      metaTitle: { en: '', ar: '' },
      metaDescription: { en: '', ar: '' },
      keywords: []
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');

  // Available icons
  const iconOptions = [
    { value: 'Package', label: 'Package', icon: '📦' },
    { value: 'Mountain', label: 'Mountain', icon: '🏔️' },
    { value: 'Star', label: 'Star', icon: '⭐' },
    { value: 'Users', label: 'Users', icon: '👥' },
    { value: 'Heart', label: 'Heart', icon: '❤️' },
    { value: 'Camera', label: 'Camera', icon: '📸' },
    { value: 'Utensils', label: 'Utensils', icon: '🍽️' },
    { value: 'Building', label: 'Building', icon: '🏢' },
    { value: 'TreePine', label: 'Tree', icon: '🌲' },
    { value: 'Waves', label: 'Waves', icon: '🌊' }
  ];

  // Color options
  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6B7280'
  ];

  // Mock parent categories
  const parentCategories = [
    { id: 'travel', name: 'Travel Types' },
    { id: 'activities', name: 'Activities' },
    { id: 'destinations', name: 'Destinations' }
  ];

  useEffect(() => {
    if (category && (type === 'edit' || type === 'duplicate')) {
      setFormData({
        name: category.name,
        description: category.description,
        slug: type === 'duplicate' ? `${category.slug}-copy` : category.slug,
        icon: category.icon,
        color: category.color,
        parentId: category.parentId,
        image: category.image,
        seo: category.seo
      });
    } else {
      // Reset form for create
      setFormData({
        name: { en: '', ar: '' },
        description: { en: '', ar: '' },
        slug: '',
        icon: 'Package',
        color: '#3B82F6',
        parentId: undefined,
        image: undefined,
        seo: {
          metaTitle: { en: '', ar: '' },
          metaDescription: { en: '', ar: '' },
          keywords: []
        }
      });
    }
  }, [category, type]);

  // Auto-generate slug from English name
  useEffect(() => {
    if (formData.name.en && type === 'create') {
      const slug = formData.name.en
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name.en, type]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.en.trim()) {
      newErrors['name.en'] = 'English name is required';
    }

    if (!formData.name.ar.trim()) {
      newErrors['name.ar'] = 'Arabic name is required';
    }

    if (!formData.description.en.trim()) {
      newErrors['description.en'] = 'English description is required';
    }

    if (!formData.description.ar.trim()) {
      newErrors['description.ar'] = 'Arabic description is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave(formData);
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.seo.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          keywords: [...prev.seo.keywords, keywordInput.trim()]
        }
      }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.filter(k => k !== keyword)
      }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to your server/cloud storage
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {type === 'create' ? 'Create New Category' : 
             type === 'edit' ? 'Edit Category' : 'Duplicate Category'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'basic', label: 'Basic Info', icon: Info },
              { id: 'seo', label: 'SEO', icon: Globe },
              { id: 'media', label: 'Media', icon: ImageIcon },
              { id: 'hierarchy', label: 'Hierarchy', icon: Hash }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit}>
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* English Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name (English) *
                    </label>
                    <input
                      type="text"
                      value={formData.name.en}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        name: { ...prev.name, en: e.target.value }
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors['name.en'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter English name"
                    />
                    {errors['name.en'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['name.en']}</p>
                    )}
                  </div>

                  {/* Arabic Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name (Arabic) *
                    </label>
                    <input
                      type="text"
                      value={formData.name.ar}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        name: { ...prev.name, ar: e.target.value }
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-right ${
                        errors['name.ar'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="أدخل الاسم بالعربية"
                      dir="rtl"
                    />
                    {errors['name.ar'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['name.ar']}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* English Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (English) *
                    </label>
                    <textarea
                      value={formData.description.en}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        description: { ...prev.description, en: e.target.value }
                      }))}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors['description.en'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter English description"
                    />
                    {errors['description.en'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['description.en']}</p>
                    )}
                  </div>

                  {/* Arabic Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Arabic) *
                    </label>
                    <textarea
                      value={formData.description.ar}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        description: { ...prev.description, ar: e.target.value }
                      }))}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-right ${
                        errors['description.ar'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="أدخل الوصف بالعربية"
                      dir="rtl"
                    />
                    {errors['description.ar'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['description.ar']}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug *
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        slug: e.target.value
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.slug ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="category-slug"
                    />
                    {errors.slug && (
                      <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                    )}
                  </div>

                  {/* Icon */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon
                    </label>
                    <select
                      value={formData.icon}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        icon: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {iconOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.icon} {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          color: e.target.value
                        }))}
                        className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <div className="flex flex-wrap gap-1">
                        {colorOptions.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              color
                            }))}
                            className={`w-6 h-6 rounded-full border-2 ${
                              formData.color === color ? 'border-gray-800' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Meta Title English */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title (English)
                    </label>
                    <input
                      type="text"
                      value={formData.seo.metaTitle.en}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        seo: {
                          ...prev.seo,
                          metaTitle: { ...prev.seo.metaTitle, en: e.target.value }
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="SEO title in English"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.seo.metaTitle.en.length}/60 characters
                    </p>
                  </div>

                  {/* Meta Title Arabic */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title (Arabic)
                    </label>
                    <input
                      type="text"
                      value={formData.seo.metaTitle.ar}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        seo: {
                          ...prev.seo,
                          metaTitle: { ...prev.seo.metaTitle, ar: e.target.value }
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-right"
                      placeholder="عنوان SEO بالعربية"
                      dir="rtl"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.seo.metaTitle.ar.length}/60 characters
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Meta Description English */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description (English)
                    </label>
                    <textarea
                      value={formData.seo.metaDescription.en}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        seo: {
                          ...prev.seo,
                          metaDescription: { ...prev.seo.metaDescription, en: e.target.value }
                        }
                      }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="SEO description in English"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.seo.metaDescription.en.length}/160 characters
                    </p>
                  </div>

                  {/* Meta Description Arabic */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description (Arabic)
                    </label>
                    <textarea
                      value={formData.seo.metaDescription.ar}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        seo: {
                          ...prev.seo,
                          metaDescription: { ...prev.seo.metaDescription, ar: e.target.value }
                        }
                      }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-right"
                      placeholder="وصف SEO بالعربية"
                      dir="rtl"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.seo.metaDescription.ar.length}/160 characters
                    </p>
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords
                  </label>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter keyword and press Enter"
                    />
                    <button
                      type="button"
                      onClick={handleAddKeyword}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.seo.keywords.map(keyword => (
                      <span
                        key={keyword}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="ml-2 text-primary hover:text-primary-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Media Tab */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {formData.image ? (
                      <div className="space-y-4">
                        <img
                          src={formData.image}
                          alt="Category preview"
                          className="max-w-full max-h-48 mx-auto rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, image: undefined }))}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-gray-600 mb-2">Upload category image</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                          />
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 inline-flex items-center space-x-2"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Choose Image</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Hierarchy Tab */}
            {activeTab === 'hierarchy' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Category
                  </label>
                  <select
                    value={formData.parentId || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      parentId: e.target.value || undefined
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">No Parent (Root Category)</option>
                    {parentCategories.map(parent => (
                      <option key={parent.id} value={parent.id}>
                        {parent.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a parent category to create a subcategory
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Category Preview</h4>
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: formData.color }}
                    >
                      {iconOptions.find(icon => icon.value === formData.icon)?.icon}
                    </div>
                    <div>
                      <p className="font-medium">{formData.name.en || 'Category Name'}</p>
                      <p className="text-sm text-gray-500">{formData.description.en || 'Category description'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            {Object.keys(errors).length > 0 && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Please fix the errors above</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Category</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryFormModal;