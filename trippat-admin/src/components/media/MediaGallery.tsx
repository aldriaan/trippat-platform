'use client';

import React, { useState, useCallback, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableMediaItem } from './SortableMediaItem';
import MediaUploader from './MediaUploader';
import MediaViewer from './MediaViewer';
import MediaMetadataEditor from './MediaMetadataEditor';
import { Media, MediaUploadProgress } from '@/types/media';
import { getApiUrl } from '@/lib/api';
import { 
  Image as ImageIcon, 
  Video, 
  Plus, 
  Grid, 
  List, 
  Filter,
  Search,
  Download,
  Trash2,
  Edit,
  Star,
  Eye,
  EyeOff,
  MoreVertical,
  Check,
  X,
  AlertCircle,
  Info
} from 'lucide-react';

interface MediaGalleryProps {
  packageId: string;
  media: Media[];
  onMediaUpdate: (updatedMedia: Media[]) => void;
  onFeaturedImageChange?: (mediaId: string) => void;
  readOnly?: boolean;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({
  packageId,
  media: initialMedia,
  onMediaUpdate,
  onFeaturedImageChange,
  readOnly = false
}) => {
  const [media, setMedia] = useState<Media[]>(initialMedia);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showUploader, setShowUploader] = useState(false);
  const [showMetadataEditor, setShowMetadataEditor] = useState(false);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const [uploadProgress, setUploadProgress] = useState<MediaUploadProgress[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter media based on search and type
  const filteredMedia = media.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = !searchTerm || 
      item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.metadata.altText?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.metadata.caption?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.metadata.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesType && matchesSearch && item.isVisible;
  });

  // Handle drag end for reordering
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = media.findIndex(item => item._id === active.id);
      const newIndex = media.findIndex(item => item._id === over.id);

      const newMedia = arrayMove(media, oldIndex, newIndex);
      setMedia(newMedia);

      // Update order in backend
      try {
        const response = await fetch(`${getApiUrl()}/media/package/${packageId}/reorder`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            mediaOrder: newMedia.map(item => item._id)
          })
        });

        if (!response.ok) {
          throw new Error('Failed to reorder media');
        }

        onMediaUpdate(newMedia);
      } catch (error) {
        console.error('Error reordering media:', error);
        // Revert on error
        setMedia(media);
      }
    }
  };

  // Handle media upload
  const handleMediaUpload = async (files: File[]) => {
    const newProgress: MediaUploadProgress[] = files.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const
    }));

    setUploadProgress(prev => [...prev, ...newProgress]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progressIndex = uploadProgress.length + i;

      try {
        // Update progress to uploading
        setUploadProgress(prev => 
          prev.map((p, idx) => 
            idx === progressIndex ? { ...p, status: 'uploading' as const } : p
          )
        );

        const formData = new FormData();
        formData.append(file.type.startsWith('video/') ? 'video' : 'images', file);

        const endpoint = file.type.startsWith('video/') 
          ? `${getApiUrl()}/media/upload/video/${packageId}`
          : `${getApiUrl()}/media/upload/images/${packageId}`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json();
        const newMedia = Array.isArray(result.data) ? result.data : [result.data];

        setMedia(prev => [...prev, ...newMedia]);
        onMediaUpdate([...media, ...newMedia]);

        // Update progress to complete
        setUploadProgress(prev => 
          prev.map((p, idx) => 
            idx === progressIndex ? { ...p, status: 'complete' as const, media: newMedia[0] } : p
          )
        );
      } catch (error) {
        console.error('Upload error:', error);
        setUploadProgress(prev => 
          prev.map((p, idx) => 
            idx === progressIndex ? { ...p, status: 'error' as const, error: 'Upload failed' } : p
          )
        );
      }
    }

    // Clear completed uploads after 3 seconds
    setTimeout(() => {
      setUploadProgress(prev => prev.filter(p => p.status !== 'complete'));
    }, 3000);
  };

  // Set featured image
  const handleSetFeatured = async (mediaId: string) => {
    try {
      const response = await fetch(`${getApiUrl()}/media/${mediaId}/featured`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to set featured image');
      }

      const updatedMedia = media.map(item => ({
        ...item,
        isFeatured: item._id === mediaId
      }));

      setMedia(updatedMedia);
      onMediaUpdate(updatedMedia);
      onFeaturedImageChange?.(mediaId);
    } catch (error) {
      console.error('Error setting featured image:', error);
    }
  };

  // Delete media
  const handleDeleteMedia = async (mediaIds: string[]) => {
    if (!confirm(`Are you sure you want to delete ${mediaIds.length} item(s)?`)) {
      return;
    }

    try {
      for (const mediaId of mediaIds) {
        const response = await fetch(`${getApiUrl()}/media/${mediaId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete media');
        }
      }

      const updatedMedia = media.filter(item => !mediaIds.includes(item._id));
      setMedia(updatedMedia);
      onMediaUpdate(updatedMedia);
      setSelectedItems([]);
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  // Toggle visibility
  const handleToggleVisibility = async (mediaId: string) => {
    const item = media.find(m => m._id === mediaId);
    if (!item) return;

    try {
      const response = await fetch(`${getApiUrl()}/media/${mediaId}/metadata`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          metadata: {
            ...item.metadata,
            isVisible: !item.isVisible
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update visibility');
      }

      const updatedMedia = media.map(m => 
        m._id === mediaId ? { ...m, isVisible: !m.isVisible } : m
      );

      setMedia(updatedMedia);
      onMediaUpdate(updatedMedia);
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  // Update metadata
  const handleMetadataUpdate = async (mediaId: string, metadata: any) => {
    try {
      const response = await fetch(`${getApiUrl()}/media/${mediaId}/metadata`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ metadata })
      });

      if (!response.ok) {
        throw new Error('Failed to update metadata');
      }

      const updatedMedia = media.map(m => 
        m._id === mediaId ? { ...m, metadata } : m
      );

      setMedia(updatedMedia);
      onMediaUpdate(updatedMedia);
      setShowMetadataEditor(false);
      setEditingMedia(null);
    } catch (error) {
      console.error('Error updating metadata:', error);
    }
  };

  const featuredImage = media.find(m => m.isFeatured && m.type === 'image');
  const imageCount = media.filter(m => m.type === 'image').length;
  const videoCount = media.filter(m => m.type === 'video').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Media Gallery</h3>
          <p className="text-sm text-gray-500 mt-1">
            {imageCount} images, {videoCount} videos
          </p>
        </div>
        
        {!readOnly && (
          <button
            onClick={() => setShowUploader(true)}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Media
          </button>
        )}
      </div>

      {/* Featured Image */}
      {featuredImage && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-4">
            <img
              src={featuredImage.sizes?.find(s => s.name === 'small')?.url || featuredImage.originalUrl}
              alt={featuredImage.metadata.altText?.en || 'Featured image'}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-900">Featured Image</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{featuredImage.filename}</p>
              {featuredImage.metadata.caption?.en && (
                <p className="text-sm text-gray-500 mt-2">{featuredImage.metadata.caption.en}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Media</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>

          {/* Bulk actions */}
          {selectedItems.length > 0 && !readOnly && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedItems.length} selected
              </span>
              <button
                onClick={() => handleDeleteMedia(selectedItems)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* View mode */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${
              viewMode === 'grid' ? 'bg-primary-50 text-primary' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${
              viewMode === 'list' ? 'bg-primary-50 text-primary' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2">
          {uploadProgress.map((progress, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {progress.file.name}
                </span>
                <span className="text-sm text-gray-500">
                  {progress.status === 'complete' && <Check className="h-4 w-4 text-green-500" />}
                  {progress.status === 'error' && <X className="h-4 w-4 text-red-500" />}
                </span>
              </div>
              {progress.status === 'uploading' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              )}
              {progress.error && (
                <p className="text-sm text-red-600 mt-1">{progress.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Gallery */}
      {filteredMedia.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredMedia.map(m => m._id)}
            strategy={rectSortingStrategy}
          >
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" 
              : "space-y-2"
            }>
              {filteredMedia.map((item) => (
                <SortableMediaItem
                  key={item._id}
                  media={item}
                  viewMode={viewMode}
                  isSelected={selectedItems.includes(item._id)}
                  onSelect={(selected) => {
                    if (selected) {
                      setSelectedItems([...selectedItems, item._id]);
                    } else {
                      setSelectedItems(selectedItems.filter(id => id !== item._id));
                    }
                  }}
                  onView={() => setSelectedMedia(item)}
                  onEdit={() => {
                    setEditingMedia(item);
                    setShowMetadataEditor(true);
                  }}
                  onSetFeatured={() => handleSetFeatured(item._id)}
                  onToggleVisibility={() => handleToggleVisibility(item._id)}
                  onDelete={() => handleDeleteMedia([item._id])}
                  readOnly={readOnly}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No media found</p>
          {!readOnly && (
            <button
              onClick={() => setShowUploader(true)}
              className="mt-4 text-primary hover:text-blue-700"
            >
              Upload your first media
            </button>
          )}
        </div>
      )}

      {/* Media Uploader Modal */}
      {showUploader && (
        <MediaUploader
          packageId={packageId}
          onUpload={handleMediaUpload}
          onClose={() => setShowUploader(false)}
        />
      )}

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <MediaViewer
          media={selectedMedia}
          allMedia={filteredMedia}
          onClose={() => setSelectedMedia(null)}
          onNext={(nextMedia) => setSelectedMedia(nextMedia)}
          onPrevious={(prevMedia) => setSelectedMedia(prevMedia)}
        />
      )}

      {/* Metadata Editor Modal */}
      {showMetadataEditor && editingMedia && (
        <MediaMetadataEditor
          media={editingMedia}
          onSave={(metadata) => handleMetadataUpdate(editingMedia._id, metadata)}
          onClose={() => {
            setShowMetadataEditor(false);
            setEditingMedia(null);
          }}
        />
      )}
    </div>
  );
};

export default MediaGallery;