/**
 * Utility functions for generating and handling URL slugs
 */

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars except hyphens
    .replace(/\-\-+/g, '-')         // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')             // Trim hyphens from start
    .replace(/-+$/, '');            // Trim hyphens from end
}

export function generatePackageSlug(title: string, destination: string, id: string): string {
  const titleSlug = generateSlug(title);
  const destSlug = generateSlug(destination);
  
  // Create a short ID from the full ID (last 8 characters)
  const shortId = id.slice(-8);
  
  // Combine title, destination, and short ID for uniqueness
  return `${titleSlug}-in-${destSlug}-${shortId}`;
}

export function extractIdFromSlug(slug: string): string | null {
  // Extract the last part after the final hyphen (should be the short ID)
  const parts = slug.split('-');
  const shortId = parts[parts.length - 1];
  
  // Validate that it looks like a short ID (8 characters, alphanumeric)
  if (shortId && shortId.length === 8 && /^[a-zA-Z0-9]+$/.test(shortId)) {
    return shortId;
  }
  
  return null;
}

export function createPackageUrl(pkg: any, locale: string = 'en'): string {
  const slug = generatePackageSlug(pkg.title, pkg.destination, pkg._id);
  return `/${locale}/packages/${slug}`;
}

export function createPackagesListUrl(locale: string = 'en', searchParams?: URLSearchParams): string {
  const baseUrl = `/${locale}/packages`;
  if (searchParams && searchParams.toString()) {
    return `${baseUrl}?${searchParams.toString()}`;
  }
  return baseUrl;
}

export function createPackageCompareUrl(packageIds: string[], locale: string = 'en'): string {
  return `/${locale}/packages/compare?packages=${packageIds.join(',')}`;
}

// Utility to get package ID from various slug formats
export async function getPackageIdFromSlug(slug: string): Promise<string | null> {
  // First try to extract short ID from slug
  const shortId = extractIdFromSlug(slug);
  
  if (shortId) {
    try {
      // Search for package by the short ID pattern
      const response = await fetch(`http://localhost:5001/api/packages`);
      const data = await response.json();
      
      if (data.success && data.data.packages && data.data.packages.length > 0) {
        // Find package with matching short ID
        const matchingPackage = data.data.packages.find((pkg: any) => 
          pkg._id.endsWith(shortId)
        );
        
        if (matchingPackage) {
          return matchingPackage._id;
        }
      }
    } catch (error) {
      console.error('Error fetching package by slug:', error);
    }
  }
  
  // Fallback: if slug looks like a full MongoDB ID, return it directly
  if (slug.length === 24 && /^[a-f\d]{24}$/i.test(slug)) {
    return slug;
  }
  
  return null;
}

// Server-side package lookup with better error handling
export async function getPackageFromSlug(slug: string): Promise<any | null> {
  const packageId = await getPackageIdFromSlug(slug);
  
  if (!packageId) {
    return null;
  }
  
  try {
    const response = await fetch(`http://localhost:5001/api/packages/${packageId}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data.success && data.data && data.data.package) {
      return data.data.package;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching package from slug:', error);
    return null;
  }
}

// Generate breadcrumb-friendly slug parts
export function getSlugParts(slug: string): { title: string; destination: string; id: string } | null {
  const shortId = extractIdFromSlug(slug);
  if (!shortId) return null;
  
  const parts = slug.split('-');
  const idIndex = parts.length - 1;
  
  // Find "in" separator
  const inIndex = parts.findIndex(part => part === 'in');
  
  if (inIndex === -1) return null;
  
  const titleParts = parts.slice(0, inIndex);
  const destParts = parts.slice(inIndex + 1, idIndex);
  
  return {
    title: titleParts.join(' ').replace(/-/g, ' '),
    destination: destParts.join(' ').replace(/-/g, ' '),
    id: shortId
  };
}