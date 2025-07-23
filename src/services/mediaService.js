const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class MediaService {
  constructor() {
    this.imageSizes = {
      thumbnail: { width: 150, height: 150 },
      small: { width: 480, height: 320 },
      medium: { width: 800, height: 600 },
      large: { width: 1200, height: 900 },
      original: null
    };
    
    this.supportedImageFormats = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
    this.supportedVideoFormats = ['mp4', 'webm', 'mov', 'avi'];
    this.maxFileSize = 50 * 1024 * 1024; // 50MB
  }

  // Process uploaded image
  async processImage(file, options = {}) {
    const { 
      packageId, 
      userId,
      optimize = true,
      generateSizes = true,
      metadata = {}
    } = options;

    try {
      // Validate file
      const validation = await this.validateImage(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Create unique filename
      const uniqueId = uuidv4();
      const ext = path.extname(file.originalname).toLowerCase();
      const baseFilename = `${packageId}_${uniqueId}`;

      // Process image with sharp
      const imageBuffer = file.buffer;
      const sharpInstance = sharp(imageBuffer);
      const imageMetadata = await sharpInstance.metadata();

      // Calculate quality score
      const qualityScore = await this.calculateImageQuality(imageBuffer, imageMetadata);
      const suggestions = this.getOptimizationSuggestions(imageMetadata, qualityScore);

      // Generate different sizes
      const sizes = [];
      if (generateSizes) {
        for (const [sizeName, dimensions] of Object.entries(this.imageSizes)) {
          if (sizeName === 'original') {
            sizes.push({
              name: 'original',
              width: imageMetadata.width,
              height: imageMetadata.height,
              url: `/uploads/media/${baseFilename}${ext}`,
              size: file.size,
              format: imageMetadata.format
            });
          } else {
            const resized = await this.resizeImage(
              sharpInstance.clone(),
              dimensions,
              optimize
            );
            
            const sizeFilename = `${baseFilename}_${sizeName}${ext}`;
            const sizePath = path.join('uploads/media', sizeFilename);
            
            await fs.mkdir(path.dirname(sizePath), { recursive: true });
            await fs.writeFile(sizePath, resized.buffer);
            
            sizes.push({
              name: sizeName,
              width: resized.info.width,
              height: resized.info.height,
              url: `/uploads/media/${sizeFilename}`,
              size: resized.info.size,
              format: resized.info.format
            });
          }
        }
      }

      // Save original
      const originalPath = path.join('uploads/media', `${baseFilename}${ext}`);
      await fs.writeFile(originalPath, imageBuffer);

      return {
        filename: file.originalname,
        originalUrl: `/uploads/media/${baseFilename}${ext}`,
        mimeType: file.mimetype,
        size: file.size,
        sizes,
        imageOptimization: {
          qualityScore,
          suggestions,
          metadata: {
            format: imageMetadata.format,
            colorSpace: imageMetadata.space,
            hasTransparency: imageMetadata.channels === 4,
            isProgressive: imageMetadata.isProgressive || false,
            density: imageMetadata.density
          }
        },
        metadata,
        status: 'ready'
      };
    } catch (error) {
      console.error('Image processing error:', error);
      throw error;
    }
  }

  // Resize image with optimization
  async resizeImage(sharpInstance, dimensions, optimize = true) {
    let processed = sharpInstance
      .resize(dimensions.width, dimensions.height, {
        fit: 'cover',
        position: 'center',
        withoutEnlargement: true
      });

    if (optimize) {
      processed = processed
        .jpeg({ quality: 85, progressive: true })
        .png({ compressionLevel: 9 })
        .webp({ quality: 85 });
    }

    const buffer = await processed.toBuffer();
    const info = await sharp(buffer).metadata();

    return { buffer, info };
  }

  // Calculate image quality score
  async calculateImageQuality(buffer, metadata) {
    let score = 100;

    // Check file size
    const sizeInMB = buffer.length / (1024 * 1024);
    if (sizeInMB > 5) score -= 20;
    else if (sizeInMB > 2) score -= 10;

    // Check dimensions
    if (metadata.width < 800 || metadata.height < 600) score -= 15;
    else if (metadata.width > 4000 || metadata.height > 4000) score -= 10;

    // Check format
    if (!['jpeg', 'png', 'webp'].includes(metadata.format)) score -= 10;

    // Check color space
    if (metadata.space !== 'srgb') score -= 5;

    // Check if progressive
    if (!metadata.isProgressive && metadata.format === 'jpeg') score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  // Get optimization suggestions
  getOptimizationSuggestions(metadata, qualityScore) {
    const suggestions = [];

    if (qualityScore < 80) {
      if (metadata.width > 4000 || metadata.height > 4000) {
        suggestions.push({
          type: 'dimension',
          severity: 'medium',
          message: 'Image dimensions are very large. Consider resizing to max 4000px for better performance.'
        });
      }

      if (metadata.format === 'png' && metadata.channels === 3) {
        suggestions.push({
          type: 'format',
          severity: 'low',
          message: 'Consider using JPEG format for photos without transparency.'
        });
      }

      if (!metadata.isProgressive && metadata.format === 'jpeg') {
        suggestions.push({
          type: 'optimization',
          severity: 'low',
          message: 'Enable progressive JPEG for better loading experience.'
        });
      }
    }

    return suggestions;
  }

  // Process video upload
  async processVideo(file, options = {}) {
    const { packageId, userId, metadata = {} } = options;

    try {
      // Validate video
      const validation = await this.validateVideo(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Create unique filename
      const uniqueId = uuidv4();
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `${packageId}_${uniqueId}${ext}`;
      const videoPath = path.join('uploads/media/videos', filename);

      // Save video
      await fs.mkdir(path.dirname(videoPath), { recursive: true });
      await fs.writeFile(videoPath, file.buffer);

      // Extract video metadata (requires ffmpeg)
      const videoMetadata = await this.extractVideoMetadata(videoPath);

      // Generate thumbnail
      const thumbnail = await this.generateVideoThumbnail(videoPath, {
        timestamp: videoMetadata.duration / 2
      });

      return {
        filename: file.originalname,
        originalUrl: `/uploads/media/videos/${filename}`,
        mimeType: file.mimetype,
        size: file.size,
        videoMetadata: {
          duration: videoMetadata.duration,
          resolution: videoMetadata.resolution,
          format: videoMetadata.format,
          codec: videoMetadata.codec,
          bitrate: videoMetadata.bitrate,
          frameRate: videoMetadata.frameRate,
          thumbnail: {
            url: thumbnail.url,
            customThumbnail: false,
            timestamp: videoMetadata.duration / 2
          }
        },
        metadata,
        status: 'ready'
      };
    } catch (error) {
      console.error('Video processing error:', error);
      throw error;
    }
  }

  // Handle external video (YouTube/Vimeo)
  async processExternalVideo(url, options = {}) {
    const { packageId, userId, metadata = {} } = options;

    try {
      // Detect provider and extract video ID
      const { provider, videoId } = this.parseVideoUrl(url);
      
      if (!provider || !videoId) {
        throw new Error('Invalid video URL');
      }

      // Fetch video metadata from provider
      const videoData = await this.fetchExternalVideoData(provider, videoId);

      return {
        type: 'video',
        provider,
        videoId,
        filename: videoData.title,
        originalUrl: url,
        embedUrl: this.getEmbedUrl(provider, videoId),
        videoMetadata: {
          duration: videoData.duration,
          resolution: videoData.resolution,
          thumbnail: {
            url: videoData.thumbnail,
            customThumbnail: false
          }
        },
        metadata: {
          ...metadata,
          altText: { en: videoData.title, ar: videoData.title },
          caption: { en: videoData.description, ar: videoData.description }
        },
        status: 'ready'
      };
    } catch (error) {
      console.error('External video processing error:', error);
      throw error;
    }
  }

  // Parse video URL to extract provider and ID
  parseVideoUrl(url) {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      return { provider: 'youtube', videoId: youtubeMatch[1] };
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return { provider: 'vimeo', videoId: vimeoMatch[1] };
    }

    return { provider: null, videoId: null };
  }

  // Get embed URL for external videos
  getEmbedUrl(provider, videoId) {
    switch (provider) {
      case 'youtube':
        return `https://www.youtube.com/embed/${videoId}`;
      case 'vimeo':
        return `https://player.vimeo.com/video/${videoId}`;
      default:
        return null;
    }
  }

  // Fetch external video data (mock implementation)
  async fetchExternalVideoData(provider, videoId) {
    // In a real implementation, this would call YouTube/Vimeo APIs
    return {
      title: 'External Video Title',
      description: 'Video description',
      duration: 300,
      resolution: { width: 1920, height: 1080 },
      thumbnail: provider === 'youtube' 
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        : `https://vumbnail.com/${videoId}.jpg`
    };
  }

  // Validate image file
  async validateImage(file) {
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    
    if (!this.supportedImageFormats.includes(ext)) {
      return { isValid: false, error: 'Unsupported image format' };
    }

    if (file.size > this.maxFileSize) {
      return { isValid: false, error: 'File size exceeds limit (50MB)' };
    }

    try {
      const metadata = await sharp(file.buffer).metadata();
      if (!metadata.width || !metadata.height) {
        return { isValid: false, error: 'Invalid image file' };
      }
    } catch (error) {
      return { isValid: false, error: 'Invalid image file' };
    }

    return { isValid: true };
  }

  // Validate video file
  async validateVideo(file) {
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    
    if (!this.supportedVideoFormats.includes(ext)) {
      return { isValid: false, error: 'Unsupported video format' };
    }

    if (file.size > this.maxFileSize * 2) { // 100MB for videos
      return { isValid: false, error: 'File size exceeds limit (100MB)' };
    }

    return { isValid: true };
  }

  // Extract video metadata (mock implementation - requires ffmpeg)
  async extractVideoMetadata(videoPath) {
    // In a real implementation, this would use ffmpeg
    return {
      duration: 120,
      resolution: { width: 1920, height: 1080 },
      format: 'mp4',
      codec: 'h264',
      bitrate: 5000,
      frameRate: 30
    };
  }

  // Generate video thumbnail (mock implementation - requires ffmpeg)
  async generateVideoThumbnail(videoPath, options = {}) {
    const { timestamp = 0 } = options;
    
    // In a real implementation, this would use ffmpeg to extract a frame
    const thumbnailPath = videoPath.replace(/\.[^.]+$/, '_thumb.jpg');
    
    return {
      url: thumbnailPath.replace('uploads/', '/uploads/'),
      path: thumbnailPath
    };
  }

  // Upload to cloud storage (AWS S3)
  async uploadToS3(file, key) {
    // Implementation would use AWS SDK
    // const s3 = new AWS.S3();
    // return s3.upload({ Bucket: 'bucket', Key: key, Body: file }).promise();
    
    return {
      url: `https://s3.amazonaws.com/bucket/${key}`,
      key
    };
  }

  // Upload to Cloudinary
  async uploadToCloudinary(file, options = {}) {
    // Implementation would use Cloudinary SDK
    // const cloudinary = require('cloudinary').v2;
    // return cloudinary.uploader.upload(file, options);
    
    return {
      url: `https://res.cloudinary.com/demo/image/upload/${options.public_id}`,
      public_id: options.public_id
    };
  }
}

module.exports = new MediaService();