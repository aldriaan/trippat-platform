'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  Filter, 
  Search, 
  X, 
  DollarSign, 
  Calendar, 
  Users, 
  MapPin,
  Mountain,
  Star,
  Heart,
  Camera,
  Utensils,
  Building,
  TreePine,
  Palette,
  Sparkles,
  Clock
} from 'lucide-react';

interface FilterState {
  categories: string[];
  budgetRange: [number, number];
  duration: [number, number];
  difficulty: string[];
  ageGroup: string[];
  interests: string[];
  destination: string;
  availability: 'all' | 'available' | 'unavailable';
  travelStyle: string[];
  season: string[];
  features: string[];
  searchQuery: string;
}

interface CategoryFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  availableDestinations: string[];
  totalResults: number;
  isLoading?: boolean;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  onFiltersChange,
  availableDestinations,
  totalResults,
  isLoading = false
}) => {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    budgetRange: [0, 10000],
    duration: [1, 30],
    difficulty: [],
    ageGroup: [],
    interests: [],
    destination: '',
    availability: 'available',
    travelStyle: [],
    season: [],
    features: [],
    searchQuery: ''
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const travelCategories = [
    { id: 'adventure', label: 'Adventure Travel', icon: Mountain, color: 'bg-orange-100 text-orange-800' },
    { id: 'luxury', label: 'Luxury Travel', icon: Star, color: 'bg-purple-100 text-purple-800' },
    { id: 'family', label: 'Family Travel', icon: Users, color: 'bg-secondary/20 text-primary' },
    { id: 'cultural', label: 'Cultural Travel', icon: Palette, color: 'bg-green-100 text-green-800' },
    { id: 'nature', label: 'Nature Travel', icon: TreePine, color: 'bg-teal-100 text-teal-800' },
    { id: 'business', label: 'Business Travel', icon: Building, color: 'bg-gray-100 text-gray-800' },
    { id: 'wellness', label: 'Wellness Travel', icon: Heart, color: 'bg-pink-100 text-pink-800' },
    { id: 'food', label: 'Food Travel', icon: Utensils, color: 'bg-red-100 text-red-800' },
    { id: 'photography', label: 'Photography Travel', icon: Camera, color: 'bg-accent/20 text-accent' },
    { id: 'budget', label: 'Budget Travel', icon: DollarSign, color: 'bg-yellow-100 text-yellow-800' }
  ];

  const difficultyOptions = [
    { id: 'easy', label: 'Easy', description: 'Suitable for all fitness levels' },
    { id: 'moderate', label: 'Moderate', description: 'Some physical activity required' },
    { id: 'challenging', label: 'Challenging', description: 'High fitness level required' }
  ];

  const ageGroupOptions = [
    { id: 'family_friendly', label: 'Family Friendly', description: 'Suitable for children' },
    { id: 'adult_only', label: 'Adult Only', description: '18+ years only' },
    { id: 'senior_friendly', label: 'Senior Friendly', description: 'Accessible for seniors' },
    { id: 'young_adult', label: 'Young Adult', description: 'Perfect for 18-35 age group' },
    { id: 'all_ages', label: 'All Ages', description: 'Suitable for everyone' }
  ];

  const interestOptions = [
    { id: 'history', label: 'History & Heritage' },
    { id: 'art', label: 'Art & Culture' },
    { id: 'food', label: 'Food & Dining' },
    { id: 'nature', label: 'Nature & Wildlife' },
    { id: 'adventure', label: 'Adventure Sports' },
    { id: 'wellness', label: 'Wellness & Spa' },
    { id: 'photography', label: 'Photography' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'nightlife', label: 'Nightlife' },
    { id: 'music', label: 'Music & Events' },
    { id: 'sports', label: 'Sports' }
  ];

  const travelStyleOptions = [
    { id: 'relaxed', label: 'Relaxed', description: 'Slow-paced, leisurely' },
    { id: 'moderate', label: 'Moderate', description: 'Balanced pace' },
    { id: 'active', label: 'Active', description: 'Busy schedule, lots of activities' },
    { id: 'adventure', label: 'Adventure', description: 'Thrill-seeking experiences' },
    { id: 'luxury', label: 'Luxury', description: 'Premium comfort and service' }
  ];

  const seasonOptions = [
    { id: 'spring', label: 'Spring', description: 'March - May' },
    { id: 'summer', label: 'Summer', description: 'June - August' },
    { id: 'autumn', label: 'Autumn', description: 'September - November' },
    { id: 'winter', label: 'Winter', description: 'December - February' },
    { id: 'year_round', label: 'Year Round', description: 'Available all year' }
  ];

  const categoryFeatures = {
    adventure: ['hiking', 'diving', 'climbing', 'extreme_sports', 'water_sports', 'desert_safari'],
    luxury: ['five_star_hotel', 'premium_dining', 'vip_services', 'private_transportation', 'personal_concierge', 'spa_services'],
    family: ['kid_friendly', 'family_rooms', 'educational_activities', 'playground', 'babysitting', 'family_entertainment'],
    cultural: ['historical_sites', 'museums', 'local_experiences', 'cultural_tours', 'traditional_crafts', 'cultural_workshops'],
    nature: ['national_parks', 'wildlife_viewing', 'eco_tourism', 'sustainable_travel', 'bird_watching', 'marine_life'],
    business: ['conference_facilities', 'business_center', 'wifi', 'presentation_equipment', 'corporate_rates', 'executive_lounge'],
    wellness: ['spa_treatments', 'yoga_classes', 'meditation', 'fitness_center', 'healthy_dining', 'wellness_programs'],
    food: ['culinary_tours', 'cooking_classes', 'local_cuisine', 'food_markets', 'chef_experiences', 'farm_to_table'],
    photography: ['scenic_routes', 'photography_workshops', 'instagram_spots', 'golden_hour_locations', 'landscape_photography', 'night_photography'],
    budget: ['affordable_accommodation', 'budget_dining', 'free_activities', 'public_transportation', 'group_discounts', 'backpacking_friendly']
  };

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleArrayFilterToggle = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(value)
        ? (prev[key] as string[]).filter(item => item !== value)
        : [...(prev[key] as string[]), value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      budgetRange: [0, 10000],
      duration: [1, 30],
      difficulty: [],
      ageGroup: [],
      interests: [],
      destination: '',
      availability: 'available',
      travelStyle: [],
      season: [],
      features: [],
      searchQuery: ''
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.budgetRange[0] > 0 || filters.budgetRange[1] < 10000) count++;
    if (filters.duration[0] > 1 || filters.duration[1] < 30) count++;
    if (filters.difficulty.length > 0) count++;
    if (filters.ageGroup.length > 0) count++;
    if (filters.interests.length > 0) count++;
    if (filters.destination) count++;
    if (filters.availability !== 'available') count++;
    if (filters.travelStyle.length > 0) count++;
    if (filters.season.length > 0) count++;
    if (filters.features.length > 0) count++;
    if (filters.searchQuery) count++;
    return count;
  };

  const getAvailableFeatures = () => {
    if (filters.categories.length === 0) return [];
    
    const features = new Set<string>();
    filters.categories.forEach(category => {
      if (categoryFeatures[category]) {
        categoryFeatures[category].forEach(feature => features.add(feature));
      }
    });
    
    return Array.from(features);
  };

  return (
    <div className="space-y-6">
      {/* Search and Results Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search packages, destinations, activities..."
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {isLoading ? 'Loading...' : `${totalResults} packages found`}
            </span>
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Quick Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Travel Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {travelCategories.map((category) => {
              const Icon = category.icon;
              const isSelected = filters.categories.includes(category.id);
              return (
                <Button
                  key={category.id}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleArrayFilterToggle('categories', category.id)}
                  className={`h-auto py-3 px-2 flex flex-col items-center gap-1 ${
                    isSelected ? '' : 'hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs text-center leading-tight">
                    {category.label}
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Budget Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Budget Range (USD)
              </label>
              <div className="px-3">
                <Slider
                  value={filters.budgetRange}
                  onValueChange={(value) => handleFilterChange('budgetRange', value)}
                  max={10000}
                  min={0}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>${filters.budgetRange[0]}</span>
                  <span>${filters.budgetRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duration (Days)
              </label>
              <div className="px-3">
                <Slider
                  value={filters.duration}
                  onValueChange={(value) => handleFilterChange('duration', value)}
                  max={30}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>{filters.duration[0]} day{filters.duration[0] !== 1 ? 's' : ''}</span>
                  <span>{filters.duration[1]} day{filters.duration[1] !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Destination
              </label>
              <Select 
                value={filters.destination} 
                onValueChange={(value) => handleFilterChange('destination', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Destinations</SelectItem>
                  {availableDestinations.map((destination) => (
                    <SelectItem key={destination} value={destination}>
                      {destination}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty Level</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {difficultyOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={filters.difficulty.includes(option.id)}
                      onCheckedChange={() => handleArrayFilterToggle('difficulty', option.id)}
                    />
                    <label htmlFor={option.id} className="text-sm cursor-pointer">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-gray-600 text-xs">{option.description}</div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Age Group */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Age Group</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {ageGroupOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={filters.ageGroup.includes(option.id)}
                      onCheckedChange={() => handleArrayFilterToggle('ageGroup', option.id)}
                    />
                    <label htmlFor={option.id} className="text-sm cursor-pointer">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-gray-600 text-xs">{option.description}</div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Travel Style */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Travel Style</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {travelStyleOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={filters.travelStyle.includes(option.id)}
                      onCheckedChange={() => handleArrayFilterToggle('travelStyle', option.id)}
                    />
                    <label htmlFor={option.id} className="text-sm cursor-pointer">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-gray-600 text-xs">{option.description}</div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Interests</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {interestOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={filters.interests.includes(option.id)}
                      onCheckedChange={() => handleArrayFilterToggle('interests', option.id)}
                    />
                    <label htmlFor={option.id} className="text-sm cursor-pointer">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Season */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Best Season
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {seasonOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={filters.season.includes(option.id)}
                      onCheckedChange={() => handleArrayFilterToggle('season', option.id)}
                    />
                    <label htmlFor={option.id} className="text-sm cursor-pointer">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-gray-600 text-xs">{option.description}</div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Category-Specific Features */}
            {filters.categories.length > 0 && getAvailableFeatures().length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Specific Features</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {getAvailableFeatures().map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature}
                        checked={filters.features.includes(feature)}
                        onCheckedChange={() => handleArrayFilterToggle('features', feature)}
                      />
                      <label htmlFor={feature} className="text-sm cursor-pointer">
                        {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Availability</label>
              <Select 
                value={filters.availability} 
                onValueChange={(value) => handleFilterChange('availability', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Packages</SelectItem>
                  <SelectItem value="available">Available Only</SelectItem>
                  <SelectItem value="unavailable">Unavailable Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Summary */}
      {getActiveFiltersCount() > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filters.categories.map((category) => (
                <Badge key={category} variant="secondary" className="flex items-center gap-1">
                  {travelCategories.find(c => c.id === category)?.label}
                  <button
                    onClick={() => handleArrayFilterToggle('categories', category)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              
              {(filters.budgetRange[0] > 0 || filters.budgetRange[1] < 10000) && (
                <Badge variant="secondary">
                  ${filters.budgetRange[0]} - ${filters.budgetRange[1]}
                </Badge>
              )}
              
              {filters.destination && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.destination}
                  <button
                    onClick={() => handleFilterChange('destination', '')}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {filters.searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  "{filters.searchQuery}"
                  <button
                    onClick={() => handleFilterChange('searchQuery', '')}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CategoryFilters;