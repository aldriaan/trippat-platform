'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  MapPin, 
  Star, 
  Calendar, 
  Users, 
  ArrowRight, 
  Play,
  Quote,
  TrendingUp,
  Shield,
  Heart,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  DollarSign,
  Clock
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { createPackageUrl } from '@/utils/slugUtils'
import { getImageUrl } from '@/utils/imageUtils'

interface Package {
  _id: string
  title: string
  description: string
  destination: string
  price: number
  duration: number
  category: string
  images: {
    path: string
    title?: string
    title_ar?: string
    altText?: string
    altText_ar?: string
    description?: string
    description_ar?: string
    order?: number
    isFeatured?: boolean
    uploadedAt?: string
    _id?: string
  }[]
  rating: number
  reviewCount: number
  availability: boolean
  featured: boolean
}

interface SearchFilters {
  destination: string
  priceRange: { min: number; max: number }
  duration: string
  category: string
}

const HomePage = () => {
  const [featuredPackages, setFeaturedPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    destination: '',
    priceRange: { min: 0, max: 10000 },
    duration: '',
    category: ''
  })
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  
  const router = useRouter()

  // Fetch featured packages
  useEffect(() => {
    const fetchFeaturedPackages = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/packages?featured=true&limit=6')
        const data = await response.json()
        
        if (data.success) {
          setFeaturedPackages(data.data.packages)
        }
      } catch (err) {
        setError('Failed to load featured packages')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedPackages()
  }, [])

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchFilters.destination) params.append('destination', searchFilters.destination)
    if (searchFilters.category) params.append('category', searchFilters.category)
    if (searchFilters.duration) params.append('duration', searchFilters.duration)
    if (searchFilters.priceRange.min > 0) params.append('minPrice', searchFilters.priceRange.min.toString())
    if (searchFilters.priceRange.max < 10000) params.append('maxPrice', searchFilters.priceRange.max.toString())
    
    router.push(`/packages?${params.toString()}`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price)
  }

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      location: 'New York, USA',
      rating: 5,
      text: 'Amazing experience! The trip to Bali was perfectly organized and exceeded all my expectations. The local guide was fantastic and the accommodations were top-notch.',
      avatar: '/images/avatar1.jpg',
      trip: 'Bali Adventure Package'
    },
    {
      id: 2,
      name: 'Michael Chen',
      location: 'San Francisco, USA',
      rating: 5,
      text: 'Trippat made our honeymoon unforgettable. The Switzerland package was breathtaking, and every detail was handled professionally. Highly recommend!',
      avatar: '/images/avatar2.jpg',
      trip: 'Swiss Alps Romance'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      location: 'Los Angeles, USA',
      rating: 5,
      text: 'The family trip to Japan was incredible. Kids loved it, and we learned so much about the culture. Great value for money and excellent service.',
      avatar: '/images/avatar3.jpg',
      trip: 'Japan Family Adventure'
    }
  ]

  const features = [
    {
      icon: Shield,
      title: 'Secure Booking',
      description: 'Your payments are protected with enterprise-grade security'
    },
    {
      icon: Heart,
      title: 'Curated Experiences',
      description: 'Hand-picked packages by travel experts for unforgettable journeys'
    },
    {
      icon: CheckCircle,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for peace of mind'
    },
    {
      icon: TrendingUp,
      title: 'Best Value',
      description: 'Competitive pricing with no hidden fees or surprises'
    }
  ]

  const categories = [
    { name: 'Adventure', icon: '🏔️' },
    { name: 'Beach', icon: '🏖️' },
    { name: 'City', icon: '🏙️' },
    { name: 'Cultural', icon: '🏛️' },
    { name: 'Family', icon: '👨‍👩‍👧‍👦' },
    { name: 'Luxury', icon: '💎' },
    { name: 'Mountain', icon: '⛰️' },
    { name: 'Wildlife', icon: '🦁' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Trippat</span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/packages" className="text-gray-700 hover:text-primary transition-colors">
                Packages
              </Link>
              <Link href="/destinations" className="text-gray-700 hover:text-primary transition-colors">
                Destinations
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-gray-700 hover:text-primary transition-colors">
                Sign In
              </button>
              <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative trippat-gradient text-white">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Your Next
              <span className="block text-secondary">Adventure</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Explore the world with our curated travel packages. From exotic destinations to cultural experiences, find your perfect journey.
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Where do you want to go?"
                    value={searchFilters.destination}
                    onChange={(e) => setSearchFilters({...searchFilters, destination: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <select
                  value={searchFilters.category}
                  onChange={(e) => setSearchFilters({...searchFilters, category: e.target.value})}
                  className="px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name.toLowerCase()}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
                
                <select
                  value={searchFilters.duration}
                  onChange={(e) => setSearchFilters({...searchFilters, duration: e.target.value})}
                  className="px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Any Duration</option>
                  <option value="1-3">1-3 days</option>
                  <option value="4-7">4-7 days</option>
                  <option value="8-14">8-14 days</option>
                  <option value="15+">15+ days</option>
                </select>
                
                <button
                  onClick={handleSearch}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <Search className="h-5 w-5" />
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Packages
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our most popular travel experiences, carefully selected for unforgettable adventures
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPackages.map((pkg) => (
                <div key={pkg._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                  <div className="relative h-48">
                    <Image
                      src={getImageUrl(pkg.images?.[0]?.path)}
                      alt={pkg.title || 'Package image'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{pkg.rating}</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-secondary/20 text-primary text-xs rounded-full">
                        {pkg.category}
                      </span>
                      <span className="text-gray-500 text-sm">•</span>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        {pkg.duration} days
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.title}</h3>
                    <div className="flex items-center text-gray-500 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{pkg.destination}</span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{pkg.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-primary">{formatPrice(pkg.price)}</span>
                        <span className="text-gray-500 text-sm">/person</span>
                      </div>
                      <Link
                        href={createPackageUrl(pkg, 'en')}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
                      >
                        <span>View Details</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link
              href="/packages"
              className="inline-flex items-center space-x-2 bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span>View All Packages</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Trippat?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make travel planning easy and enjoyable with our comprehensive services
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Travelers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real stories from real travelers who experienced amazing journeys with us
            </p>
          </div>
          
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${testimonialIndex * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xl font-semibold text-gray-600">
                              {testimonial.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <div className="flex items-center">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          </div>
                          
                          <Quote className="h-8 w-8 text-gray-300 mb-4" />
                          <p className="text-gray-700 text-lg mb-4">{testimonial.text}</p>
                          
                          <div>
                            <p className="font-semibold text-gray-900">{testimonial.name}</p>
                            <p className="text-gray-500">{testimonial.location}</p>
                            <p className="text-primary text-sm">{testimonial.trip}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setTestimonialIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === testimonialIndex ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-primary text-white"
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get Travel Inspiration
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for exclusive deals, travel tips, and destination guides
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
              <button className="w-full sm:w-auto bg-secondary text-primary px-6 py-3 rounded-lg hover:bg-secondary/90 transition-colors font-semibold">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="text-xl font-bold">Trippat</span>
              </div>
              <p className="text-gray-400">
                Your trusted travel companion for unforgettable adventures around the world.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/packages" className="text-gray-400 hover:text-white transition-colors">Packages</Link></li>
                <li><Link href="/destinations" className="text-gray-400 hover:text-white transition-colors">Destinations</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/cancellation" className="text-gray-400 hover:text-white transition-colors">Cancellation Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="text-gray-400 space-y-2">
                <p>Email: info@trippat.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Address: 123 Travel Street, City, State 12345</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Trippat. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage