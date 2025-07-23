'use client';

import React, { useState } from 'react';
import { Media, MediaMetadata } from '@/types/media';
import { 
  X, 
  Save, 
  Tag, 
  Type, 
  FileText, 
  User, 
  Copyright, 
  MapPin, 
  Plus,
  Minus,
  Globe,
  Image as ImageIcon,
  Video
} from 'lucide-react';

interface MediaMetadataEditorProps {
  media: Media;
  onSave: (metadata: MediaMetadata) => void;
  onClose: () => void;
}

const MediaMetadataEditor: React.FC<MediaMetadataEditorProps> = ({
  media,
  onSave,
  onClose
}) => {
  const [metadata, setMetadata] = useState<MediaMetadata>({
    altText: media.metadata.altText || { en: '', ar: '' },
    caption: media.metadata.caption || { en: '', ar: '' },
    tags: media.metadata.tags || [],
    credit: media.metadata.credit || '',
    copyright: media.metadata.copyright || '',
    location: media.metadata.location || { name: '', coordinates: [0, 0] }
  });

  const [activeLanguage, setActiveLanguage] = useState<'en' | 'ar'>('en');
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: keyof MediaMetadata, value: any) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLanguageSpecificChange = (
    field: 'altText' | 'caption',
    language: 'en' | 'ar',
    value: string
  ) => {
    setMetadata(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [language]: value
      }
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !metadata.tags.includes(newTag.trim())) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Alt text is required for images
    if (media.type === 'image' && !metadata.altText.en?.trim()) {
      newErrors.altText = 'Alt text is required for images';
    }

    // Tags should not be empty
    if (metadata.tags.some(tag => !tag.trim())) {
      newErrors.tags = 'Tags cannot be empty';
    }

    // Location coordinates validation
    if (metadata.location?.name && (
      isNaN(metadata.location.coordinates[0]) || 
      isNaN(metadata.location.coordinates[1])
    )) {
      newErrors.location = 'Invalid coordinates';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(metadata);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const thumbnailUrl = media.type === 'image' 
    ? media.sizes?.find(s => s.name === 'thumbnail')?.url || media.originalUrl
    : media.videoMetadata?.thumbnail?.url || '/images/video-placeholder.png';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={thumbnailUrl}
                alt={media.filename}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Metadata</h2>
              <p className="text-sm text-gray-500">{media.filename}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]" onKeyDown={handleKeyDown}>
          <div className="space-y-8">
            {/* Language Toggle */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Language:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveLanguage('en')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    activeLanguage === 'en' 
                      ? 'bg-white text-gray-900 shadow' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setActiveLanguage('ar')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    activeLanguage === 'ar' 
                      ? 'bg-white text-gray-900 shadow' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  العربية
                </button>
              </div>
            </div>

            {/* Alt Text */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Type className="h-4 w-4 mr-2" />
                Alt Text ({activeLanguage === 'en' ? 'English' : 'Arabic'})
                {media.type === 'image' && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="text"
                value={metadata.altText[activeLanguage] || ''}
                onChange={(e) => handleLanguageSpecificChange('altText', activeLanguage, e.target.value)}
                placeholder={`Describe the ${media.type} in ${activeLanguage === 'en' ? 'English' : 'Arabic'}`}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.altText ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.altText && (
                <p className="text-red-500 text-sm mt-1">{errors.altText}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Brief description for accessibility and SEO
              </p>
            </div>

            {/* Caption */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 mr-2" />
                Caption ({activeLanguage === 'en' ? 'English' : 'Arabic'})
              </label>
              <textarea
                value={metadata.caption[activeLanguage] || ''}
                onChange={(e) => handleLanguageSpecificChange('caption', activeLanguage, e.target.value)}
                placeholder={`Add a caption in ${activeLanguage === 'en' ? 'English' : 'Arabic'}`}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Detailed description shown with the media
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Tag className="h-4 w-4 mr-2" />
                Tags
              </label>
              <div className="space-y-3">
                {/* Add new tag */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add a tag"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Existing tags */}
                {metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {metadata.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-primary hover:text-primary-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                {errors.tags && (
                  <p className="text-red-500 text-sm">{errors.tags}</p>
                )}
              </div>
            </div>

            {/* Credit */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 mr-2" />
                Credit
              </label>
              <input
                type="text"
                value={metadata.credit || ''}
                onChange={(e) => handleInputChange('credit', e.target.value)}
                placeholder="Photographer or source credit"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Copyright */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Copyright className="h-4 w-4 mr-2" />
                Copyright
              </label>
              <input
                type="text"
                value={metadata.copyright || ''}
                onChange={(e) => handleInputChange('copyright', e.target.value)}
                placeholder="Copyright information"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 mr-2" />
                Location
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  value={metadata.location?.name || ''}
                  onChange={(e) => handleInputChange('location', {
                    ...metadata.location,
                    name: e.target.value
                  })}
                  placeholder="Location name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={metadata.location?.coordinates[1] || ''}
                    onChange={(e) => handleInputChange('location', {
                      ...metadata.location,
                      coordinates: [
                        metadata.location?.coordinates[0] || 0,
                        parseFloat(e.target.value) || 0
                      ]
                    })}
                    placeholder="Latitude"
                    step="any"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={metadata.location?.coordinates[0] || ''}
                    onChange={(e) => handleInputChange('location', {
                      ...metadata.location,
                      coordinates: [
                        parseFloat(e.target.value) || 0,
                        metadata.location?.coordinates[1] || 0
                      ]
                    })}
                    placeholder="Longitude"
                    step="any"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                {errors.location && (
                  <p className="text-red-500 text-sm">{errors.location}</p>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
              <div className="flex space-x-4">
                <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={thumbnailUrl}
                    alt={metadata.altText.en || 'Preview'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {media.type === 'image' ? (
                      <ImageIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Video className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {media.filename}
                    </span>
                  </div>
                  {metadata.altText.en && (
                    <p className="text-sm text-gray-600 mb-2">
                      {metadata.altText.en}
                    </p>
                  )}
                  {metadata.caption.en && (
                    <p className="text-sm text-gray-500 mb-2">
                      {metadata.caption.en}
                    </p>
                  )}
                  {metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {metadata.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {metadata.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{metadata.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            Press <kbd className="px-2 py-1 bg-gray-200 rounded">⌘</kbd> + <kbd className="px-2 py-1 bg-gray-200 rounded">Enter</kbd> to save
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Metadata
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaMetadataEditor;