'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video, 
  File, 
  Plus, 
  Trash2, 
  Link, 
  Youtube, 
  Play,
  AlertCircle,
  Check
} from 'lucide-react';

interface MediaUploaderProps {
  packageId: string;
  onUpload: (files: File[]) => void;
  onClose: () => void;
  maxFiles?: number;
  maxSizeInMB?: number;
  acceptedTypes?: string[];
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  packageId,
  onUpload,
  onClose,
  maxFiles = 20,
  maxSizeInMB = 50,
  acceptedTypes = ['image/*', 'video/*']
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [externalVideoUrl, setExternalVideoUrl] = useState('');
  const [showExternalVideo, setShowExternalVideo] = useState(false);
  const [uploadType, setUploadType] = useState<'files' | 'external'>('files');
  const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    const rejectedErrors = rejectedFiles.map(rejection => 
      `${rejection.file.name}: ${rejection.errors.map((e: any) => e.message).join(', ')}`
    );
    setErrors(rejectedErrors);

    // Process accepted files
    const validFiles = acceptedFiles.filter(file => {
      const sizeInMB = file.size / (1024 * 1024);
      return sizeInMB <= maxSizeInMB;
    });

    const oversizedFiles = acceptedFiles.filter(file => {
      const sizeInMB = file.size / (1024 * 1024);
      return sizeInMB > maxSizeInMB;
    });

    if (oversizedFiles.length > 0) {
      setErrors(prev => [...prev, ...oversizedFiles.map(file => 
        `${file.name}: File size exceeds ${maxSizeInMB}MB limit`
      )]);
    }

    const newFiles = [...selectedFiles, ...validFiles].slice(0, maxFiles);
    setSelectedFiles(newFiles);

    // Generate preview URLs
    const newPreviewUrls = { ...previewUrls };
    validFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        newPreviewUrls[file.name] = URL.createObjectURL(file);
      } else if (file.type.startsWith('video/')) {
        newPreviewUrls[file.name] = URL.createObjectURL(file);
      }
    });
    setPreviewUrls(newPreviewUrls);
  }, [selectedFiles, maxFiles, maxSizeInMB, previewUrls]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    multiple: true
  });

  const removeFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(file => file.name !== fileName));
    if (previewUrls[fileName]) {
      URL.revokeObjectURL(previewUrls[fileName]);
      const newPreviewUrls = { ...previewUrls };
      delete newPreviewUrls[fileName];
      setPreviewUrls(newPreviewUrls);
    }
  };

  const handleExternalVideoSubmit = async () => {
    if (!externalVideoUrl) return;

    try {
      const response = await fetch(`http://localhost:5001/api/media/external-video/${packageId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          url: externalVideoUrl,
          metadata: {
            altText: { en: 'External video' },
            tags: ['external', 'video']
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add external video');
      }

      setExternalVideoUrl('');
      setShowExternalVideo(false);
      onClose();
    } catch (error) {
      console.error('Error adding external video:', error);
      setErrors(['Failed to add external video']);
    }
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      setErrors(['Please select at least one file']);
      return;
    }

    onUpload(selectedFiles);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return ImageIcon;
    if (file.type.startsWith('video/')) return Video;
    return File;
  };

  const isVideoUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Upload Media</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Upload type tabs */}
        <div className="border-b">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setUploadType('files')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                uploadType === 'files'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="h-4 w-4 inline mr-2" />
              Upload Files
            </button>
            <button
              onClick={() => setUploadType('external')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                uploadType === 'external'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Link className="h-4 w-4 inline mr-2" />
              External Video
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {uploadType === 'files' ? (
            <div className="space-y-6">
              {/* Error messages */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <h3 className="text-sm font-medium text-red-800">Upload Errors</h3>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  or click to select files
                </p>
                <p className="text-xs text-gray-400">
                  Max {maxFiles} files, {maxSizeInMB}MB each. Supports images and videos.
                </p>
              </div>

              {/* Selected files */}
              {selectedFiles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Selected Files ({selectedFiles.length})
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedFiles.map((file, index) => {
                      const FileIcon = getFileIcon(file);
                      return (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          {/* Preview */}
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                            {previewUrls[file.name] ? (
                              file.type.startsWith('image/') ? (
                                <img
                                  src={previewUrls[file.name]}
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <video
                                  src={previewUrls[file.name]}
                                  className="w-full h-full object-cover"
                                  muted
                                />
                              )
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileIcon className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* File info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() => removeFile(file.name)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* External video form */}
              <div className="text-center">
                <Youtube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Add External Video
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Add videos from YouTube, Vimeo, or other platforms
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={externalVideoUrl}
                    onChange={(e) => setExternalVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* URL validation */}
                {externalVideoUrl && (
                  <div className="flex items-center space-x-2">
                    {isVideoUrl(externalVideoUrl) ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">Valid video URL</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-600">Invalid video URL</span>
                      </>
                    )}
                  </div>
                )}

                {/* Supported platforms */}
                <div className="bg-primary-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Supported Platforms
                  </h4>
                  <div className="text-sm text-primary-700 space-y-1">
                    <div>• YouTube (youtube.com, youtu.be)</div>
                    <div>• Vimeo (vimeo.com)</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          
          {uploadType === 'files' ? (
            <button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
            </button>
          ) : (
            <button
              onClick={handleExternalVideoSubmit}
              disabled={!externalVideoUrl || !isVideoUrl(externalVideoUrl)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Video
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaUploader;