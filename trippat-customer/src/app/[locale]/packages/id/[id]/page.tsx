import { redirect } from 'next/navigation'
import { generatePackageSlug } from '@/utils/slugUtils'

interface Props {
  params: Promise<{
    locale: string
    id: string
  }>
}

async function getPackage(id: string) {
  try {
    const response = await fetch(`http://localhost:5001/api/packages/${id}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success && data.data && data.data.package) {
      return data.data.package
    }
    return null
  } catch (error) {
    console.error('Error fetching package for redirect:', error)
    return null
  }
}

export default async function PackageIdRedirect({ params }: Props) {
  const { locale, id } = await params
  
  // Fetch package to get title and destination for slug generation
  const pkg = await getPackage(id)
  
  if (pkg && pkg.title && pkg.destination) {
    // Generate the new clean URL slug
    const slug = generatePackageSlug(pkg.title, pkg.destination, pkg._id)
    
    // Redirect to the new clean URL
    redirect(`/${locale}/packages/${slug}`)
  }
  
  // If package not found or missing data, redirect to packages listing
  redirect(`/${locale}/packages`)
}