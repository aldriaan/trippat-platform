import { Metadata } from 'next'
import ActivitiesPage from '@/components/ActivitiesPage'

export const metadata: Metadata = {
  title: 'Activities & Experiences - Trippat',
  description: 'Discover amazing activities and unique experiences in Saudi Arabia. From adventure tours to cultural workshops, find the perfect activity for your interests.',
  keywords: 'activities, experiences, tours, adventures, Saudi Arabia, cultural activities, outdoor activities, workshops',
}

export default function Activities() {
  return <ActivitiesPage />
}