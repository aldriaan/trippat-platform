export interface MediaSize {
  name: 'thumbnail' | 'small' | 'medium' | 'large' | 'original';
  width: number;
  height: number;
  url: string;
  size: number;
  format: string;
}

export interface MediaMetadata {
  altText: {
    en?: string;
    ar?: string;
  };
  caption: {
    en?: string;
    ar?: string;
  };
  tags: string[];
  credit?: string;
  copyright?: string;
  location?: {
    name: string;
    coordinates: [number, number];
  };
}

export interface ImageOptimization {
  qualityScore: number;
  suggestions: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
  }[];
  metadata: {
    format: string;
    colorSpace: string;
    hasTransparency: boolean;
    isProgressive: boolean;
    density?: number;
  };
}

export interface VideoMetadata {
  duration: number;
  resolution: {
    width: number;
    height: number;
  };
  format: string;
  codec: string;
  bitrate: number;
  frameRate: number;
  thumbnail: {
    url: string;
    customThumbnail: boolean;
    timestamp?: number;
  };
}

export interface Media {
  _id: string;
  package: string;
  type: 'image' | 'video';
  provider: 'local' | 's3' | 'cloudinary' | 'youtube' | 'vimeo';
  filename: string;
  originalUrl: string;
  mimeType: string;
  size: number;
  
  // Image specific
  sizes?: MediaSize[];
  imageOptimization?: ImageOptimization;
  
  // Video specific
  videoMetadata?: VideoMetadata;
  videoId?: string;
  embedUrl?: string;
  
  // Common
  metadata: MediaMetadata;
  order: number;
  isFeatured: boolean;
  isVisible: boolean;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  processingError?: string;
  
  cloudStorage?: {
    provider: string;
    publicId: string;
    version: string;
    signature: string;
    resourceType: string;
    folder: string;
  };
  
  usage: {
    views: number;
    lastViewed?: Date;
    usedIn: {
      type: 'featured' | 'gallery' | 'content' | 'thumbnail';
      location: string;
      addedAt: Date;
    }[];
  };
  
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MediaUploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  media?: Media;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio?: number;
}