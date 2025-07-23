import { Activity } from '@/types/activity'

// Create SEO-friendly slug from activity data
export function createActivitySlug(activity: Activity, locale: 'en' | 'ar' = 'en') {
  const title = locale === 'ar' ? activity.title_ar || activity.title : activity.title
  const city = locale === 'ar' ? activity.city_ar || activity.city : activity.city
  
  // Create base slug from title and city
  const baseSlug = `${title}-in-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
  
  // Append activity ID for uniqueness
  return `${baseSlug}-${activity._id}`
}

// Create activity URL for navigation
export function createActivityUrl(activity: Activity, locale: 'en' | 'ar' = 'en') {
  const slug = createActivitySlug(activity, locale)
  return `/${locale}/activities/${slug}`
}

// Extract activity ID from slug
export function extractActivityIdFromSlug(slug: string): string {
  // Get the last part after the last hyphen
  const parts = slug.split('-')
  return parts[parts.length - 1] || '1'
}

// Parse activity slug to get title and location info
export function parseActivitySlug(slug: string) {
  const parts = slug.split('-')
  const id = parts.pop() // Remove ID from the end
  
  // Find "in" keyword to separate title from location
  const inIndex = parts.findIndex(part => part === 'in')
  
  if (inIndex > -1) {
    const titleParts = parts.slice(0, inIndex)
    const locationParts = parts.slice(inIndex + 1)
    
    return {
      id,
      title: titleParts.join(' '),
      location: locationParts.join(' ')
    }
  }
  
  return {
    id,
    title: parts.join(' '),
    location: ''
  }
}

// Validate activity slug format
export function isValidActivitySlug(slug: string): boolean {
  // Should contain only lowercase letters, numbers, and hyphens
  // Should end with an ID (letters/numbers)
  const slugPattern = /^[a-z0-9-]+-[a-z0-9]+$/
  return slugPattern.test(slug) && slug.length > 5
}

// Create activity share URL
export function createActivityShareUrl(activity: Activity, locale: 'en' | 'ar' = 'en') {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://trippat.com'
  const activityUrl = createActivityUrl(activity, locale)
  return `${baseUrl}${activityUrl}`
}

// Generate activity meta description
export function generateActivityMetaDescription(activity: Activity, locale: 'en' | 'ar' = 'en') {
  const title = locale === 'ar' ? activity.title_ar || activity.title : activity.title
  const city = locale === 'ar' ? activity.city_ar || activity.city : activity.city
  const description = locale === 'ar' ? activity.description_ar || activity.description : activity.description
  
  // Create truncated description
  const truncatedDescription = description.length > 120 
    ? description.substring(0, 120) + '...'
    : description
  
  return `${title} in ${city}. ${truncatedDescription} Duration: ${activity.duration} hours. From ${activity.priceAdult} ${activity.currency}.`
}

// Activity URL patterns for routing
export const ACTIVITY_URL_PATTERNS = {
  LIST: '/activities',
  DETAILS_BY_ID: '/activities/[id]',
  DETAILS_BY_SLUG: '/activities/[slug]',
  BOOKING: '/activities/[slug]/book',
  CATEGORY: '/activities/category/[category]',
  CITY: '/activities/city/[city]'
}

// Activity status helpers
export function getActivityStatusColor(status: string) {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800'
    case 'limited':
      return 'bg-yellow-100 text-yellow-800'
    case 'sold_out':
      return 'bg-red-100 text-red-800'
    case 'closed':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getActivityStatusText(status: string, locale: 'en' | 'ar' = 'en') {
  const statusTexts = {
    en: {
      available: 'Available',
      limited: 'Limited Availability',
      sold_out: 'Sold Out',
      closed: 'Closed'
    },
    ar: {
      available: 'متاح',
      limited: 'محدود التوفر',
      sold_out: 'نفد',
      closed: 'مغلق'
    }
  }
  
  return statusTexts[locale][status as keyof typeof statusTexts.en] || status
}