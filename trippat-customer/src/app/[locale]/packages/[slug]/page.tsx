import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PackageDetailsPage from '@/components/PackageDetailsPage'
import { getPackageIdFromSlug, getSlugParts } from '@/utils/slugUtils'

interface Props {
  params: Promise<{
    locale: string
    slug: string
  }>
}

async function getPackage(slug: string) {
  try {
    // First try to get the package ID from the slug
    const packageId = await getPackageIdFromSlug(slug);
    
    if (!packageId) {
      console.log('Could not extract package ID from slug:', slug);
      return null;
    }
    
    const response = await fetch(`http://localhost:5001/api/packages/${packageId}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success && data.data && data.data.package) {
      // Ensure compatibility between different price field names
      const packageData = data.data.package
      if (!packageData.priceAdult && packageData.price) {
        packageData.priceAdult = packageData.price
      }
      if (!packageData.price && packageData.priceAdult) {
        packageData.price = packageData.priceAdult
      }
      return packageData
    }
    return null
  } catch (error) {
    console.error('Error fetching package:', error)
    
    // Fallback mock data when API is not available
    const slugParts = getSlugParts(slug);
    const mockPackage = {
      _id: slugParts?.id || 'mock-id',
      title: slugParts?.title || 'Dubai Desert Safari Adventure',
      title_ar: 'مغامرة سفاري الصحراء في دبي',
      destination: slugParts?.destination || 'Dubai, UAE',
      destination_ar: 'دبي، الإمارات العربية المتحدة',
      description: 'Experience the magical Arabian desert with camel rides, traditional meals, and cultural performances.',
      description_ar: 'اختبر سحر الصحراء العربية مع ركوب الجمال والوجبات التقليدية والعروض الثقافية.',
      price: 1125,
      priceAdult: 1125,
      duration: 1,
      images: ['/images/placeholder.jpg', '/images/placeholder2.jpg'],
      rating: 4.8,
      reviewCount: 1250,
      category: ['adventure'],
      availability: true,
      featured: true,
      highlights: ['Desert safari experience', 'Camel riding', 'Traditional BBQ dinner', 'Cultural performances'],
      highlights_ar: ['تجربة سفاري الصحراء', 'ركوب الجمال', 'عشاء شواء تقليدي', 'عروض ثقافية'],
      inclusions: ['Transportation', 'Meals', 'Activities', 'Guide'],
      inclusions_ar: ['النقل', 'الوجبات', 'الأنشطة', 'المرشد'],
      exclusions: ['Personal expenses', 'Additional activities'],
      exclusions_ar: ['المصروفات الشخصية', 'الأنشطة الإضافية'],
      itinerary: [
        {
          day: 1,
          title: 'Desert Safari Adventure',
          title_ar: 'مغامرة سفاري الصحراء',
          description: 'Full day desert safari with various activities',
          description_ar: 'سفاري صحراوي ليوم كامل مع أنشطة متنوعة',
          activities: ['Pickup from hotel', 'Desert driving', 'Camel riding', 'BBQ dinner'],
          activities_ar: ['استقبال من الفندق', 'قيادة في الصحراء', 'ركوب الجمال', 'عشاء شواء']
        }
      ],
      tourOwner: {
        _id: 'owner1',
        name: 'Desert Adventures LLC',
        email: 'info@desertadventures.com'
      }
    }
    
    return mockPackage
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  const pkg = await getPackage(slug)
  
  if (!pkg) {
    return {
      title: 'Package Not Found - Trippat',
      description: 'The requested package could not be found.'
    }
  }
  
  const title = locale === 'ar' && pkg.title_ar ? pkg.title_ar : pkg.title;
  const description = locale === 'ar' && pkg.description_ar ? pkg.description_ar : pkg.description;
  const destination = locale === 'ar' && pkg.destination_ar ? pkg.destination_ar : pkg.destination;
  
  return {
    title: `${title} - ${destination} | Trippat`,
    description: description,
    keywords: `${destination}, ${pkg.category}, travel package, ${title}, Trippat`,
    openGraph: {
      title: title,
      description: description,
      images: pkg.images || [],
      url: `/${locale}/packages/${slug}`,
      type: 'website',
      siteName: 'Trippat'
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: pkg.images || []
    },
    alternates: {
      canonical: `/${locale}/packages/${slug}`,
      languages: {
        'en': `/en/packages/${slug}`,
        'ar': `/ar/packages/${slug}`
      }
    }
  }
}

export default async function PackageDetailsSlug({ params }: Props) {
  const { slug } = await params
  const pkg = await getPackage(slug)
  
  if (!pkg) {
    notFound()
  }
  
  return <PackageDetailsPage packageData={pkg} />
}