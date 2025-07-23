'use client'

import { useState } from 'react'
import { ArrowLeft, Star, MapPin, Calendar, Users, Check, X, DollarSign, Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { createPackageUrl } from '@/utils/slugUtils'

interface Package {
  _id: string
  title: string
  description: string
  destination: string
  price: number
  duration: number
  category: string
  images: string[]
  rating: number
  reviewCount: number
  availability: boolean
  featured: boolean
  inclusions?: string[]
  exclusions?: string[]
  highlights?: string[]
  difficulty?: string
  maxGroupSize?: number
  minAge?: number
}

interface PackageComparisonPageProps {
  packages: Package[]
}

const PackageComparisonPage = ({ packages }: PackageComparisonPageProps) => {
  const [activeImageIndex, setActiveImageIndex] = useState<{ [key: string]: number }>({})

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price)
  }

  const comparisonFeatures = [
    { key: 'price', label: 'Price', type: 'price' },
    { key: 'duration', label: 'Duration', type: 'duration' },
    { key: 'rating', label: 'Rating', type: 'rating' },
    { key: 'reviewCount', label: 'Reviews', type: 'number' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'difficulty', label: 'Difficulty', type: 'text' },
    { key: 'maxGroupSize', label: 'Max Group Size', type: 'number' },
    { key: 'minAge', label: 'Min Age', type: 'age' },
  ]

  const getFeatureValue = (pkg: Package, key: string, type: string) => {
    const value = pkg[key as keyof Package]
    
    switch (type) {
      case 'price':
        return formatPrice(value as number)
      case 'duration':
        return `${value} days`
      case 'rating':
        return (
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span>{value}</span>
          </div>
        )
      case 'age':
        return `${value || 5}+ years`
      case 'number':
        return value || 'N/A'
      default:
        return value || 'N/A'
    }
  }

  const getBestValue = (feature: string) => {
    switch (feature) {
      case 'price':
        return Math.min(...packages.map(p => p.price))
      case 'rating':
        return Math.max(...packages.map(p => p.rating))
      case 'duration':
        return Math.max(...packages.map(p => p.duration))
      default:
        return null
    }
  }

  const isBestValue = (pkg: Package, feature: string) => {
    const bestValue = getBestValue(feature)
    if (bestValue === null) return false
    
    const value = pkg[feature as keyof Package] as number
    return value === bestValue
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/packages"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Packages</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Compare Packages</h1>
            </div>
            <div className="text-gray-600">
              Comparing {packages.length} packages
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Package Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {packages.map((pkg) => (
            <div key={pkg._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={pkg.images[activeImageIndex[pkg._id] || 0] || '/images/placeholder.jpg'}
                  alt={pkg.title || 'Package image'}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{pkg.rating}</span>
                </div>
                {pkg.images.length > 1 && (
                  <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-1">
                    {pkg.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(prev => ({ ...prev, [pkg._id]: index }))}
                        className={`w-2 h-2 rounded-full ${
                          index === (activeImageIndex[pkg._id] || 0) ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.title}</h3>
                <div className="flex items-center text-gray-500 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{pkg.destination}</span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">{pkg.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-blue-600">{formatPrice(pkg.price)}</div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{pkg.duration} days</span>
                  </div>
                </div>
                
                <Link
                  href={createPackageUrl(pkg, 'en')}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Feature Comparison</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Feature
                  </th>
                  {packages.map((pkg) => (
                    <th key={pkg._id} className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {pkg.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comparisonFeatures.map((feature) => (
                  <tr key={feature.key} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {feature.label}
                    </td>
                    {packages.map((pkg) => (
                      <td key={pkg._id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        <div className={`${
                          isBestValue(pkg, feature.key) ? 'bg-green-100 text-green-800 px-2 py-1 rounded-full' : ''
                        }`}>
                          {getFeatureValue(pkg, feature.key, feature.type)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inclusions Comparison */}
        <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">What's Included</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div key={pkg._id}>
                  <h3 className="font-semibold text-gray-900 mb-4">{pkg.title}</h3>
                  <div className="space-y-2">
                    {pkg.inclusions && pkg.inclusions.length > 0 ? (
                      pkg.inclusions.map((inclusion, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{inclusion}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">No inclusions listed</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Highlights Comparison */}
        <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Highlights</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div key={pkg._id}>
                  <h3 className="font-semibold text-gray-900 mb-4">{pkg.title}</h3>
                  <div className="space-y-2">
                    {pkg.highlights && pkg.highlights.length > 0 ? (
                      pkg.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <Star className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{highlight}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">No highlights listed</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Price Comparison Summary */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Price Comparison Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">Lowest Price</div>
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(Math.min(...packages.map(p => p.price)))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Highest Price</div>
              <div className="text-2xl font-bold text-red-600">
                {formatPrice(Math.max(...packages.map(p => p.price)))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Average Price</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(packages.reduce((sum, p) => sum + p.price, 0) / packages.length)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/packages"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-center"
          >
            Browse More Packages
          </Link>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Get Personalized Recommendations
          </button>
        </div>
      </div>
    </div>
  )
}

export default PackageComparisonPage