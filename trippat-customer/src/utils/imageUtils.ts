export const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath || typeof imagePath !== 'string') return '/images/placeholder.jpg';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // If it's an upload path, construct the full URL
  if (imagePath.startsWith('/uploads/')) {
    return `http://localhost:5001${imagePath}`;
  }
  
  // For relative paths, assume they're in the public folder
  return imagePath;
};