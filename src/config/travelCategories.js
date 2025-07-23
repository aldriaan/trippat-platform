const travelCategories = {
  adventure: {
    id: 'adventure',
    name: {
      en: 'Adventure Travel',
      ar: 'سفر المغامرة'
    },
    description: {
      en: 'Thrilling outdoor activities and extreme sports for adrenaline seekers',
      ar: 'أنشطة خارجية مثيرة ورياضات متطرفة لمحبي الأدرينالين'
    },
    icon: 'Mountain',
    color: 'bg-orange-100 text-orange-800',
    features: [
      {
        id: 'hiking',
        name: { en: 'Hiking & Trekking', ar: 'المشي والتسلق' },
        description: { en: 'Mountain trails, desert walks, and nature hikes', ar: 'مسارات جبلية ونزهات صحراوية وطبيعية' }
      },
      {
        id: 'diving',
        name: { en: 'Diving & Snorkeling', ar: 'الغوص والسباحة' },
        description: { en: 'Underwater exploration and marine adventures', ar: 'استكشاف تحت الماء ومغامرات بحرية' }
      },
      {
        id: 'climbing',
        name: { en: 'Rock Climbing', ar: 'تسلق الصخور' },
        description: { en: 'Challenging rock formations and climbing routes', ar: 'تشكيلات صخرية صعبة ومسارات تسلق' }
      },
      {
        id: 'extreme_sports',
        name: { en: 'Extreme Sports', ar: 'الرياضات المتطرفة' },
        description: { en: 'High-adrenaline activities and extreme challenges', ar: 'أنشطة عالية الأدرينالين وتحديات متطرفة' }
      },
      {
        id: 'water_sports',
        name: { en: 'Water Sports', ar: 'الرياضات المائية' },
        description: { en: 'Surfing, kayaking, and aquatic adventures', ar: 'ركوب الأمواج والتجديف ومغامرات مائية' }
      },
      {
        id: 'desert_safari',
        name: { en: 'Desert Safari', ar: 'سفاري صحراوي' },
        description: { en: 'Desert exploration and off-road adventures', ar: 'استكشاف صحراوي ومغامرات بطرق وعرة' }
      }
    ],
    targetAudience: ['young_adult', 'adult_only'],
    difficultyRange: ['moderate', 'challenging'],
    budgetRange: { min: 500, max: 3000 },
    seasonality: ['spring', 'autumn', 'winter'],
    requiredFields: ['safetyEquipment', 'expertGuides', 'medicalSupport'],
    keywords: ['adventure', 'extreme', 'outdoor', 'sports', 'thrill', 'adrenaline']
  },

  luxury: {
    id: 'luxury',
    name: {
      en: 'Luxury Travel',
      ar: 'السفر الفاخر'
    },
    description: {
      en: 'Premium experiences with 5-star accommodations and VIP services',
      ar: 'تجارب فاخرة مع إقامة 5 نجوم وخدمات كبار الشخصيات'
    },
    icon: 'Award',
    color: 'bg-purple-100 text-purple-800',
    features: [
      {
        id: 'five_star_hotel',
        name: { en: '5-Star Hotels', ar: 'فنادق 5 نجوم' },
        description: { en: 'Luxury accommodations with premium amenities', ar: 'إقامة فاخرة مع وسائل راحة فاخرة' }
      },
      {
        id: 'premium_dining',
        name: { en: 'Premium Dining', ar: 'تناول طعام فاخر' },
        description: { en: 'Gourmet restaurants and fine dining experiences', ar: 'مطاعم للذواقة وتجارب طعام راقية' }
      },
      {
        id: 'vip_services',
        name: { en: 'VIP Services', ar: 'خدمات كبار الشخصيات' },
        description: { en: 'Personalized attention and exclusive treatments', ar: 'اهتمام شخصي ومعاملات حصرية' }
      },
      {
        id: 'private_transportation',
        name: { en: 'Private Transportation', ar: 'نقل خاص' },
        description: { en: 'Luxury vehicles and private transfers', ar: 'مركبات فاخرة ونقل خاص' }
      },
      {
        id: 'personal_concierge',
        name: { en: 'Personal Concierge', ar: 'خدمة الكونسيرج الشخصية' },
        description: { en: 'Dedicated personal assistant for all needs', ar: 'مساعد شخصي مخصص لجميع الاحتياجات' }
      },
      {
        id: 'spa_services',
        name: { en: 'Spa & Wellness', ar: 'خدمات السبا والعافية' },
        description: { en: 'Luxury spa treatments and wellness programs', ar: 'علاجات سبا فاخرة وبرامج عافية' }
      }
    ],
    targetAudience: ['adult_only', 'senior_friendly'],
    difficultyRange: ['easy', 'moderate'],
    budgetRange: { min: 2000, max: 10000 },
    seasonality: ['year_round'],
    requiredFields: ['luxuryAmenities', 'premiumServices', 'exclusiveAccess'],
    keywords: ['luxury', 'premium', 'exclusive', 'VIP', 'five-star', 'gourmet']
  },

  family: {
    id: 'family',
    name: {
      en: 'Family Travel',
      ar: 'السفر العائلي'
    },
    description: {
      en: 'Kid-friendly activities and family-oriented experiences for all ages',
      ar: 'أنشطة مناسبة للأطفال وتجارب عائلية لجميع الأعمار'
    },
    icon: 'Users',
    color: 'bg-blue-100 text-blue-800',
    features: [
      {
        id: 'kid_friendly',
        name: { en: 'Kid-Friendly Activities', ar: 'أنشطة مناسبة للأطفال' },
        description: { en: 'Safe and engaging activities for children', ar: 'أنشطة آمنة وممتعة للأطفال' }
      },
      {
        id: 'family_rooms',
        name: { en: 'Family Accommodations', ar: 'إقامة عائلية' },
        description: { en: 'Spacious rooms and family-friendly facilities', ar: 'غرف واسعة ومرافق مناسبة للعائلات' }
      },
      {
        id: 'educational_activities',
        name: { en: 'Educational Experiences', ar: 'تجارب تعليمية' },
        description: { en: 'Learning opportunities for children and adults', ar: 'فرص تعليمية للأطفال والبالغين' }
      },
      {
        id: 'playground',
        name: { en: 'Play Areas', ar: 'مناطق اللعب' },
        description: { en: 'Safe play spaces for children', ar: 'مساحات لعب آمنة للأطفال' }
      },
      {
        id: 'babysitting',
        name: { en: 'Childcare Services', ar: 'خدمات رعاية الأطفال' },
        description: { en: 'Professional childcare and babysitting', ar: 'رعاية أطفال مهنية ومراقبة' }
      },
      {
        id: 'family_entertainment',
        name: { en: 'Family Entertainment', ar: 'ترفيه عائلي' },
        description: { en: 'Shows and activities for the whole family', ar: 'عروض وأنشطة للعائلة بأكملها' }
      }
    ],
    targetAudience: ['family_friendly', 'all_ages'],
    difficultyRange: ['easy', 'moderate'],
    budgetRange: { min: 800, max: 4000 },
    seasonality: ['year_round'],
    requiredFields: ['childSafety', 'familyFacilities', 'ageAppropriate'],
    keywords: ['family', 'kids', 'children', 'educational', 'safe', 'fun']
  },

  cultural: {
    id: 'cultural',
    name: {
      en: 'Cultural Travel',
      ar: 'السفر الثقافي'
    },
    description: {
      en: 'Historical sites, museums, and authentic local cultural experiences',
      ar: 'مواقع تاريخية ومتاحف وتجارب ثقافية محلية أصيلة'
    },
    icon: 'Palette',
    color: 'bg-green-100 text-green-800',
    features: [
      {
        id: 'historical_sites',
        name: { en: 'Historical Sites', ar: 'المواقع التاريخية' },
        description: { en: 'Ancient ruins, heritage sites, and historical landmarks', ar: 'آثار قديمة ومواقع تراثية ومعالم تاريخية' }
      },
      {
        id: 'museums',
        name: { en: 'Museums & Galleries', ar: 'المتاحف والمعارض' },
        description: { en: 'Art galleries, museums, and cultural exhibitions', ar: 'معارض فنية ومتاحف ومعارض ثقافية' }
      },
      {
        id: 'local_experiences',
        name: { en: 'Local Experiences', ar: 'تجارب محلية' },
        description: { en: 'Authentic cultural immersion and local traditions', ar: 'انغماس ثقافي أصيل وتقاليد محلية' }
      },
      {
        id: 'cultural_tours',
        name: { en: 'Cultural Tours', ar: 'جولات ثقافية' },
        description: { en: 'Guided tours of cultural and historical significance', ar: 'جولات مرشدة ذات أهمية ثقافية وتاريخية' }
      },
      {
        id: 'traditional_crafts',
        name: { en: 'Traditional Crafts', ar: 'الحرف التقليدية' },
        description: { en: 'Learn traditional arts and crafts', ar: 'تعلم الفنون والحرف التقليدية' }
      },
      {
        id: 'cultural_workshops',
        name: { en: 'Cultural Workshops', ar: 'ورش عمل ثقافية' },
        description: { en: 'Hands-on cultural learning experiences', ar: 'تجارب تعلم ثقافية عملية' }
      }
    ],
    targetAudience: ['all_ages', 'senior_friendly'],
    difficultyRange: ['easy', 'moderate'],
    budgetRange: { min: 400, max: 2500 },
    seasonality: ['year_round'],
    requiredFields: ['culturalGuides', 'historicalContext', 'authenticity'],
    keywords: ['culture', 'history', 'heritage', 'traditional', 'authentic', 'local']
  },

  nature: {
    id: 'nature',
    name: {
      en: 'Nature Travel',
      ar: 'السفر الطبيعي'
    },
    description: {
      en: 'National parks, wildlife viewing, and eco-friendly sustainable travel',
      ar: 'المتنزهات الوطنية ومشاهدة الحياة البرية والسفر المستدام'
    },
    icon: 'TreePine',
    color: 'bg-teal-100 text-teal-800',
    features: [
      {
        id: 'national_parks',
        name: { en: 'National Parks', ar: 'المتنزهات الوطنية' },
        description: { en: 'Protected natural areas and conservation sites', ar: 'مناطق طبيعية محمية ومواقع حفظ' }
      },
      {
        id: 'wildlife_viewing',
        name: { en: 'Wildlife Viewing', ar: 'مشاهدة الحياة البرية' },
        description: { en: 'Animal observation and nature photography', ar: 'مراقبة الحيوانات وتصوير الطبيعة' }
      },
      {
        id: 'eco_tourism',
        name: { en: 'Eco-Tourism', ar: 'السياحة البيئية' },
        description: { en: 'Environmentally responsible travel experiences', ar: 'تجارب سفر مسؤولة بيئياً' }
      },
      {
        id: 'sustainable_travel',
        name: { en: 'Sustainable Travel', ar: 'السفر المستدام' },
        description: { en: 'Low-impact, conservation-focused tourism', ar: 'سياحة قليلة التأثير وتركز على الحفظ' }
      },
      {
        id: 'bird_watching',
        name: { en: 'Bird Watching', ar: 'مراقبة الطيور' },
        description: { en: 'Guided bird watching and migration tours', ar: 'جولات مرشدة لمراقبة الطيور والهجرة' }
      },
      {
        id: 'marine_life',
        name: { en: 'Marine Life', ar: 'الحياة البحرية' },
        description: { en: 'Ocean conservation and marine ecosystems', ar: 'حفظ المحيطات والأنظمة البيئية البحرية' }
      }
    ],
    targetAudience: ['all_ages', 'young_adult'],
    difficultyRange: ['easy', 'moderate'],
    budgetRange: { min: 300, max: 2000 },
    seasonality: ['spring', 'autumn', 'winter'],
    requiredFields: ['environmentalImpact', 'conservation', 'sustainability'],
    keywords: ['nature', 'wildlife', 'eco', 'sustainable', 'conservation', 'environment']
  },

  business: {
    id: 'business',
    name: {
      en: 'Business Travel',
      ar: 'السفر التجاري'
    },
    description: {
      en: 'Corporate packages, conference venues, and business-focused amenities',
      ar: 'حزم شركات ومواقع مؤتمرات ووسائل راحة تركز على الأعمال'
    },
    icon: 'Building',
    color: 'bg-gray-100 text-gray-800',
    features: [
      {
        id: 'conference_facilities',
        name: { en: 'Conference Facilities', ar: 'مرافق المؤتمرات' },
        description: { en: 'Professional meeting rooms and event spaces', ar: 'غرف اجتماعات مهنية ومساحات فعاليات' }
      },
      {
        id: 'business_center',
        name: { en: 'Business Center', ar: 'مركز الأعمال' },
        description: { en: 'Office facilities and business services', ar: 'مرافق مكتبية وخدمات أعمال' }
      },
      {
        id: 'wifi',
        name: { en: 'High-Speed WiFi', ar: 'واي فاي عالي السرعة' },
        description: { en: 'Reliable internet connectivity for business needs', ar: 'اتصال إنترنت موثوق لاحتياجات الأعمال' }
      },
      {
        id: 'presentation_equipment',
        name: { en: 'Presentation Equipment', ar: 'معدات العرض' },
        description: { en: 'AV equipment and presentation tools', ar: 'معدات صوتية ومرئية وأدوات عرض' }
      },
      {
        id: 'corporate_rates',
        name: { en: 'Corporate Rates', ar: 'أسعار الشركات' },
        description: { en: 'Special pricing for business travelers', ar: 'أسعار خاصة للمسافرين التجاريين' }
      },
      {
        id: 'executive_lounge',
        name: { en: 'Executive Lounge', ar: 'صالة التنفيذيين' },
        description: { en: 'Premium business traveler amenities', ar: 'وسائل راحة فاخرة للمسافرين التجاريين' }
      }
    ],
    targetAudience: ['adult_only'],
    difficultyRange: ['easy'],
    budgetRange: { min: 800, max: 5000 },
    seasonality: ['year_round'],
    requiredFields: ['businessFacilities', 'professionalServices', 'connectivity'],
    keywords: ['business', 'corporate', 'conference', 'meetings', 'professional', 'executive']
  },

  wellness: {
    id: 'wellness',
    name: {
      en: 'Wellness Travel',
      ar: 'سفر العافية'
    },
    description: {
      en: 'Spa retreats, yoga programs, and health-focused wellness experiences',
      ar: 'خلوات سبا وبرامج يوغا وتجارب عافية تركز على الصحة'
    },
    icon: 'Heart',
    color: 'bg-pink-100 text-pink-800',
    features: [
      {
        id: 'spa_treatments',
        name: { en: 'Spa Treatments', ar: 'علاجات السبا' },
        description: { en: 'Therapeutic massages and wellness treatments', ar: 'مساج علاجي وعلاجات عافية' }
      },
      {
        id: 'yoga_classes',
        name: { en: 'Yoga Classes', ar: 'فصول اليوغا' },
        description: { en: 'Guided yoga sessions and mindfulness practices', ar: 'جلسات يوغا مرشدة وممارسات تركيز' }
      },
      {
        id: 'meditation',
        name: { en: 'Meditation Programs', ar: 'برامج التأمل' },
        description: { en: 'Mindfulness and meditation retreats', ar: 'خلوات تركيز وتأمل' }
      },
      {
        id: 'healthy_dining',
        name: { en: 'Healthy Dining', ar: 'تناول طعام صحي' },
        description: { en: 'Nutritious meals and dietary programs', ar: 'وجبات مغذية وبرامج غذائية' }
      },
      {
        id: 'fitness_center',
        name: { en: 'Fitness Center', ar: 'مركز اللياقة البدنية' },
        description: { en: 'Modern gym facilities and personal training', ar: 'مرافق نادي رياضي حديثة وتدريب شخصي' }
      },
      {
        id: 'detox_programs',
        name: { en: 'Detox Programs', ar: 'برامج التطهير' },
        description: { en: 'Body cleansing and detoxification programs', ar: 'برامج تطهير الجسم والتخلص من السموم' }
      }
    ],
    targetAudience: ['adult_only', 'senior_friendly'],
    difficultyRange: ['easy', 'moderate'],
    budgetRange: { min: 1000, max: 4000 },
    seasonality: ['year_round'],
    requiredFields: ['wellnessPrograms', 'healthFacilities', 'therapeuticServices'],
    keywords: ['wellness', 'spa', 'yoga', 'meditation', 'health', 'relaxation']
  },

  food: {
    id: 'food',
    name: {
      en: 'Food Travel',
      ar: 'سفر الطعام'
    },
    description: {
      en: 'Culinary tours, cooking classes, and authentic local cuisine experiences',
      ar: 'جولات طهي وفصول طبخ وتجارب مطبخ محلي أصيل'
    },
    icon: 'Utensils',
    color: 'bg-red-100 text-red-800',
    features: [
      {
        id: 'culinary_tours',
        name: { en: 'Culinary Tours', ar: 'جولات طهي' },
        description: { en: 'Guided food tours and restaurant experiences', ar: 'جولات طعام مرشدة وتجارب مطاعم' }
      },
      {
        id: 'cooking_classes',
        name: { en: 'Cooking Classes', ar: 'فصول الطبخ' },
        description: { en: 'Learn to cook local dishes with expert chefs', ar: 'تعلم طبخ الأطباق المحلية مع طهاة خبراء' }
      },
      {
        id: 'local_cuisine',
        name: { en: 'Local Cuisine', ar: 'المطبخ المحلي' },
        description: { en: 'Authentic traditional dishes and flavors', ar: 'أطباق تقليدية أصيلة ونكهات' }
      },
      {
        id: 'food_markets',
        name: { en: 'Food Markets', ar: 'أسواق الطعام' },
        description: { en: 'Local markets and street food experiences', ar: 'أسواق محلية وتجارب طعام الشارع' }
      },
      {
        id: 'chef_experiences',
        name: { en: 'Chef Experiences', ar: 'تجارب الطهاة' },
        description: { en: 'Meet local chefs and learn culinary secrets', ar: 'لقاء طهاة محليين وتعلم أسرار الطبخ' }
      },
      {
        id: 'farm_to_table',
        name: { en: 'Farm-to-Table', ar: 'من المزرعة إلى المائدة' },
        description: { en: 'Fresh ingredients and sustainable dining', ar: 'مكونات طازجة وتناول طعام مستدام' }
      }
    ],
    targetAudience: ['all_ages', 'adult_only'],
    difficultyRange: ['easy', 'moderate'],
    budgetRange: { min: 600, max: 3000 },
    seasonality: ['year_round'],
    requiredFields: ['culinaryExperts', 'foodSafety', 'dietaryAccommodations'],
    keywords: ['food', 'culinary', 'cooking', 'cuisine', 'chef', 'dining']
  },

  photography: {
    id: 'photography',
    name: {
      en: 'Photography Travel',
      ar: 'سفر التصوير'
    },
    description: {
      en: 'Scenic routes, photography workshops, and Instagram-worthy destinations',
      ar: 'طرق ذات مناظر خلابة وورش تصوير ووجهات تستحق الإنستقرام'
    },
    icon: 'Camera',
    color: 'bg-indigo-100 text-indigo-800',
    features: [
      {
        id: 'scenic_routes',
        name: { en: 'Scenic Routes', ar: 'طرق ذات مناظر خلابة' },
        description: { en: 'Beautiful landscapes and photogenic locations', ar: 'مناظر طبيعية جميلة ومواقع فوتوغرافية' }
      },
      {
        id: 'photography_workshops',
        name: { en: 'Photography Workshops', ar: 'ورش تصوير' },
        description: { en: 'Professional photography instruction and guidance', ar: 'تعليم وإرشاد تصوير مهني' }
      },
      {
        id: 'instagram_spots',
        name: { en: 'Instagram Spots', ar: 'نقاط إنستقرام' },
        description: { en: 'Perfect locations for social media content', ar: 'مواقع مثالية لمحتوى وسائل التواصل الاجتماعي' }
      },
      {
        id: 'golden_hour_locations',
        name: { en: 'Golden Hour Locations', ar: 'مواقع الساعة الذهبية' },
        description: { en: 'Best spots for sunrise and sunset photography', ar: 'أفضل نقاط لتصوير الشروق والغروب' }
      },
      {
        id: 'landscape_photography',
        name: { en: 'Landscape Photography', ar: 'تصوير المناظر الطبيعية' },
        description: { en: 'Capture stunning natural landscapes', ar: 'التقاط مناظر طبيعية خلابة' }
      },
      {
        id: 'night_photography',
        name: { en: 'Night Photography', ar: 'التصوير الليلي' },
        description: { en: 'Stars, city lights, and night scenes', ar: 'النجوم وأضواء المدينة والمشاهد الليلية' }
      }
    ],
    targetAudience: ['young_adult', 'adult_only'],
    difficultyRange: ['easy', 'moderate'],
    budgetRange: { min: 700, max: 2500 },
    seasonality: ['year_round'],
    requiredFields: ['photographyExperts', 'equipmentSupport', 'scenicAccess'],
    keywords: ['photography', 'scenic', 'instagram', 'landscape', 'workshop', 'camera']
  },

  budget: {
    id: 'budget',
    name: {
      en: 'Budget Travel',
      ar: 'السفر الاقتصادي'
    },
    description: {
      en: 'Affordable options, backpacking adventures, and budget-friendly activities',
      ar: 'خيارات ميسورة التكلفة ومغامرات الحقائب الظهر وأنشطة اقتصادية'
    },
    icon: 'DollarSign',
    color: 'bg-yellow-100 text-yellow-800',
    features: [
      {
        id: 'affordable_accommodation',
        name: { en: 'Affordable Accommodation', ar: 'إقامة ميسورة التكلفة' },
        description: { en: 'Budget hotels, hostels, and guesthouses', ar: 'فنادق اقتصادية ونزل وبيوت ضيافة' }
      },
      {
        id: 'budget_dining',
        name: { en: 'Budget Dining', ar: 'تناول طعام اقتصادي' },
        description: { en: 'Local eateries and affordable meal options', ar: 'مطاعم محلية وخيارات وجبات ميسورة التكلفة' }
      },
      {
        id: 'free_activities',
        name: { en: 'Free Activities', ar: 'أنشطة مجانية' },
        description: { en: 'No-cost attractions and experiences', ar: 'معالم وتجارب بدون تكلفة' }
      },
      {
        id: 'public_transportation',
        name: { en: 'Public Transportation', ar: 'النقل العام' },
        description: { en: 'Affordable local transport options', ar: 'خيارات نقل محلية ميسورة التكلفة' }
      },
      {
        id: 'group_discounts',
        name: { en: 'Group Discounts', ar: 'خصومات جماعية' },
        description: { en: 'Special rates for group bookings', ar: 'أسعار خاصة للحجوزات الجماعية' }
      },
      {
        id: 'backpacking_friendly',
        name: { en: 'Backpacking Friendly', ar: 'صديق للحقائب الظهر' },
        description: { en: 'Suitable for independent travelers', ar: 'مناسب للمسافرين المستقلين' }
      }
    ],
    targetAudience: ['young_adult', 'adult_only'],
    difficultyRange: ['easy', 'moderate'],
    budgetRange: { min: 200, max: 1000 },
    seasonality: ['year_round'],
    requiredFields: ['budgetBreakdown', 'valueForMoney', 'costSavings'],
    keywords: ['budget', 'affordable', 'cheap', 'backpacking', 'value', 'savings']
  }
};

// Helper functions for category management
travelCategories.utils = {
  // Get all categories
  getAllCategories: function() {
    return Object.values(this).filter(item => typeof item === 'object' && item.id);
  },

  // Get category by ID
  getCategoryById: function(id) {
    return this[id] || null;
  },

  // Get categories by target audience
  getCategoriesByAudience: function(audience) {
    return this.getAllCategories().filter(category => 
      category.targetAudience.includes(audience)
    );
  },

  // Get categories by budget range
  getCategoriesByBudget: function(minBudget, maxBudget) {
    return this.getAllCategories().filter(category => 
      category.budgetRange.min <= maxBudget && category.budgetRange.max >= minBudget
    );
  },

  // Get categories by season
  getCategoriesBySeason: function(season) {
    return this.getAllCategories().filter(category => 
      category.seasonality.includes(season) || category.seasonality.includes('year_round')
    );
  },

  // Get localized category name
  getCategoryName: function(categoryId, language = 'en') {
    const category = this.getCategoryById(categoryId);
    return category ? category.name[language] : null;
  },

  // Get localized category description
  getCategoryDescription: function(categoryId, language = 'en') {
    const category = this.getCategoryById(categoryId);
    return category ? category.description[language] : null;
  },

  // Get category features
  getCategoryFeatures: function(categoryId, language = 'en') {
    const category = this.getCategoryById(categoryId);
    if (!category) return [];
    
    return category.features.map(feature => ({
      id: feature.id,
      name: feature.name[language],
      description: feature.description[language]
    }));
  },

  // Validate category data
  validateCategoryData: function(categoryId, packageData) {
    const category = this.getCategoryById(categoryId);
    if (!category) return { valid: false, errors: ['Invalid category'] };

    const errors = [];
    
    // Check required fields
    category.requiredFields.forEach(field => {
      if (!packageData[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Check budget range
    if (packageData.price < category.budgetRange.min) {
      errors.push(`Price below minimum for ${categoryId} category`);
    }
    if (packageData.price > category.budgetRange.max) {
      errors.push(`Price above maximum for ${categoryId} category`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};

module.exports = travelCategories;