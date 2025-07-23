const travelCategories = require('../config/travelCategories');

/**
 * Category-specific content templates for package creation
 */
class CategoryTemplates {
  constructor() {
    this.templates = this.initializeTemplates();
  }

  initializeTemplates() {
    return {
      adventure: {
        title: {
          templates: [
            '{destination} Adventure Explorer',
            'Extreme {destination} Experience',
            'Thrilling {destination} Adventure',
            'Ultimate {destination} Challenge',
            'Adrenaline Rush in {destination}'
          ],
          placeholders: {
            destination: 'Location name'
          }
        },
        description: {
          templates: [
            'Embark on an unforgettable adventure in {destination}. This {duration}-day experience offers {activities} with expert guides and top-quality equipment. Perfect for thrill-seekers looking for their next adrenaline fix.',
            'Challenge yourself with our {destination} adventure package. Over {duration} days, you\'ll experience {activities} while exploring some of the most breathtaking landscapes. All skill levels welcome with professional instruction.',
            'Discover the wild side of {destination} with our action-packed {duration}-day adventure. From {activities}, this package is designed for those who crave excitement and want to push their limits.'
          ],
          placeholders: {
            destination: 'Location name',
            duration: 'Trip duration',
            activities: 'List of adventure activities'
          }
        },
        highlights: [
          'Professional adventure guides',
          'All safety equipment included',
          'Small group sizes (max 8 people)',
          'Emergency medical support',
          'Certificate of completion',
          'Action photography included'
        ],
        inclusions: [
          'Professional guide and instructor',
          'All safety equipment and gear',
          'Emergency first aid kit',
          'Adventure activity permits',
          'Group photos and videos',
          'Welcome and farewell dinner'
        ],
        exclusions: [
          'Personal travel insurance',
          'Alcoholic beverages',
          'Personal adventure gear',
          'Gratuities for guides',
          'Medical expenses',
          'Flight tickets'
        ],
        itinerary: {
          templates: {
            day1: {
              title: 'Arrival and Orientation',
              description: 'Welcome to {destination}! Meet your adventure team and get briefed on safety procedures. Equipment check and first activity orientation.',
              activities: [
                'Airport pickup and transfer',
                'Welcome meeting with guides',
                'Safety briefing and equipment fitting',
                'Team building activities',
                'Welcome dinner'
              ]
            },
            day2: {
              title: 'First Adventure Challenge',
              description: 'Begin your adventure with {activity1}. Learn basic techniques and safety protocols while enjoying the stunning scenery.',
              activities: [
                'Early morning preparation',
                'Basic training session',
                'First adventure activity',
                'Lunch in nature',
                'Evening reflection and planning'
              ]
            },
            day3: {
              title: 'Intermediate Level Activities',
              description: 'Step up the challenge with {activity2}. Build confidence and skills with increasingly exciting experiences.',
              activities: [
                'Advanced technique training',
                'Challenging activity session',
                'Navigation and survival skills',
                'Outdoor lunch',
                'Evening campfire and stories'
              ]
            },
            final: {
              title: 'Grand Finale and Departure',
              description: 'Complete your adventure with the ultimate challenge. Celebration ceremony and departure preparations.',
              activities: [
                'Final challenge activity',
                'Achievement ceremony',
                'Group photo session',
                'Farewell lunch',
                'Airport transfer'
              ]
            }
          }
        },
        requiredFeatures: ['hiking', 'climbing', 'extreme_sports', 'outdoor_activities'],
        suggestedDifficulty: 'moderate',
        recommendedDuration: { min: 3, max: 7 },
        targetAudience: ['young_adult', 'adult_only']
      },

      luxury: {
        title: {
          templates: [
            'Luxury {destination} Retreat',
            'Premium {destination} Experience',
            'Exclusive {destination} Escape',
            'Five-Star {destination} Journey',
            'Opulent {destination} Adventure'
          ]
        },
        description: {
          templates: [
            'Indulge in the ultimate luxury experience in {destination}. This {duration}-day retreat offers {amenities} with personalized service and exclusive access. Every detail has been crafted for the discerning traveler.',
            'Experience {destination} like never before with our premium {duration}-day package. Enjoy {amenities} while staying in the finest accommodations with dedicated concierge service.',
            'Escape to {destination} for a {duration}-day luxury journey. From {amenities}, this exclusive package provides unparalleled comfort and sophistication.'
          ],
          placeholders: {
            destination: 'Location name',
            duration: 'Trip duration',
            amenities: 'List of luxury amenities'
          }
        },
        highlights: [
          'Five-star luxury accommodations',
          'Personal concierge service',
          'Private transportation',
          'Exclusive access to VIP areas',
          'Gourmet dining experiences',
          'Spa and wellness treatments'
        ],
        inclusions: [
          'Luxury accommodation',
          'All meals at premium restaurants',
          'Private transportation',
          'Personal concierge service',
          'VIP access and experiences',
          'Spa treatments and wellness'
        ],
        exclusions: [
          'International flights',
          'Personal shopping expenses',
          'Premium alcoholic beverages',
          'Extended spa treatments',
          'Personal butler service',
          'Travel insurance'
        ],
        itinerary: {
          templates: {
            day1: {
              title: 'Luxury Arrival Experience',
              description: 'VIP arrival in {destination} with private transfer to your luxury accommodation. Welcome reception and personalized service introduction.',
              activities: [
                'Private airport transfer',
                'Luxury suite check-in',
                'Welcome champagne reception',
                'Personalized itinerary briefing',
                'Fine dining welcome dinner'
              ]
            },
            day2: {
              title: 'Exclusive Cultural Immersion',
              description: 'Private cultural tour with expert guide. VIP access to exclusive venues and personalized experiences.',
              activities: [
                'Private cultural tour',
                'VIP museum access',
                'Exclusive venue visits',
                'Gourmet lunch experience',
                'Luxury spa session'
              ]
            },
            day3: {
              title: 'Premium Leisure Day',
              description: 'Enjoy leisure time with premium amenities. Optional activities with personal guide and luxury transportation.',
              activities: [
                'Luxury spa morning',
                'Private shopping experience',
                'Exclusive dining venue',
                'VIP entertainment access',
                'Premium leisure activities'
              ]
            },
            final: {
              title: 'Farewell Luxury Experience',
              description: 'Final luxury experiences and VIP departure. Personalized farewell and premium transfer service.',
              activities: [
                'Final luxury breakfast',
                'Personalized farewell gift',
                'VIP departure lounge',
                'Private airport transfer',
                'Concierge follow-up service'
              ]
            }
          }
        },
        requiredFeatures: ['five_star_hotel', 'premium_dining', 'vip_services', 'private_transportation'],
        suggestedDifficulty: 'easy',
        recommendedDuration: { min: 4, max: 10 },
        targetAudience: ['adult_only', 'senior_friendly']
      },

      family: {
        title: {
          templates: [
            'Family Fun in {destination}',
            '{destination} Family Adventure',
            'Family-Friendly {destination} Experience',
            'Ultimate {destination} Family Vacation',
            'Family Discovery in {destination}'
          ]
        },
        description: {
          templates: [
            'Create lasting memories with your family in {destination}. This {duration}-day package offers {activities} designed for all ages. Kid-friendly accommodations and activities ensure everyone has a great time.',
            'Bring the whole family to {destination} for {duration} days of fun and adventure. With {activities} and family-focused amenities, this package is perfect for creating unforgettable family moments.',
            'Discover {destination} together as a family with our {duration}-day experience. From {activities}, every member of your family will find something to enjoy.'
          ],
          placeholders: {
            destination: 'Location name',
            duration: 'Trip duration',
            activities: 'List of family activities'
          }
        },
        highlights: [
          'Kid-friendly accommodations',
          'Family-oriented activities',
          'Educational experiences',
          'Safe and supervised environment',
          'Flexible scheduling',
          'Family photo sessions'
        ],
        inclusions: [
          'Family rooms and accommodations',
          'Kid-friendly meals and snacks',
          'Educational activity programs',
          'Family entertainment',
          'Safety equipment for children',
          'Professional family guides'
        ],
        exclusions: [
          'Baby formula and diapers',
          'Childcare services',
          'Personal family expenses',
          'Extended babysitting',
          'Travel insurance for children',
          'Flight tickets'
        ],
        itinerary: {
          templates: {
            day1: {
              title: 'Family Welcome Day',
              description: 'Arrival in {destination} with family-friendly check-in. Introduction to family activities and kid-friendly orientation.',
              activities: [
                'Family airport pickup',
                'Kid-friendly accommodation check-in',
                'Family welcome activities',
                'Children\'s orientation program',
                'Family dinner and games'
              ]
            },
            day2: {
              title: 'Educational Family Adventure',
              description: 'Family-friendly educational activities. Interactive experiences designed for both children and adults.',
              activities: [
                'Interactive educational tour',
                'Hands-on learning activities',
                'Family-friendly museum visit',
                'Educational games and puzzles',
                'Family bonding activities'
              ]
            },
            day3: {
              title: 'Fun and Recreation Day',
              description: 'Active family day with recreational activities. Safe and supervised fun for all family members.',
              activities: [
                'Family recreational activities',
                'Playground and play areas',
                'Family sports and games',
                'Creative arts and crafts',
                'Family entertainment show'
              ]
            },
            final: {
              title: 'Family Farewell',
              description: 'Final family activities and memory-making moments. Family photo session and departure.',
              activities: [
                'Family memory book creation',
                'Final family photo session',
                'Farewell family meal',
                'Gift exchange and souvenirs',
                'Family airport departure'
              ]
            }
          }
        },
        requiredFeatures: ['kid_friendly', 'family_rooms', 'educational_activities', 'family_entertainment'],
        suggestedDifficulty: 'easy',
        recommendedDuration: { min: 3, max: 8 },
        targetAudience: ['family_friendly', 'all_ages']
      },

      cultural: {
        title: {
          templates: [
            'Cultural Journey Through {destination}',
            'Heritage Discovery in {destination}',
            '{destination} Cultural Immersion',
            'Traditional {destination} Experience',
            'Cultural Treasures of {destination}'
          ]
        },
        description: {
          templates: [
            'Immerse yourself in the rich culture of {destination} with our {duration}-day cultural journey. Explore {sites} and experience authentic local traditions with expert cultural guides.',
            'Discover the cultural heritage of {destination} through our carefully curated {duration}-day experience. From {sites}, this package offers deep cultural insights and authentic experiences.',
            'Experience the authentic culture of {destination} with our comprehensive {duration}-day program. Visit {sites} and participate in traditional activities with local experts.'
          ],
          placeholders: {
            destination: 'Location name',
            duration: 'Trip duration',
            sites: 'List of cultural sites'
          }
        },
        highlights: [
          'Expert cultural guides',
          'Authentic local experiences',
          'Historical site visits',
          'Traditional craft workshops',
          'Cultural performances',
          'Local cuisine tastings'
        ],
        inclusions: [
          'Expert cultural guide',
          'Museum and site entrance fees',
          'Traditional craft workshops',
          'Cultural performance tickets',
          'Local cuisine experiences',
          'Cultural artifact demonstrations'
        ],
        exclusions: [
          'Personal purchases at markets',
          'Additional museum audio guides',
          'Private cultural tours',
          'Traditional costume rentals',
          'Photography permits',
          'Travel insurance'
        ],
        itinerary: {
          templates: {
            day1: {
              title: 'Cultural Introduction',
              description: 'Introduction to {destination} culture with expert guide. Overview of history and cultural significance.',
              activities: [
                'Cultural orientation session',
                'Historical overview presentation',
                'Local customs introduction',
                'Traditional welcome ceremony',
                'Cultural dinner experience'
              ]
            },
            day2: {
              title: 'Historical Sites Exploration',
              description: 'Visit major historical sites and monuments. Learn about the region\'s history and architectural heritage.',
              activities: [
                'Historical site visits',
                'Architecture appreciation tour',
                'Museum exhibitions',
                'Archaeological site exploration',
                'Historical storytelling session'
              ]
            },
            day3: {
              title: 'Traditional Arts and Crafts',
              description: 'Hands-on experience with traditional arts and crafts. Meet local artisans and learn traditional techniques.',
              activities: [
                'Traditional craft workshops',
                'Artisan studio visits',
                'Hands-on craft creation',
                'Cultural market exploration',
                'Traditional art demonstration'
              ]
            },
            final: {
              title: 'Cultural Celebration',
              description: 'Participate in cultural celebration and farewell ceremony. Cultural reflection and souvenir shopping.',
              activities: [
                'Cultural celebration event',
                'Traditional farewell ceremony',
                'Cultural souvenir shopping',
                'Final cultural discussion',
                'Cultural memory sharing'
              ]
            }
          }
        },
        requiredFeatures: ['historical_sites', 'museums', 'cultural_tours', 'traditional_crafts'],
        suggestedDifficulty: 'easy',
        recommendedDuration: { min: 4, max: 7 },
        targetAudience: ['all_ages', 'senior_friendly']
      },

      // Add more category templates...
      nature: {
        title: {
          templates: [
            'Nature Escape to {destination}',
            'Wildlife Discovery in {destination}',
            'Eco-Adventure in {destination}',
            'Natural Wonders of {destination}',
            'Sustainable {destination} Experience'
          ]
        },
        description: {
          templates: [
            'Connect with nature in {destination} through our sustainable {duration}-day eco-adventure. Experience {activities} while supporting local conservation efforts.',
            'Discover the natural beauty of {destination} with our {duration}-day wildlife and nature program. From {activities}, this eco-friendly package promotes sustainable tourism.',
            'Immerse yourself in the pristine nature of {destination} with our {duration}-day conservation-focused experience. Enjoy {activities} while learning about environmental protection.'
          ]
        },
        highlights: [
          'Expert naturalist guides',
          'Sustainable tourism practices',
          'Wildlife viewing opportunities',
          'Conservation education',
          'Eco-friendly accommodations',
          'Nature photography sessions'
        ],
        requiredFeatures: ['national_parks', 'wildlife_viewing', 'eco_tourism', 'sustainable_travel'],
        suggestedDifficulty: 'easy',
        recommendedDuration: { min: 3, max: 6 },
        targetAudience: ['all_ages', 'young_adult']
      }
    };
  }

  /**
   * Get template for specific category
   */
  getTemplate(category) {
    return this.templates[category] || null;
  }

  /**
   * Generate content based on template and parameters
   */
  generateContent(category, parameters = {}) {
    const template = this.getTemplate(category);
    if (!template) {
      throw new Error(`No template found for category: ${category}`);
    }

    const content = {
      title: this.generateTitle(template.title, parameters),
      description: this.generateDescription(template.description, parameters),
      highlights: template.highlights || [],
      inclusions: template.inclusions || [],
      exclusions: template.exclusions || [],
      itinerary: this.generateItinerary(template.itinerary, parameters),
      suggestedFeatures: template.requiredFeatures || [],
      suggestedDifficulty: template.suggestedDifficulty || 'moderate',
      recommendedDuration: template.recommendedDuration || { min: 3, max: 7 },
      targetAudience: template.targetAudience || ['all_ages']
    };

    return content;
  }

  /**
   * Generate title from template
   */
  generateTitle(titleTemplate, parameters) {
    if (!titleTemplate || !titleTemplate.templates) {
      return 'Travel Package';
    }

    const randomTemplate = titleTemplate.templates[
      Math.floor(Math.random() * titleTemplate.templates.length)
    ];

    return this.replacePlaceholders(randomTemplate, parameters);
  }

  /**
   * Generate description from template
   */
  generateDescription(descriptionTemplate, parameters) {
    if (!descriptionTemplate || !descriptionTemplate.templates) {
      return 'Experience an amazing travel adventure.';
    }

    const randomTemplate = descriptionTemplate.templates[
      Math.floor(Math.random() * descriptionTemplate.templates.length)
    ];

    return this.replacePlaceholders(randomTemplate, parameters);
  }

  /**
   * Generate itinerary from template
   */
  generateItinerary(itineraryTemplate, parameters) {
    if (!itineraryTemplate || !itineraryTemplate.templates) {
      return [];
    }

    const templates = itineraryTemplate.templates;
    const duration = parameters.duration || 3;
    const itinerary = [];

    // Add day 1
    if (templates.day1) {
      itinerary.push({
        day: 1,
        title: this.replacePlaceholders(templates.day1.title, parameters),
        description: this.replacePlaceholders(templates.day1.description, parameters),
        activities: templates.day1.activities || []
      });
    }

    // Add middle days
    for (let day = 2; day < duration; day++) {
      const dayTemplate = templates[`day${day}`] || templates.day2 || templates.day3;
      if (dayTemplate) {
        itinerary.push({
          day,
          title: this.replacePlaceholders(dayTemplate.title, parameters),
          description: this.replacePlaceholders(dayTemplate.description, parameters),
          activities: dayTemplate.activities || []
        });
      }
    }

    // Add final day
    if (templates.final && duration > 1) {
      itinerary.push({
        day: duration,
        title: this.replacePlaceholders(templates.final.title, parameters),
        description: this.replacePlaceholders(templates.final.description, parameters),
        activities: templates.final.activities || []
      });
    }

    return itinerary;
  }

  /**
   * Replace placeholders in template string
   */
  replacePlaceholders(template, parameters) {
    let result = template;
    
    // Replace common placeholders
    Object.entries(parameters).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    });

    // Clean up any remaining placeholders
    result = result.replace(/\{[^}]+\}/g, '');
    
    return result.trim();
  }

  /**
   * Get all available categories
   */
  getAvailableCategories() {
    return Object.keys(this.templates);
  }

  /**
   * Get category-specific suggestions
   */
  getCategorySuggestions(category) {
    const template = this.getTemplate(category);
    if (!template) {
      return null;
    }

    const categoryInfo = travelCategories.utils.getCategoryById(category);
    
    return {
      category: category,
      name: categoryInfo?.name || category,
      description: categoryInfo?.description || '',
      suggestedFeatures: template.requiredFeatures || [],
      suggestedDifficulty: template.suggestedDifficulty || 'moderate',
      recommendedDuration: template.recommendedDuration || { min: 3, max: 7 },
      targetAudience: template.targetAudience || ['all_ages'],
      sampleHighlights: template.highlights || [],
      sampleInclusions: template.inclusions || [],
      sampleExclusions: template.exclusions || [],
      budgetRange: categoryInfo?.budgetRange || { min: 500, max: 3000 }
    };
  }

  /**
   * Generate package suggestions based on category and constraints
   */
  generatePackageSuggestions(category, constraints = {}) {
    const template = this.getTemplate(category);
    if (!template) {
      return null;
    }

    const {
      destination = 'Amazing Destination',
      duration = 5,
      budget = 1500,
      interests = [],
      targetAudience = 'all_ages'
    } = constraints;

    // Generate multiple suggestions
    const suggestions = [];
    
    for (let i = 0; i < 3; i++) {
      const parameters = {
        destination,
        duration,
        budget,
        activities: this.generateActivitiesForCategory(category, interests),
        amenities: this.generateAmenitiesForCategory(category, budget),
        sites: this.generateSitesForCategory(category, destination)
      };

      suggestions.push(this.generateContent(category, parameters));
    }

    return suggestions;
  }

  /**
   * Generate activities based on category and interests
   */
  generateActivitiesForCategory(category, interests = []) {
    const categoryFeatures = travelCategories.utils.getCategoryFeatures(category);
    const activities = [];

    // Add category-specific activities
    categoryFeatures.forEach(feature => {
      activities.push(feature.name.en);
    });

    // Add interest-based activities
    interests.forEach(interest => {
      switch (interest) {
        case 'photography':
          activities.push('photography workshops', 'scenic photo tours');
          break;
        case 'food':
          activities.push('culinary experiences', 'local cuisine tastings');
          break;
        case 'culture':
          activities.push('cultural immersion', 'traditional performances');
          break;
        case 'nature':
          activities.push('nature walks', 'wildlife observation');
          break;
      }
    });

    return activities.slice(0, 5).join(', ');
  }

  /**
   * Generate amenities based on category and budget
   */
  generateAmenitiesForCategory(category, budget = 1500) {
    const amenities = [];

    if (category === 'luxury' || budget > 3000) {
      amenities.push('luxury accommodations', 'private transportation', 'concierge service');
    } else if (category === 'budget' || budget < 800) {
      amenities.push('comfortable accommodations', 'shared transportation', 'group activities');
    } else {
      amenities.push('quality accommodations', 'comfortable transportation', 'guided activities');
    }

    return amenities.join(', ');
  }

  /**
   * Generate sites based on category and destination
   */
  generateSitesForCategory(category, destination) {
    const sites = [];

    switch (category) {
      case 'cultural':
        sites.push('historical museums', 'heritage sites', 'cultural centers');
        break;
      case 'nature':
        sites.push('national parks', 'wildlife reserves', 'natural landmarks');
        break;
      case 'adventure':
        sites.push('outdoor adventure parks', 'extreme sports venues', 'natural challenges');
        break;
      case 'luxury':
        sites.push('exclusive resorts', 'premium venues', 'VIP attractions');
        break;
      default:
        sites.push('popular attractions', 'local landmarks', 'scenic locations');
    }

    return sites.join(', ');
  }
}

module.exports = new CategoryTemplates();