'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Heart, 
  Filter, 
  Search,
  Camera,
  Mountain,
  Waves,
  Building,
  Utensils,
  Palette,
  Music,
  Plane,
  Calendar,
  DollarSign,
  Globe,
  TrendingUp,
  Award,
  Shield,
  Accessibility
} from 'lucide-react';

interface TravelPackage {
  id: string;
  title: string;
  destination: string;
  duration: number;
  price: number;
  currency: 'USD' | 'SAR';
  rating: number;
  reviewCount: number;
  category: string;
  travelStyle: string;
  ageGroup: string;
  difficulty: string;
  highlights: string[];
  images: string[];
  dietaryOptions: string[];
  accessibilityFeatures: string[];
  interests: string[];
  seasonality: string[];
  description: string;
  maxTravelers: number;
  safetyFeatures: string[];
  inclusiveFeatures: string[];
}

interface RecommendationFilters {
  category: string;
  budget: { min: number; max: number };
  duration: { min: number; max: number };
  travelStyle: string;
  interests: string[];
  dietaryNeeds: string[];
  accessibility: string[];
  season: string;
  groupSize: number;
}

const UniversalTravelRecommendations: React.FC = () => {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<TravelPackage[]>([]);
  const [filters, setFilters] = useState<RecommendationFilters>({
    category: 'all',
    budget: { min: 0, max: 10000 },
    duration: { min: 1, max: 30 },
    travelStyle: 'all',
    interests: [],
    dietaryNeeds: [],
    accessibility: [],
    season: 'all',
    groupSize: 1
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [activeTab, setActiveTab] = useState('all');

  const categories = [
    { id: 'adventure', label: 'Adventure', icon: Mountain, color: 'bg-orange-100 text-orange-800' },
    { id: 'luxury', label: 'Luxury', icon: Award, color: 'bg-purple-100 text-purple-800' },
    { id: 'family', label: 'Family', icon: Users, color: 'bg-blue-100 text-blue-800' },
    { id: 'business', label: 'Business', icon: Building, color: 'bg-gray-100 text-gray-800' },
    { id: 'cultural', label: 'Cultural', icon: Palette, color: 'bg-green-100 text-green-800' },
    { id: 'nature', label: 'Nature', icon: Waves, color: 'bg-teal-100 text-teal-800' },
    { id: 'cruise', label: 'Cruise', icon: Plane, color: 'bg-indigo-100 text-indigo-800' },
    { id: 'budget', label: 'Budget', icon: DollarSign, color: 'bg-yellow-100 text-yellow-800' }
  ];

  const travelStyles = [
    { id: 'relaxed', label: 'Relaxed' },
    { id: 'moderate', label: 'Moderate' },
    { id: 'active', label: 'Active' },
    { id: 'adventure', label: 'Adventure' },
    { id: 'luxury', label: 'Luxury' }
  ];

  const interests = [
    { id: 'history', label: 'History', icon: Building },
    { id: 'art', label: 'Art & Culture', icon: Palette },
    { id: 'food', label: 'Food & Dining', icon: Utensils },
    { id: 'nature', label: 'Nature & Wildlife', icon: Mountain },
    { id: 'adventure', label: 'Adventure Sports', icon: Waves },
    { id: 'photography', label: 'Photography', icon: Camera },
    { id: 'music', label: 'Music & Events', icon: Music },
    { id: 'wellness', label: 'Wellness & Spa', icon: Heart }
  ];

  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'gluten_free', label: 'Gluten-Free' },
    { id: 'halal', label: 'Halal' },
    { id: 'kosher', label: 'Kosher' },
    { id: 'dairy_free', label: 'Dairy-Free' },
    { id: 'nut_free', label: 'Nut-Free' }
  ];

  const accessibilityOptions = [
    { id: 'wheelchair_accessible', label: 'Wheelchair Accessible' },
    { id: 'hearing_assistance', label: 'Hearing Assistance' },
    { id: 'visual_assistance', label: 'Visual Assistance' },
    { id: 'mobility_support', label: 'Mobility Support' }
  ];

  const samplePackages: TravelPackage[] = [
    {
      id: '1',
      title: 'Desert Adventure Experience',
      destination: 'AlUla, Saudi Arabia',
      duration: 4,
      price: 1200,
      currency: 'USD',
      rating: 4.8,
      reviewCount: 127,
      category: 'adventure',
      travelStyle: 'active',
      ageGroup: 'adult_friendly',
      difficulty: 'moderate',
      highlights: ['Desert camping', 'Rock climbing', 'Stargazing', 'Cultural sites'],
      images: ['/images/alula-desert.jpg'],
      dietaryOptions: ['vegetarian', 'halal'],
      accessibilityFeatures: ['mobility_support'],
      interests: ['adventure', 'nature', 'photography'],
      seasonality: ['autumn', 'winter', 'spring'],
      description: 'Explore the stunning landscapes of AlUla with guided desert adventures, rock formations, and cultural experiences.',
      maxTravelers: 12,
      safetyFeatures: ['Professional guides', 'Safety equipment', 'Emergency communication'],
      inclusiveFeatures: ['Multi-language guides', 'Dietary accommodations', 'Cultural sensitivity training']
    },
    {
      id: '2',
      title: 'Red Sea Luxury Resort',
      destination: 'Jeddah, Saudi Arabia',
      duration: 7,
      price: 2500,
      currency: 'USD',
      rating: 4.9,
      reviewCount: 89,
      category: 'luxury',
      travelStyle: 'relaxed',
      ageGroup: 'all_ages',
      difficulty: 'easy',
      highlights: ['Private beach', 'Spa treatments', 'Fine dining', 'Water sports'],
      images: ['/images/red-sea-resort.jpg'],
      dietaryOptions: ['vegetarian', 'vegan', 'gluten_free', 'halal'],
      accessibilityFeatures: ['wheelchair_accessible', 'hearing_assistance'],
      interests: ['wellness', 'food', 'nature'],
      seasonality: ['year_round'],
      description: 'Luxury beachfront resort experience with world-class amenities and personalized service.',
      maxTravelers: 2,
      safetyFeatures: ['24/7 medical staff', 'Lifeguards', 'Security'],
      inclusiveFeatures: ['Universal design', 'Inclusive activities', 'Cultural diversity']
    },
    {
      id: '3',
      title: 'Cultural Heritage Tour',
      destination: 'Riyadh, Saudi Arabia',
      duration: 5,
      price: 800,
      currency: 'USD',
      rating: 4.7,
      reviewCount: 156,
      category: 'cultural',
      travelStyle: 'moderate',
      ageGroup: 'all_ages',
      difficulty: 'easy',
      highlights: ['Historical sites', 'Museums', 'Traditional crafts', 'Local cuisine'],
      images: ['/images/riyadh-heritage.jpg'],
      dietaryOptions: ['vegetarian', 'halal'],
      accessibilityFeatures: ['wheelchair_accessible', 'visual_assistance'],
      interests: ['history', 'art', 'food'],
      seasonality: ['autumn', 'winter', 'spring'],
      description: 'Discover Saudi Arabia\'s rich cultural heritage through guided tours of historical sites and interactive experiences.',
      maxTravelers: 20,
      safetyFeatures: ['Licensed guides', 'Group insurance', 'Emergency protocols'],
      inclusiveFeatures: ['Multi-generational activities', 'Educational programs', 'Cultural exchange']
    },
    {
      id: '4',
      title: 'Family Adventure Park',
      destination: 'NEOM, Saudi Arabia',
      duration: 6,
      price: 1800,
      currency: 'USD',
      rating: 4.6,
      reviewCount: 203,
      category: 'family',
      travelStyle: 'active',
      ageGroup: 'family_friendly',
      difficulty: 'easy',
      highlights: ['Theme park', 'Educational center', 'Adventure activities', 'Entertainment shows'],
      images: ['/images/neom-family.jpg'],
      dietaryOptions: ['vegetarian', 'vegan', 'gluten_free', 'halal', 'nut_free'],
      accessibilityFeatures: ['wheelchair_accessible', 'hearing_assistance', 'visual_assistance'],
      interests: ['adventure', 'nature', 'family'],
      seasonality: ['year_round'],
      description: 'Family-friendly destination with activities for all ages in a futuristic setting.',
      maxTravelers: 6,
      safetyFeatures: ['Child safety measures', 'Medical facilities', 'Certified attractions'],
      inclusiveFeatures: ['Family-focused design', 'Age-appropriate activities', 'Special needs support']
    }
  ];

  useEffect(() => {
    setPackages(samplePackages);
    setFilteredPackages(samplePackages);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, searchTerm, sortBy, activeTab]);

  const applyFilters = () => {
    let filtered = [...packages];

    // Category filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(pkg => pkg.category === activeTab);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(pkg => 
        pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Budget filter
    filtered = filtered.filter(pkg => 
      pkg.price >= filters.budget.min && pkg.price <= filters.budget.max
    );

    // Duration filter
    filtered = filtered.filter(pkg => 
      pkg.duration >= filters.duration.min && pkg.duration <= filters.duration.max
    );

    // Travel style filter
    if (filters.travelStyle !== 'all') {
      filtered = filtered.filter(pkg => pkg.travelStyle === filters.travelStyle);
    }

    // Interests filter
    if (filters.interests.length > 0) {
      filtered = filtered.filter(pkg => 
        filters.interests.some(interest => pkg.interests.includes(interest))
      );
    }

    // Dietary needs filter
    if (filters.dietaryNeeds.length > 0) {
      filtered = filtered.filter(pkg => 
        filters.dietaryNeeds.some(diet => pkg.dietaryOptions.includes(diet))
      );
    }

    // Accessibility filter
    if (filters.accessibility.length > 0) {
      filtered = filtered.filter(pkg => 
        filters.accessibility.some(access => pkg.accessibilityFeatures.includes(access))
      );
    }

    // Sort
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'duration':
        filtered.sort((a, b) => a.duration - b.duration);
        break;
      case 'popularity':
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        // Keep original order for relevance
        break;
    }

    setFilteredPackages(filtered);
  };

  const PackageCard: React.FC<{ package: TravelPackage }> = ({ package: pkg }) => {
    const categoryInfo = categories.find(c => c.id === pkg.category);
    const CategoryIcon = categoryInfo?.icon || MapPin;

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <div className="relative">
          <div className="aspect-video bg-gray-200 flex items-center justify-center">
            <Camera className="h-12 w-12 text-gray-400" />
          </div>
          <div className="absolute top-3 left-3">
            <Badge className={categoryInfo?.color}>
              <CategoryIcon className="h-3 w-3 mr-1" />
              {categoryInfo?.label}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg line-clamp-1">{pkg.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-3 w-3" />
                <span>{pkg.destination}</span>
                <Clock className="h-3 w-3 ml-2" />
                <span>{pkg.duration} days</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{pkg.rating}</span>
              </div>
              <span className="text-sm text-gray-500">({pkg.reviewCount} reviews)</span>
            </div>

            <div className="flex flex-wrap gap-1">
              {pkg.highlights.slice(0, 3).map((highlight, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {highlight}
                </Badge>
              ))}
            </div>

            {/* Accessibility and Dietary Info */}
            <div className="flex items-center gap-2 text-xs text-gray-600">
              {pkg.accessibilityFeatures.length > 0 && (
                <div className="flex items-center gap-1">
                  <Accessibility className="h-3 w-3" />
                  <span>Accessible</span>
                </div>
              )}
              {pkg.dietaryOptions.length > 0 && (
                <div className="flex items-center gap-1">
                  <Utensils className="h-3 w-3" />
                  <span>Dietary options</span>
                </div>
              )}
              {pkg.safetyFeatures.length > 0 && (
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>Safety certified</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <span className="text-2xl font-bold text-blue-600">
                  ${pkg.price}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  {pkg.currency}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Details
                </Button>
                <Button size="sm">
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const FilterPanel: React.FC = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Budget Range</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.budget.min}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  budget: { ...prev.budget, min: parseInt(e.target.value) || 0 }
                }))}
              />
              <span>-</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.budget.max}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  budget: { ...prev.budget, max: parseInt(e.target.value) || 10000 }
                }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Travel Style</label>
            <Select 
              value={filters.travelStyle} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, travelStyle: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Styles</SelectItem>
                {travelStyles.map(style => (
                  <SelectItem key={style.id} value={style.id}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min days"
                value={filters.duration.min}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  duration: { ...prev.duration, min: parseInt(e.target.value) || 1 }
                }))}
              />
              <span>-</span>
              <Input
                type="number"
                placeholder="Max days"
                value={filters.duration.max}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  duration: { ...prev.duration, max: parseInt(e.target.value) || 30 }
                }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="popularity">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Discover Your Perfect Journey
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore curated travel experiences designed for every traveler, 
          with accessibility, dietary preferences, and cultural sensitivity in mind.
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search destinations, activities, or experiences..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filter Panel */}
      <FilterPanel />

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {filteredPackages.length} experiences found
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                All inclusive & accessible
              </span>
            </div>
          </div>

          {/* Package Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map(pkg => (
              <PackageCard key={pkg.id} package={pkg} />
            ))}
          </div>

          {/* No Results */}
          {filteredPackages.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No experiences found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters or search terms to find more options.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UniversalTravelRecommendations;