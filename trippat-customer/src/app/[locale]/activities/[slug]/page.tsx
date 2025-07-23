import { Metadata } from 'next'
import ActivityDetailsPage from '@/components/ActivityDetailsPage'

interface Props {
  params: { slug: string; locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // In a real app, you would parse the slug to get the activity ID and fetch the activity data
  // const activityId = extractIdFromSlug(params.slug)
  // const activity = await fetch(`/api/activities/${activityId}`)
  return {
    title: 'Activity Details - Trippat',
    description: 'Discover amazing activities and unique experiences in Saudi Arabia.',
    keywords: 'activity, experience, tour, adventure, Saudi Arabia',
  }
}

export default function ActivityDetailsSlug({ params }: Props) {
  // Handle both slug format (activity-name-in-city-abc123) and direct ID format
  let activityId: string
  
  if (params.slug.includes('-')) {
    // Slug format: extract ID from the end
    activityId = params.slug.split('-').pop() || '1'
  } else {
    // Direct ID format
    activityId = params.slug
  }
  
  return <ActivityDetailsPage activityId={activityId} />
}