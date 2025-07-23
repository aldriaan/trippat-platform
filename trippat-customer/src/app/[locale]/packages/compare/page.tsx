import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PackageComparisonPage from '@/components/PackageComparisonPage'

export const metadata: Metadata = {
  title: 'Compare Packages - Trippat',
  description: 'Compare travel packages side by side to find the perfect trip for your needs.',
}

interface Props {
  searchParams: Promise<{
    packages?: string
  }>
}

async function getPackages(packageIds: string[]) {
  try {
    const packages = await Promise.all(
      packageIds.map(async (id) => {
        const response = await fetch(`http://localhost:5001/api/packages/${id}`, {
          cache: 'no-store'
        })
        
        if (!response.ok) return null
        
        const data = await response.json()
        return data.success ? data.data : null
      })
    )
    
    return packages.filter(Boolean)
  } catch (error) {
    console.error('Error fetching packages:', error)
    return []
  }
}

export default async function ComparePackages({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams
  const packageIds = resolvedSearchParams.packages?.split(',') || []
  
  if (packageIds.length === 0) {
    notFound()
  }
  
  const packages = await getPackages(packageIds)
  
  if (packages.length === 0) {
    notFound()
  }
  
  return <PackageComparisonPage packages={packages} />
}