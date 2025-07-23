const mongoose = require('mongoose');
const Package = require('../models/Package');
const travelCategories = require('../config/travelCategories');

class RecommendationEngine {
  constructor() {
    this.weightings = {
      categoryMatch: 0.3,
      interestMatch: 0.25,
      priceMatch: 0.2,
      difficultyMatch: 0.1,
      locationMatch: 0.1,
      reviewScore: 0.05
    };
  }

  /**
   * Generate personalized package recommendations
   */
  async generateRecommendations(userId, preferences = {}, options = {}) {
    try {
      const {
        limit = 10,
        excludePackageIds = [],
        includeUnavailable = false,
        categoryBoost = {},
        locationPreference = null
      } = options;

      // Build query
      const query = {
        _id: { $nin: excludePackageIds.map(id => mongoose.Types.ObjectId(id)) }
      };

      if (!includeUnavailable) {
        query.availability = true;
      }

      // Get all packages
      const packages = await Package.find(query)
        .populate('createdBy', 'name')
        .lean();

      // Calculate recommendation scores
      const scoredPackages = packages.map(pkg => ({
        ...pkg,
        recommendationScore: this.calculateRecommendationScore(pkg, preferences, categoryBoost, locationPreference)
      }));

      // Sort by score and return top recommendations
      return scoredPackages
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit)
        .map(pkg => ({
          package: pkg,
          score: pkg.recommendationScore,
          reasons: this.generateRecommendationReasons(pkg, preferences)
        }));

    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  /**
   * Calculate recommendation score for a package
   */
  calculateRecommendationScore(pkg, preferences, categoryBoost = {}, locationPreference = null) {
    let score = 0;
    const reasons = [];

    // Category matching
    if (preferences.categories && preferences.categories.length > 0) {
      const categoryScore = preferences.categories.includes(pkg.category) ? 1 : 0;
      score += categoryScore * this.weightings.categoryMatch;
      
      // Apply category boost
      if (categoryBoost[pkg.category]) {
        score += categoryBoost[pkg.category];
      }
    }

    // Interest matching
    if (preferences.interests && preferences.interests.length > 0 && pkg.interests) {
      const commonInterests = preferences.interests.filter(interest => 
        pkg.interests.includes(interest)
      );
      const interestScore = commonInterests.length / preferences.interests.length;
      score += interestScore * this.weightings.interestMatch;
    }

    // Price matching
    if (preferences.budgetRange) {
      const { min, max } = preferences.budgetRange;
      if (pkg.price >= min && pkg.price <= max) {
        // Perfect price match
        score += this.weightings.priceMatch;
      } else {
        // Partial score based on how close it is
        const distance = Math.min(
          Math.abs(pkg.price - min),
          Math.abs(pkg.price - max)
        );
        const maxDistance = Math.max(min, max);
        const proximityScore = Math.max(0, 1 - (distance / maxDistance));
        score += proximityScore * this.weightings.priceMatch;
      }
    }

    // Difficulty matching
    if (preferences.difficulty && pkg.difficulty) {
      const difficultyScore = preferences.difficulty.includes(pkg.difficulty) ? 1 : 0;
      score += difficultyScore * this.weightings.difficultyMatch;
    }

    // Location preference
    if (locationPreference && pkg.destination) {
      const locationScore = pkg.destination.toLowerCase().includes(locationPreference.toLowerCase()) ? 1 : 0;
      score += locationScore * this.weightings.locationMatch;
    }

    // Review score boost
    if (pkg.averageRating && pkg.averageRating > 0) {
      const reviewScore = (pkg.averageRating / 5) * this.weightings.reviewScore;
      score += reviewScore;
    }

    // Age group matching
    if (preferences.ageGroup && pkg.ageGroup) {
      if (preferences.ageGroup.includes(pkg.ageGroup) || pkg.ageGroup === 'all_ages') {
        score += 0.1; // Bonus for age group match
      }
    }

    // Travel style matching
    if (preferences.travelStyle && pkg.travelStyle) {
      const travelStyleScore = preferences.travelStyle.includes(pkg.travelStyle) ? 1 : 0;
      score += travelStyleScore * 0.1;
    }

    // Seasonal preference
    if (preferences.season && pkg.seasonality) {
      const seasonScore = preferences.season.some(season => 
        pkg.seasonality.includes(season) || pkg.seasonality.includes('year_round')
      ) ? 1 : 0;
      score += seasonScore * 0.05;
    }

    // Duration matching
    if (preferences.durationRange && pkg.duration) {
      const { min, max } = preferences.durationRange;
      if (pkg.duration >= min && pkg.duration <= max) {
        score += 0.1; // Bonus for duration match
      }
    }

    // Category-specific feature matching
    const categoryFeatures = this.getCategorySpecificFeatures(pkg.category);
    if (preferences.features && categoryFeatures.length > 0) {
      const matchingFeatures = preferences.features.filter(feature => 
        categoryFeatures.includes(feature)
      );
      const featureScore = matchingFeatures.length / categoryFeatures.length;
      score += featureScore * 0.1;
    }

    return Math.max(0, Math.min(1, score)); // Normalize to 0-1 range
  }

  /**
   * Generate reasons for recommendation
   */
  generateRecommendationReasons(pkg, preferences) {
    const reasons = [];

    // Category match
    if (preferences.categories && preferences.categories.includes(pkg.category)) {
      const categoryInfo = travelCategories.utils.getCategoryById(pkg.category);
      if (categoryInfo) {
        reasons.push(`Matches your interest in ${categoryInfo.name.en.toLowerCase()}`);
      }
    }

    // Interest match
    if (preferences.interests && pkg.interests) {
      const commonInterests = preferences.interests.filter(interest => 
        pkg.interests.includes(interest)
      );
      if (commonInterests.length > 0) {
        reasons.push(`Aligns with your interests: ${commonInterests.join(', ')}`);
      }
    }

    // Price match
    if (preferences.budgetRange) {
      const { min, max } = preferences.budgetRange;
      if (pkg.price >= min && pkg.price <= max) {
        reasons.push(`Within your budget range ($${min} - $${max})`);
      }
    }

    // High rating
    if (pkg.averageRating && pkg.averageRating >= 4.5) {
      reasons.push(`Highly rated (${pkg.averageRating}/5 stars)`);
    }

    // Difficulty match
    if (preferences.difficulty && preferences.difficulty.includes(pkg.difficulty)) {
      reasons.push(`Matches your preferred difficulty level: ${pkg.difficulty}`);
    }

    // Travel style match
    if (preferences.travelStyle && preferences.travelStyle.includes(pkg.travelStyle)) {
      reasons.push(`Suits your ${pkg.travelStyle} travel style`);
    }

    // Duration match
    if (preferences.durationRange && pkg.duration) {
      const { min, max } = preferences.durationRange;
      if (pkg.duration >= min && pkg.duration <= max) {
        reasons.push(`Perfect ${pkg.duration}-day duration`);
      }
    }

    // Age group suitability
    if (preferences.ageGroup && (preferences.ageGroup.includes(pkg.ageGroup) || pkg.ageGroup === 'all_ages')) {
      reasons.push(`Suitable for ${pkg.ageGroup.replace('_', ' ')}`);
    }

    return reasons.slice(0, 3); // Return top 3 reasons
  }

  /**
   * Get category-specific features
   */
  getCategorySpecificFeatures(category) {
    const categoryInfo = travelCategories.utils.getCategoryById(category);
    return categoryInfo ? categoryInfo.features.map(f => f.id) : [];
  }

  /**
   * Generate similar packages based on a reference package
   */
  async findSimilarPackages(referencePackageId, options = {}) {
    try {
      const { limit = 5, includeUnavailable = false } = options;

      const referencePackage = await Package.findById(referencePackageId);
      if (!referencePackage) {
        throw new Error('Reference package not found');
      }

      // Create preferences based on reference package
      const preferences = {
        categories: [referencePackage.category],
        interests: referencePackage.interests || [],
        budgetRange: {
          min: referencePackage.price * 0.7,
          max: referencePackage.price * 1.3
        },
        difficulty: [referencePackage.difficulty],
        travelStyle: [referencePackage.travelStyle],
        ageGroup: [referencePackage.ageGroup]
      };

      // Generate recommendations excluding the reference package
      const recommendations = await this.generateRecommendations(
        null,
        preferences,
        {
          limit,
          excludePackageIds: [referencePackageId],
          includeUnavailable,
          categoryBoost: { [referencePackage.category]: 0.2 }
        }
      );

      return recommendations;

    } catch (error) {
      console.error('Error finding similar packages:', error);
      throw error;
    }
  }

  /**
   * Get trending packages by category
   */
  async getTrendingPackages(category = null, options = {}) {
    try {
      const { limit = 10, days = 30 } = options;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const query = {
        availability: true,
        createdAt: { $gte: cutoffDate }
      };

      if (category) {
        query.category = category;
      }

      // Get packages with high view counts or recent bookings
      const packages = await Package.find(query)
        .sort({ viewCount: -1, createdAt: -1 })
        .limit(limit)
        .populate('createdBy', 'name')
        .lean();

      return packages.map(pkg => ({
        package: pkg,
        trendingScore: this.calculateTrendingScore(pkg),
        reasons: ['Currently trending', 'Popular choice', 'Recently added']
      }));

    } catch (error) {
      console.error('Error getting trending packages:', error);
      throw error;
    }
  }

  /**
   * Calculate trending score
   */
  calculateTrendingScore(pkg) {
    let score = 0;
    
    // View count contribution
    if (pkg.viewCount) {
      score += Math.min(pkg.viewCount / 1000, 1) * 0.4;
    }

    // Recency contribution
    const daysSinceCreation = (new Date() - new Date(pkg.createdAt)) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - (daysSinceCreation / 30));
    score += recencyScore * 0.3;

    // Rating contribution
    if (pkg.averageRating) {
      score += (pkg.averageRating / 5) * 0.3;
    }

    return score;
  }

  /**
   * Get category-specific recommendations
   */
  async getCategoryRecommendations(category, preferences = {}, options = {}) {
    try {
      const categoryInfo = travelCategories.utils.getCategoryById(category);
      if (!categoryInfo) {
        throw new Error('Invalid category');
      }

      // Enhance preferences with category-specific features
      const enhancedPreferences = {
        ...preferences,
        categories: [category],
        budgetRange: preferences.budgetRange || categoryInfo.budgetRange
      };

      // Generate recommendations with category boost
      const recommendations = await this.generateRecommendations(
        null,
        enhancedPreferences,
        {
          ...options,
          categoryBoost: { [category]: 0.3 }
        }
      );

      return {
        category: categoryInfo,
        recommendations,
        totalCount: recommendations.length
      };

    } catch (error) {
      console.error('Error getting category recommendations:', error);
      throw error;
    }
  }

  /**
   * Get seasonal recommendations
   */
  async getSeasonalRecommendations(season, options = {}) {
    try {
      const { limit = 10, includeUnavailable = false } = options;

      const query = {
        seasonality: { $in: [season, 'year_round'] }
      };

      if (!includeUnavailable) {
        query.availability = true;
      }

      const packages = await Package.find(query)
        .sort({ averageRating: -1, createdAt: -1 })
        .limit(limit)
        .populate('createdBy', 'name')
        .lean();

      return packages.map(pkg => ({
        package: pkg,
        seasonalScore: this.calculateSeasonalScore(pkg, season),
        reasons: [`Perfect for ${season}`, 'Seasonal highlight', 'Best time to visit']
      }));

    } catch (error) {
      console.error('Error getting seasonal recommendations:', error);
      throw error;
    }
  }

  /**
   * Calculate seasonal score
   */
  calculateSeasonalScore(pkg, season) {
    let score = 0.5; // Base score

    // Seasonal match
    if (pkg.seasonality && pkg.seasonality.includes(season)) {
      score += 0.3;
    }

    // Year-round availability
    if (pkg.seasonality && pkg.seasonality.includes('year_round')) {
      score += 0.1;
    }

    // Rating boost
    if (pkg.averageRating) {
      score += (pkg.averageRating / 5) * 0.2;
    }

    return score;
  }

  /**
   * Get AI-powered recommendations based on user query
   */
  async getAIRecommendations(userQuery, options = {}) {
    try {
      const { limit = 10 } = options;

      // Parse query for keywords and preferences
      const preferences = this.parseUserQuery(userQuery);

      // Generate recommendations
      const recommendations = await this.generateRecommendations(
        null,
        preferences,
        { limit }
      );

      return {
        query: userQuery,
        parsedPreferences: preferences,
        recommendations
      };

    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      throw error;
    }
  }

  /**
   * Parse user query to extract preferences
   */
  parseUserQuery(query) {
    const lowerQuery = query.toLowerCase();
    const preferences = {
      categories: [],
      interests: [],
      budgetRange: null,
      difficulty: [],
      travelStyle: [],
      ageGroup: []
    };

    // Category keywords
    const categoryKeywords = {
      adventure: ['adventure', 'hiking', 'climbing', 'extreme', 'outdoor', 'thrill'],
      luxury: ['luxury', 'premium', 'five-star', 'vip', 'exclusive', 'high-end'],
      family: ['family', 'kids', 'children', 'child-friendly', 'family-friendly'],
      cultural: ['culture', 'history', 'heritage', 'museum', 'traditional', 'local'],
      nature: ['nature', 'wildlife', 'eco', 'green', 'sustainable', 'environment'],
      business: ['business', 'corporate', 'conference', 'meeting', 'professional'],
      wellness: ['wellness', 'spa', 'yoga', 'meditation', 'health', 'relax'],
      food: ['food', 'culinary', 'cooking', 'chef', 'cuisine', 'dining'],
      photography: ['photography', 'photo', 'scenic', 'instagram', 'camera'],
      budget: ['budget', 'cheap', 'affordable', 'low-cost', 'economical']
    };

    // Extract categories
    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        preferences.categories.push(category);
      }
    });

    // Extract budget information
    const budgetMatch = lowerQuery.match(/\$(\d+)/g);
    if (budgetMatch) {
      const budgets = budgetMatch.map(b => parseInt(b.replace('$', '')));
      if (budgets.length >= 2) {
        preferences.budgetRange = {
          min: Math.min(...budgets),
          max: Math.max(...budgets)
        };
      } else {
        preferences.budgetRange = {
          min: 0,
          max: budgets[0]
        };
      }
    }

    // Extract difficulty
    if (lowerQuery.includes('easy') || lowerQuery.includes('beginner')) {
      preferences.difficulty.push('easy');
    }
    if (lowerQuery.includes('moderate') || lowerQuery.includes('intermediate')) {
      preferences.difficulty.push('moderate');
    }
    if (lowerQuery.includes('challenging') || lowerQuery.includes('difficult') || lowerQuery.includes('advanced')) {
      preferences.difficulty.push('challenging');
    }

    // Extract travel style
    if (lowerQuery.includes('relaxed') || lowerQuery.includes('slow')) {
      preferences.travelStyle.push('relaxed');
    }
    if (lowerQuery.includes('active') || lowerQuery.includes('busy')) {
      preferences.travelStyle.push('active');
    }

    // Extract age group
    if (lowerQuery.includes('senior') || lowerQuery.includes('elderly')) {
      preferences.ageGroup.push('senior_friendly');
    }
    if (lowerQuery.includes('young') || lowerQuery.includes('youth')) {
      preferences.ageGroup.push('young_adult');
    }

    return preferences;
  }
}

module.exports = new RecommendationEngine();