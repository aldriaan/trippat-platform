'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Media } from '@/types/media';
import { 
  Image as ImageIcon, 
  Video, 
  MoreVertical, 
  Eye, 
  Edit, 
  Star, 
  EyeOff, 
  Trash2,
  GripVertical,
  Check,
  AlertCircle,
  Play
} from 'lucide-react';

interface SortableMediaItemProps {
  media: Media;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onView: () => void;
  onEdit: () => void;
  onSetFeatured: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
  readOnly?: boolean;
}

export const SortableMediaItem: React.FC<SortableMediaItemProps> = ({
  media,
  viewMode,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onSetFeatured,
  onToggleVisibility,
  onDelete,
  readOnly = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: media._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [showMenu, setShowMenu] = React.useState(false);

  const thumbnailUrl = media.type === 'image' 
    ? media.sizes?.find(s => s.name === 'thumbnail')?.url || media.originalUrl
    : media.videoMetadata?.thumbnail?.url || '/images/video-placeholder.png';

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (viewMode === 'grid') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`relative group bg-white rounded-lg shadow-sm hover:shadow-md transition-all ${
          isSelected ? 'ring-2 ring-primary' : ''
        } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {/* Selection checkbox */}
        {!readOnly && (
          <div className="absolute top-2 left-2 z-10">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Drag handle */}
        {!readOnly && (
          <div
            className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
        )}

        {/* Media preview */}
        <div 
          className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100 cursor-pointer"
          onClick={onView}
        >
          <img
            src={thumbnailUrl}
            alt={media.metadata.altText?.en || media.filename}
            className="w-full h-full object-cover"
          />
          
          {/* Type indicator */}
          <div className="absolute top-2 right-10 bg-black bg-opacity-50 rounded-full p-1">
            {media.type === 'image' ? (
              <ImageIcon className="h-4 w-4 text-white" />
            ) : (
              <Video className="h-4 w-4 text-white" />
            )}
          </div>

          {/* Video duration */}
          {media.type === 'video' && media.videoMetadata?.duration && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {formatDuration(media.videoMetadata.duration)}
            </div>
          )}

          {/* Featured badge */}
          {media.isFeatured && (
            <div className="absolute top-2 left-10 bg-yellow-500 rounded-full p-1">
              <Star className="h-4 w-4 text-white fill-white" />
            </div>
          )}

          {/* Hidden indicator */}
          {!media.isVisible && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <EyeOff className="h-8 w-8 text-white" />
            </div>
          )}

          {/* Status indicator */}
          {media.status !== 'ready' && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              {media.status === 'processing' && (
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <span className="text-xs">Processing...</span>
                </div>
              )}
              {media.status === 'failed' && (
                <div className="text-white text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-xs">Failed</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Media info */}
        <div className="p-3">
          <p className="text-sm font-medium text-gray-900 truncate">
            {media.filename}
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">{formatFileSize(media.size)}</span>
            {media.imageOptimization?.qualityScore && (
              <span className={`text-xs ${
                media.imageOptimization.qualityScore >= 80 ? 'text-green-600' :
                media.imageOptimization.qualityScore >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {media.imageOptimization.qualityScore}% quality
              </span>
            )}
          </div>
          
          {/* Tags */}
          {media.metadata.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {media.metadata.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
              {media.metadata.tags.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{media.metadata.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions menu */}
        {!readOnly && (
          <div className="absolute bottom-3 right-3">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <MoreVertical className="h-4 w-4 text-gray-600" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-lg border z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView();
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit metadata
                  </button>
                  {media.type === 'image' && !media.isFeatured && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetFeatured();
                        setShowMenu(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Set as featured
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility();
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {media.isVisible ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Show
                      </>
                    )}
                  </button>
                  <div className="border-t my-1"></div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
    >
      {/* Selection checkbox */}
      {!readOnly && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="w-4 h-4 text-primary rounded focus:ring-primary"
        />
      )}

      {/* Drag handle */}
      {!readOnly && (
        <div
          className="cursor-grab"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
      )}

      {/* Thumbnail */}
      <div 
        className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 cursor-pointer"
        onClick={onView}
      >
        <img
          src={thumbnailUrl}
          alt={media.metadata.altText?.en || media.filename}
          className="w-full h-full object-cover"
        />
        {media.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <Play className="h-6 w-6 text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-gray-900 truncate">
            {media.filename}
          </p>
          {media.isFeatured && (
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
          )}
          {!media.isVisible && (
            <EyeOff className="h-4 w-4 text-gray-400 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center space-x-4 mt-1">
          <span className="text-xs text-gray-500">
            {media.type === 'image' ? (
              <>
                <ImageIcon className="h-3 w-3 inline mr-1" />
                {media.sizes?.find(s => s.name === 'original')?.width} × {' '}
                {media.sizes?.find(s => s.name === 'original')?.height}
              </>
            ) : (
              <>
                <Video className="h-3 w-3 inline mr-1" />
                {media.videoMetadata?.duration && formatDuration(media.videoMetadata.duration)}
              </>
            )}
          </span>
          <span className="text-xs text-gray-500">{formatFileSize(media.size)}</span>
          {media.metadata.tags?.length > 0 && (
            <span className="text-xs text-gray-500">
              {media.metadata.tags.length} tags
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      {!readOnly && (
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};