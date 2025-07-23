import { Metadata } from 'next'
import PackagesPage from '@/components/PackagesPage'

export const metadata: Metadata = {
  title: 'Travel Packages - Trippat',
  description: 'Browse our complete collection of travel packages. Find the perfect trip for your next adventure with flexible filters and detailed information.',
  keywords: 'travel packages, vacation packages, trip booking, destinations, travel deals',
}

export default function Packages() {
  return <PackagesPage />
}