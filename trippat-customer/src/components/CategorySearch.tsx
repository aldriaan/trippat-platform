'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Grid, 
  List, 
  Star, 
  MapPin, 
  Calendar, 
  DollarSign,
  Users,
  Heart,
  Eye,
  Bookmark,
  Share2,
  Clock,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';

interface Package {
  id: string;
  title: string;
  destination: string;
  category: string;
  price: number;
  duration: number;
  rating: number;
  reviewCount: number;
  images: string[];
  highlights: string[];
  difficulty: string;
  ageGroup: string;
  features: string[];
  availability: boolean;
  createdAt: string;
  travelStyle: string;
  interests: string[];
  seasonality: string[];
  maxTravelers: number;
  viewCount?: number;
  bookmarkCount?: number;
  description: string;
}

interface CategorySearchProps {
  packages: Package[];
  onPackageSelect: (packageId: string) => void;
  isLoading?: boolean;
  error?: string;
}

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'duration_asc' | 'duration_desc' | 'newest' | 'popularity';
type ViewMode = 'grid' | 'list';

const CategorySearch: React.FC<CategorySearchProps> = ({
  packages,
  onPackageSelect,
  isLoading = false,
  error
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarkedPackages, setBookmarkedPackages] = useState<Set<string>>(new Set());

  const itemsPerPage = 12;

  // Filter and sort packages
  const filteredAndSortedPackages = useMemo(() => {
    let filtered = packages;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(pkg => 
        pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.highlights.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(pkg => pkg.category === selectedCategory);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'duration_asc':
          return a.duration - b.duration;
        case 'duration_desc':
          return b.duration - a.duration;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'popularity':
          return (b.viewCount || 0) - (a.viewCount || 0);
        case 'relevance':
        default:
          // Score based on multiple factors
          const scoreA = calculateRelevanceScore(a, searchQuery);
          const scoreB = calculateRelevanceScore(b, searchQuery);
          return scoreB - scoreA;
      }
    });

    return sorted;
  }, [packages, searchQuery, selectedCategory, sortBy]);

  // Calculate relevance score
  const calculateRelevanceScore = (pkg: Package, query: string): number => {
    let score = 0;
    const lowerQuery = query.toLowerCase();

    // Title match (highest weight)
    if (pkg.title.toLowerCase().includes(lowerQuery)) score += 10;
    
    // Destination match
    if (pkg.destination.toLowerCase().includes(lowerQuery)) score += 8;
    
    // Description match
    if (pkg.description.toLowerCase().includes(lowerQuery)) score += 5;
    
    // Highlights match
    pkg.highlights.forEach(highlight => {
      if (highlight.toLowerCase().includes(lowerQuery)) score += 3;
    });

    // Features match
    pkg.features.forEach(feature => {
      if (feature.toLowerCase().includes(lowerQuery)) score += 2;
    });

    // Boost for high rating
    score += pkg.rating * 2;
    
    // Boost for availability
    if (pkg.availability) score += 1;

    return score;
  };

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPackages.length / itemsPerPage);
  const paginatedPackages = filteredAndSortedPackages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  const handleBookmark = (packageId: string) => {
    setBookmarkedPackages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(packageId)) {
        newSet.delete(packageId);
      } else {
        newSet.add(packageId);
      }
      return newSet;
    });
  };

  const handleShare = (pkg: Package) => {
    if (navigator.share) {
      navigator.share({
        title: pkg.title,
        text: `Check out this amazing travel package: ${pkg.title}`,
        url: `${window.location.origin}/packages/${pkg.id}`
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/packages/${pkg.id}`);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      adventure: 'bg-orange-100 text-orange-800',
      luxury: 'bg-purple-100 text-purple-800',
      family: 'bg-blue-100 text-blue-800',
      cultural: 'bg-green-100 text-green-800',
      nature: 'bg-teal-100 text-teal-800',
      business: 'bg-gray-100 text-gray-800',
      wellness: 'bg-pink-100 text-pink-800',
      food: 'bg-red-100 text-red-800',
      photography: 'bg-indigo-100 text-indigo-800',
      budget: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      challenging: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const PackageCard = ({ pkg, isListView = false }: { pkg: Package; isListView?: boolean }) => {
    const isBookmarked = bookmarkedPackages.has(pkg.id);

    if (isListView) {
      return (
        <Card className="mb-4 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="w-48 h-32 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                {pkg.images[0] && (
                  <img 
                    src={pkg.images[0]} 
                    alt={pkg.title || 'Package image'}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 
                      className="text-lg font-semibold hover:text-blue-600 cursor-pointer"
                      onClick={() => onPackageSelect(pkg.id)}
                    >
                      {pkg.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {pkg.destination}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {pkg.duration} days
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Max {pkg.maxTravelers}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBookmark(pkg.id)}
                      className={isBookmarked ? 'text-red-500' : ''}
                    >
                      <Heart className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(pkg)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getCategoryBadgeColor(pkg.category)}>
                    {pkg.category}
                  </Badge>
                  <Badge className={getDifficultyColor(pkg.difficulty)}>
                    {pkg.difficulty}
                  </Badge>
                  {!pkg.availability && (
                    <Badge variant="destructive">Unavailable</Badge>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2">{pkg.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{pkg.rating}</span>
                      <span className="text-sm text-gray-500">({pkg.reviewCount})</span>
                    </div>
                    
                    {pkg.viewCount && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Eye className="h-4 w-4" />
                        {pkg.viewCount}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">${pkg.price}</div>
                    <div className="text-sm text-gray-500">per person</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
        <div className="relative">
          <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
            {pkg.images[0] && (
              <img 
                src={pkg.images[0]} 
                alt={pkg.title || 'Package image'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}
          </div>
          
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleBookmark(pkg.id);
              }}
              className={`bg-white/80 hover:bg-white ${isBookmarked ? 'text-red-500' : ''}`}
            >
              <Heart className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleShare(pkg);
              }}
              className="bg-white/80 hover:bg-white"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="absolute top-2 left-2 flex gap-1">
            <Badge className={getCategoryBadgeColor(pkg.category)}>
              {pkg.category}
            </Badge>
            {!pkg.availability && (
              <Badge variant="destructive">Unavailable</Badge>
            )}
          </div>
        </div>
        
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 
              className="font-semibold text-lg hover:text-blue-600 cursor-pointer line-clamp-1"
              onClick={() => onPackageSelect(pkg.id)}
            >
              {pkg.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {pkg.destination}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {pkg.duration} days
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(pkg.difficulty)} variant="outline">
              {pkg.difficulty}
            </Badge>
            <Badge variant="outline">{pkg.ageGroup}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{pkg.rating}</span>
              <span className="text-sm text-gray-500">({pkg.reviewCount})</span>
            </div>
            
            <div className="text-right">
              <div className="text-xl font-bold text-blue-600">${pkg.price}</div>
              <div className="text-xs text-gray-500">per person</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-red-600">Error loading packages: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="adventure">Adventure</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
                <SelectItem value="nature">Nature</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="wellness">Wellness</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="photography">Photography</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Relevance
                  </div>
                </SelectItem>
                <SelectItem value="price_asc">
                  <div className="flex items-center gap-2">
                    <SortAsc className="h-4 w-4" />
                    Price: Low to High
                  </div>
                </SelectItem>
                <SelectItem value="price_desc">
                  <div className="flex items-center gap-2">
                    <SortDesc className="h-4 w-4" />
                    Price: High to Low
                  </div>
                </SelectItem>
                <SelectItem value="rating">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Highest Rated
                  </div>
                </SelectItem>
                <SelectItem value="newest">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Newest
                  </div>
                </SelectItem>
                <SelectItem value="popularity">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Most Popular
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {isLoading ? 'Loading...' : `${filteredAndSortedPackages.length} packages found`}
            </span>
            {filteredAndSortedPackages.length > 0 && (
              <span>
                Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredAndSortedPackages.length)} of {filteredAndSortedPackages.length}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAndSortedPackages.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">No packages found matching your criteria.</div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {paginatedPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} isListView={viewMode === 'list'} />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8"
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CategorySearch;