'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { 
  MessageCircle, 
  MapPin, 
  Star, 
  Calendar,
  Users,
  Shield,
  Globe,
  Zap,
  Heart,
  ArrowRight,
  Play
} from 'lucide-react'
import { type Locale } from '@/i18n/request'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { createPackageUrl } from '@/utils/slugUtils'
import { getImageUrl } from '@/utils/imageUtils'
import PriceDisplay from '@/components/PriceDisplay'
import DiscountPriceDisplay from '@/components/DiscountPriceDisplay'
import { Package } from '@/types/package'

// Fallback mock data for featured packages (used when API is unavailable)
const mockFeaturedPackages = [
  {
    id: '1',
    title: {
      en: 'Dubai Desert Safari Adventure',
      ar: 'مغامرة سفاري الصحراء في دبي'
    },
    destination: {
      en: 'Dubai, UAE',
      ar: 'دبي، الإمارات العربية المتحدة'
    },
    description: {
      en: 'Experience the magical Arabian desert with camel rides, traditional meals, and cultural performances.',
      ar: 'اختبر سحر الصحراء العربية مع ركوب الجمال والوجبات التقليدية والعروض الثقافية.'
    },
    price: 1125,
    originalPrice: 1500,
    duration: '1 day',
    image: '/images/dubai-desert.jpg',
    rating: 4.8,
    reviews: 1250,
    features: {
      en: ['Halal meals included', 'Prayer time considerations', 'Family-friendly'],
      ar: ['وجبات حلال متضمنة', 'مراعاة أوقات الصلاة', 'مناسب للعائلات']
    },
    culturalContext: {
      isHalal: true,
      hasPrayerTimes: true,
      isFamilyFriendly: true,
      hasIslamicHeritage: false
    }
  },
  {
    id: '2',
    title: {
      en: 'Istanbul Historical Journey',
      ar: 'رحلة تاريخية في اسطنبول'
    },
    destination: {
      en: 'Istanbul, Turkey',
      ar: 'اسطنبول، تركيا'
    },
    description: {
      en: 'Explore the rich Islamic heritage of Istanbul with visits to historic mosques and Ottoman palaces.',
      ar: 'استكشف التراث الإسلامي الغني في اسطنبول مع زيارة المساجد التاريخية والقصور العثمانية.'
    },
    price: 3375,
    originalPrice: 4125,
    duration: '5 days',
    image: '/images/istanbul.jpg',
    rating: 4.9,
    reviews: 890,
    features: {
      en: ['Islamic heritage sites', 'Halal restaurants', 'Guided tours'],
      ar: ['مواقع التراث الإسلامي', 'مطاعم حلال', 'جولات مرشدة']
    },
    culturalContext: {
      isHalal: true,
      hasPrayerTimes: true,
      isFamilyFriendly: true,
      hasIslamicHeritage: true
    }
  },
  {
    id: '3',
    title: {
      en: 'Maldives Paradise Escape',
      ar: 'هروب جنة المالديف'
    },
    destination: {
      en: 'Maldives',
      ar: 'المالديف'
    },
    description: {
      en: 'Relax in luxurious overwater villas with pristine beaches and world-class diving.',
      ar: 'استرخ في فيلات فاخرة فوق المياه مع شواطئ نقية وغوص على مستوى عالمي.'
    },
    price: 7125,
    originalPrice: 8625,
    duration: '7 days',
    image: '/images/maldives.jpg',
    rating: 4.7,
    reviews: 654,
    features: {
      en: ['Luxury accommodation', 'Halal dining options', 'Private beaches'],
      ar: ['إقامة فاخرة', 'خيارات طعام حلال', 'شواطئ خاصة']
    },
    culturalContext: {
      isHalal: true,
      hasPrayerTimes: false,
      isFamilyFriendly: true,
      hasIslamicHeritage: false
    }
  }
]

const HomePage = () => {
  const t = useTranslations()
  const locale = useLocale() as Locale
  const [featuredPackages, setFeaturedPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  
  // Debug: Log the current locale
  console.log('Current locale:', locale)
  console.log('Hero title:', t('hero.title'))

  const isRTL = locale === 'ar'

  // Fetch featured packages from API
  useEffect(() => {
    const fetchFeaturedPackages = async () => {
      try {
        setLoading(true)
        
        // Fetch featured packages from the API
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
        const response = await fetch(`${apiUrl}/packages?featured=true&limit=3&availability=true&tourStatus=published&bookingStatus=active`)
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.success && data.data.packages) {
            setFeaturedPackages(data.data.packages)
          } else {
            throw new Error('Invalid API response format')
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      } catch (error) {
        console.warn('Failed to fetch featured packages from API, using fallback data:', error)
        
        // Convert mock data to match Package interface
        const fallbackPackages: Package[] = mockFeaturedPackages.map(pkg => ({
          _id: pkg.id,
          title: pkg.title.en,
          title_ar: pkg.title.ar,
          destination: pkg.destination.en,
          destination_ar: pkg.destination.ar,
          description: pkg.description.en,
          description_ar: pkg.description.ar,
          priceAdult: pkg.price,
          price: pkg.price,
          duration: parseInt(pkg.duration.split(' ')[0]),
          images: [{
            _id: `mock-${pkg.id}-img`,
            path: pkg.image,
            title: '',
            title_ar: '',
            altText: '',
            altText_ar: '',
            description: '',
            description_ar: '',
            order: 0,
            isFeatured: true,
            uploadedAt: new Date().toISOString()
          }],
          rating: pkg.rating,
          reviewCount: pkg.reviews,
          category: ['featured'],
          isFeatured: true,
          availability: true,
          featured: true,
          currency: 'SAR'
        }))
        
        setFeaturedPackages(fallbackPackages)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedPackages()
  }, [])

  const getCulturalBadges = (culturalContext: any) => {
    const badges = []
    
    if (culturalContext.isHalal) {
      badges.push(
        <span key="halal" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#4391a3] bg-opacity-20 text-[#113c5a]">
          🥘 {t('home.badges.halal')}
        </span>
      )
    }
    
    if (culturalContext.hasPrayerTimes) {
      badges.push(
        <span key="prayer" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#a1cee8] text-[#113c5a]">
          🕌 {t('home.badges.prayerTimes')}
        </span>
      )
    }
    
    if (culturalContext.isFamilyFriendly) {
      badges.push(
        <span key="family" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#a1cee8] bg-opacity-20 text-[#113c5a]">
          👨‍👩‍👧‍👦 {t('home.badges.familyFriendly')}
        </span>
      )
    }
    
    if (culturalContext.hasIslamicHeritage) {
      badges.push(
        <span key="heritage" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#f0ee8a] bg-opacity-20 text-[#113c5a]">
          🏛️ {t('home.badges.islamicHeritage')}
        </span>
      )
    }
    
    return badges
  }

  return (
    <Layout>

      {/* Hero Section */}
      <section className="relative trippat-gradient text-white">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
              <Link
                href="/packages"
                className="bg-white text-[#113c5a] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
              >
                <span>{t('hero.cta')}</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#f0ee8a] hover:text-[#113c5a] transition-colors flex items-center space-x-2 rtl:space-x-reverse">
                <MessageCircle className="h-5 w-5" />
                <span>{t('hero.aiAssistant')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('packages.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('packages.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              // Loading skeleton
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
                  <div className="w-full h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : featuredPackages.length === 0 ? (
              // No featured packages
              <div className="col-span-3 text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No featured packages available</h3>
                <p className="text-gray-600 mb-4">
                  Check out all our amazing packages instead!
                </p>
                <Link
                  href="/packages"
                  className="bg-[#113c5a] text-white px-6 py-2 rounded-lg hover:bg-[#0e2f45] transition-colors inline-flex items-center space-x-2"
                >
                  <span>Browse All Packages</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              featuredPackages.map((pkg) => (
                <div key={pkg._id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative">
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      {pkg.images && pkg.images.length > 0 ? (
                        <img 
                          src={getImageUrl(pkg.images[0]?.path)} 
                          alt={locale === 'ar' ? pkg.title_ar || pkg.title : pkg.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <div className="hidden w-full h-full bg-gray-200 flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    {pkg.isFeatured && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {locale === 'ar' ? pkg.title_ar || pkg.title : pkg.title}
                      </h3>
                      {pkg.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{pkg.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        {locale === 'ar' ? pkg.destination_ar || pkg.destination : pkg.destination}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {locale === 'ar' ? pkg.description_ar || pkg.description : pkg.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Array.isArray(pkg.category) ? (
                        pkg.category.slice(0, 2).map((cat, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#4391a3] bg-opacity-20 text-[#113c5a]">
                            {cat}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#4391a3] bg-opacity-20 text-[#113c5a]">
                          {pkg.category}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <DiscountPriceDisplay 
                          pkg={pkg}
                          locale={locale} 
                          className="text-2xl font-bold text-[#113c5a]" 
                          size="lg" 
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        {pkg.duration} {pkg.duration === 1 ? 'day' : 'days'}
                      </div>
                    </div>
                    
                    <Link
                      href={createPackageUrl(pkg, locale)}
                      className="w-full mt-4 bg-[#113c5a] text-white py-2 rounded-lg hover:bg-[#0e2f45] transition-colors block text-center"
                    >
                      {t('packages.bookNow')}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link
              href="/packages"
              className="bg-[#113c5a] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#0e2f45] transition-colors inline-flex items-center space-x-2 rtl:space-x-reverse"
            >
              <span>{t('home.viewAllPackages')}</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[#113c5a] mb-4">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('home.features.ai.title')}
              </h3>
              <p className="text-gray-600">
                {t('home.features.ai.description')}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[#4391a3] mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('home.features.cultural.title')}
              </h3>
              <p className="text-gray-600">
                {t('home.features.cultural.description')}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[#a1cee8] mb-4">
                <Globe className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('home.features.expertise.title')}
              </h3>
              <p className="text-gray-600">
                {t('home.features.expertise.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#113c5a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            {t('home.cta.subtitle')}
          </p>
          <button className="bg-[#f0ee8a] text-[#113c5a] px-8 py-3 rounded-lg font-semibold hover:bg-[#e8e67a] transition-colors flex items-center space-x-2 rtl:space-x-reverse mx-auto">
            <MessageCircle className="h-5 w-5" />
            <span>{t('hero.aiAssistant')}</span>
          </button>
        </div>
      </section>

    </Layout>
  )
}

export default HomePage