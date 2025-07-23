'use client';

import React, { useState, useEffect } from 'react';
import { Media } from '@/types/media';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Star, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Minimize2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Info,
  Tag,
  Calendar,
  User,
  FileText
} from 'lucide-react';

interface MediaViewerProps {
  media: Media;
  allMedia: Media[];
  onClose: () => void;
  onNext: (nextMedia: Media) => void;
  onPrevious: (prevMedia: Media) => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({
  media,
  allMedia,
  onClose,
  onNext,
  onPrevious
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const currentIndex = allMedia.findIndex(m => m._id === media._id);
  const hasNext = currentIndex < allMedia.length - 1;
  const hasPrevious = currentIndex > 0;

  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (hasPrevious) onPrevious(allMedia[currentIndex - 1]);
          break;
        case 'ArrowRight':
          if (hasNext) onNext(allMedia[currentIndex + 1]);
          break;
        case ' ':
          e.preventDefault();
          if (media.type === 'video') {
            togglePlayPause();
          }
          break;
        case 'f':
          setIsFullscreen(!isFullscreen);
          break;
        case 'i':
          setShowInfo(!showInfo);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [media, currentIndex, hasNext, hasPrevious, isFullscreen, showInfo]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(media.originalUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = media.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

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

  const getImageUrl = () => {
    if (media.type === 'image') {
      return media.sizes?.find(s => s.name === 'large')?.url || media.originalUrl;
    }
    return media.videoMetadata?.thumbnail?.url || '';
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 ${
      isFullscreen ? 'bg-black' : ''
    }`}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-white font-medium truncate max-w-md">
              {media.filename}
            </h2>
            <span className="text-white text-sm opacity-75">
              {currentIndex + 1} of {allMedia.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
            >
              <Info className="h-5 w-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {hasPrevious && (
        <button
          onClick={() => onPrevious(allMedia[currentIndex - 1])}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      
      {hasNext && (
        <button
          onClick={() => onNext(allMedia[currentIndex + 1])}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Media Content */}
      <div className="flex-1 flex items-center justify-center p-16">
        {media.type === 'image' ? (
          <div className="relative">
            <img
              src={getImageUrl()}
              alt={media.metadata.altText?.en || media.filename}
              className="max-w-full max-h-full object-contain cursor-grab select-none"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                cursor: isDragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              draggable={false}
            />
            
            {/* Image controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black bg-opacity-50 rounded-full px-4 py-2">
              <button
                onClick={handleZoomOut}
                className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-white text-sm">{Math.round(zoom * 100)}%</span>
              <button
                onClick={handleZoomIn}
                className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={resetZoom}
                className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            {media.provider === 'youtube' || media.provider === 'vimeo' ? (
              <iframe
                src={media.embedUrl}
                width="800"
                height="450"
                frameBorder="0"
                allowFullScreen
                className="max-w-full max-h-full"
              />
            ) : (
              <video
                ref={videoRef}
                src={media.originalUrl}
                className="max-w-full max-h-full"
                controls={false}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onVolumeChange={(e) => {
                  const video = e.target as HTMLVideoElement;
                  setVolume(video.volume);
                  setIsMuted(video.muted);
                }}
              />
            )}
            
            {/* Video controls */}
            {media.provider === 'local' && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black bg-opacity-50 rounded-full px-4 py-2">
                <button
                  onClick={togglePlayPause}
                  className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button
                  onClick={toggleMute}
                  className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="absolute top-0 right-0 h-full w-80 bg-black bg-opacity-90 p-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-medium mb-2">Media Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white">{media.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Size:</span>
                  <span className="text-white">{formatFileSize(media.size)}</span>
                </div>
                {media.type === 'image' && media.sizes && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dimensions:</span>
                    <span className="text-white">
                      {media.sizes.find(s => s.name === 'original')?.width} × {' '}
                      {media.sizes.find(s => s.name === 'original')?.height}
                    </span>
                  </div>
                )}
                {media.type === 'video' && media.videoMetadata && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white">{formatDuration(media.videoMetadata.duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Resolution:</span>
                      <span className="text-white">
                        {media.videoMetadata.resolution.width} × {media.videoMetadata.resolution.height}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Provider:</span>
                  <span className="text-white capitalize">{media.provider}</span>
                </div>
              </div>
            </div>

            {/* Quality Score */}
            {media.imageOptimization?.qualityScore && (
              <div>
                <h3 className="text-white font-medium mb-2">Quality Score</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        media.imageOptimization.qualityScore >= 80 ? 'bg-green-500' :
                        media.imageOptimization.qualityScore >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${media.imageOptimization.qualityScore}%` }}
                    />
                  </div>
                  <span className="text-white text-sm">{media.imageOptimization.qualityScore}%</span>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div>
              <h3 className="text-white font-medium mb-2">Metadata</h3>
              <div className="space-y-2 text-sm">
                {media.metadata.altText?.en && (
                  <div>
                    <span className="text-gray-400 block">Alt Text:</span>
                    <span className="text-white">{media.metadata.altText.en}</span>
                  </div>
                )}
                {media.metadata.caption?.en && (
                  <div>
                    <span className="text-gray-400 block">Caption:</span>
                    <span className="text-white">{media.metadata.caption.en}</span>
                  </div>
                )}
                {media.metadata.credit && (
                  <div>
                    <span className="text-gray-400 block">Credit:</span>
                    <span className="text-white">{media.metadata.credit}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {media.metadata.tags?.length > 0 && (
              <div>
                <h3 className="text-white font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {media.metadata.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-600 text-white text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Info */}
            <div>
              <h3 className="text-white font-medium mb-2">Upload Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-white">{media.uploadedBy.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-white">
                    {new Date(media.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaViewer;