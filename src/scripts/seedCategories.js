const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trippat', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const categoriesData = [
  {
    name: {
      en: 'Adventure Travel',
      ar: 'سفر المغامرة'
    },
    description: {
      en: 'Thrilling outdoor activities and extreme adventures for adrenaline seekers',
      ar: 'أنشطة خارجية مثيرة ومغامرات متطرفة لمحبي الأدرينالين'
    },
    slug: 'adventure-travel',
    icon: 'Mountain',
    color: '#F97316',
    status: 'active',
    order: 1,
    packageCategory: 'adventure',
    seo: {
      metaTitle: {
        en: 'Adventure Travel Packages | Extreme Sports & Outdoor Adventures',
        ar: 'حزم سفر المغامرة | الرياضات المتطرفة والمغامرات الخارجية'
      },
      metaDescription: {
        en: 'Discover exciting adventure travel packages with extreme sports, hiking, and outdoor activities',
        ar: 'اكتشف حزم سفر المغامرة المثيرة مع الرياضات المتطرفة والمشي لمسافات طويلة والأنشطة الخارجية'
      },
      keywords: ['adventure', 'travel', 'extreme sports', 'hiking', 'outdoor activities', 'مغامرة', 'سفر', 'رياضات متطرفة']
    }
  },
  {
    name: {
      en: 'Luxury Travel',
      ar: 'السفر الفاخر'
    },
    description: {
      en: 'Premium luxury experiences with 5-star accommodations and exclusive services',
      ar: 'تجارب فاخرة متميزة مع إقامة 5 نجوم وخدمات حصرية'
    },
    slug: 'luxury-travel',
    icon: 'Star',
    color: '#8B5CF6',
    status: 'active',
    order: 2,
    packageCategory: 'luxury',
    seo: {
      metaTitle: {
        en: 'Luxury Travel Packages | 5-Star Hotels & Premium Experiences',
        ar: 'حزم السفر الفاخر | فنادق 5 نجوم وتجارب متميزة'
      },
      metaDescription: {
        en: 'Experience premium luxury travel with 5-star hotels, exclusive services, and VIP treatment',
        ar: 'استمتع بسفر فاخر متميز مع فنادق 5 نجوم وخدمات حصرية ومعاملة VIP'
      },
      keywords: ['luxury', 'premium', 'exclusive', 'VIP', '5-star', 'فاخر', 'متميز', 'حصري', 'خمس نجوم']
    }
  },
  {
    name: {
      en: 'Family Travel',
      ar: 'السفر العائلي'
    },
    description: {
      en: 'Perfect family vacation packages with kid-friendly activities and family experiences',
      ar: 'حزم إجازة عائلية مثالية مع أنشطة مناسبة للأطفال وتجارب عائلية'
    },
    slug: 'family-travel',
    icon: 'Users',
    color: '#3B82F6',
    status: 'active',
    order: 3,
    packageCategory: 'family',
    seo: {
      metaTitle: {
        en: 'Family Travel Packages | Kid-Friendly Vacations & Family Activities',
        ar: 'حزم السفر العائلي | إجازات مناسبة للأطفال وأنشطة عائلية'
      },
      metaDescription: {
        en: 'Book family-friendly travel packages with activities for kids and memorable family experiences',
        ar: 'احجز حزم سفر مناسبة للعائلة مع أنشطة للأطفال وتجارب عائلية لا تُنسى'
      },
      keywords: ['family', 'kids', 'children', 'vacation', 'family-friendly', 'عائلي', 'أطفال', 'إجازة', 'مناسب للعائلة']
    }
  },
  {
    name: {
      en: 'Cultural Heritage',
      ar: 'التراث الثقافي'
    },
    description: {
      en: 'Immersive cultural experiences with historical sites and local traditions',
      ar: 'تجارب ثقافية غامرة مع المواقع التاريخية والتقاليد المحلية'
    },
    slug: 'cultural-heritage',
    icon: 'Building',
    color: '#D97706',
    status: 'active',
    order: 4,
    packageCategory: 'cultural',
    seo: {
      metaTitle: {
        en: 'Cultural Heritage Tours | Historical Sites & Local Traditions',
        ar: 'جولات التراث الثقافي | المواقع التاريخية والتقاليد المحلية'
      },
      metaDescription: {
        en: 'Explore rich cultural heritage with guided tours to historical sites and authentic local experiences',
        ar: 'استكشف التراث الثقافي الغني مع جولات مرشدة للمواقع التاريخية والتجارب المحلية الأصيلة'
      },
      keywords: ['cultural', 'heritage', 'historical', 'traditions', 'local culture', 'ثقافي', 'تراث', 'تاريخي', 'تقاليد']
    }
  },
  {
    name: {
      en: 'Nature & Wildlife',
      ar: 'الطبيعة والحياة البرية'
    },
    description: {
      en: 'Explore pristine natural environments and diverse wildlife in national parks',
      ar: 'استكشف البيئات الطبيعية البكر والحياة البرية المتنوعة في المتنزهات الوطنية'
    },
    slug: 'nature-wildlife',
    icon: 'TreePine',
    color: '#10B981',
    status: 'active',
    order: 5,
    packageCategory: 'nature',
    seo: {
      metaTitle: {
        en: 'Nature & Wildlife Tours | National Parks & Eco-Tourism',
        ar: 'جولات الطبيعة والحياة البرية | المتنزهات الوطنية والسياحة البيئية'
      },
      metaDescription: {
        en: 'Discover amazing wildlife and pristine nature with eco-friendly tours and national park visits',
        ar: 'اكتشف الحياة البرية المذهلة والطبيعة البكر مع الجولات الصديقة للبيئة وزيارات المتنزهات الوطنية'
      },
      keywords: ['nature', 'wildlife', 'eco-tourism', 'national parks', 'conservation', 'طبيعة', 'حياة برية', 'سياحة بيئية']
    }
  },
  {
    name: {
      en: 'Business Travel',
      ar: 'سفر الأعمال'
    },
    description: {
      en: 'Professional business travel packages with corporate amenities and services',
      ar: 'حزم سفر أعمال احترافية مع وسائل الراحة والخدمات المؤسسية'
    },
    slug: 'business-travel',
    icon: 'Briefcase',
    color: '#6B7280',
    status: 'active',
    order: 6,
    packageCategory: 'business',
    seo: {
      metaTitle: {
        en: 'Business Travel Packages | Corporate Travel & Meeting Solutions',
        ar: 'حزم سفر الأعمال | سفر مؤسسي وحلول الاجتماعات'
      },
      metaDescription: {
        en: 'Efficient business travel solutions with corporate rates, meeting facilities, and professional services',
        ar: 'حلول سفر أعمال فعالة مع أسعار مؤسسية وتسهيلات اجتماعات وخدمات احترافية'
      },
      keywords: ['business', 'corporate', 'meetings', 'professional', 'travel', 'أعمال', 'مؤسسي', 'اجتماعات', 'احترافي']
    }
  },
  {
    name: {
      en: 'Wellness & Spa',
      ar: 'العافية والسبا'
    },
    description: {
      en: 'Relaxing wellness retreats with spa treatments and health-focused experiences',
      ar: 'خلوات عافية مريحة مع علاجات السبا والتجارب المركزة على الصحة'
    },
    slug: 'wellness-spa',
    icon: 'Heart',
    color: '#EC4899',
    status: 'active',
    order: 7,
    packageCategory: 'wellness',
    seo: {
      metaTitle: {
        en: 'Wellness & Spa Retreats | Health-Focused Travel & Relaxation',
        ar: 'خلوات العافية والسبا | سفر مركز على الصحة والاسترخاء'
      },
      metaDescription: {
        en: 'Rejuvenate with wellness retreats featuring spa treatments, healthy cuisine, and mindfulness activities',
        ar: 'تجدد بخلوات العافية التي تتضمن علاجات السبا والمأكولات الصحية وأنشطة الوعي الذهني'
      },
      keywords: ['wellness', 'spa', 'health', 'relaxation', 'retreat', 'عافية', 'سبا', 'صحة', 'استرخاء', 'خلوة']
    }
  },
  {
    name: {
      en: 'Culinary Tours',
      ar: 'الجولات الطبخية'
    },
    description: {
      en: 'Gastronomic adventures with cooking classes and authentic local cuisine',
      ar: 'مغامرات طبخية مع دروس طبخ ومأكولات محلية أصيلة'
    },
    slug: 'culinary-tours',
    icon: 'Utensils',
    color: '#F59E0B',
    status: 'active',
    order: 8,
    packageCategory: 'food',
    seo: {
      metaTitle: {
        en: 'Culinary Tours | Food Experiences & Cooking Classes',
        ar: 'الجولات الطبخية | تجارب طعام ودروس طبخ'
      },
      metaDescription: {
        en: 'Savor authentic flavors with culinary tours featuring cooking classes and local food experiences',
        ar: 'تذوق النكهات الأصيلة مع الجولات الطبخية التي تتضمن دروس طبخ وتجارب طعام محلية'
      },
      keywords: ['culinary', 'food', 'cooking', 'cuisine', 'gastronomy', 'طبخي', 'طعام', 'مطبخ', 'تذوق الطعام']
    }
  },
  {
    name: {
      en: 'Photography Tours',
      ar: 'جولات التصوير'
    },
    description: {
      en: 'Capture stunning landscapes and moments with professional photography workshops',
      ar: 'التقط مناظر طبيعية خلابة ولحظات مميزة مع ورش تصوير احترافية'
    },
    slug: 'photography-tours',
    icon: 'Camera',
    color: '#6366F1',
    status: 'active',
    order: 9,
    packageCategory: 'photography',
    seo: {
      metaTitle: {
        en: 'Photography Tours | Scenic Routes & Photography Workshops',
        ar: 'جولات التصوير | طرق خلابة وورش تصوير'
      },
      metaDescription: {
        en: 'Perfect your photography skills with guided tours to scenic locations and professional workshops',
        ar: 'أتقن مهارات التصوير مع جولات مرشدة لمواقع خلابة وورش احترافية'
      },
      keywords: ['photography', 'scenic', 'workshops', 'landscapes', 'professional', 'تصوير', 'خلاب', 'ورش', 'مناظر طبيعية']
    }
  },
  {
    name: {
      en: 'Budget Travel',
      ar: 'السفر الاقتصادي'
    },
    description: {
      en: 'Affordable travel options for budget-conscious travelers and backpackers',
      ar: 'خيارات سفر بأسعار معقولة للمسافرين المهتمين بالميزانية والرحالة'
    },
    slug: 'budget-travel',
    icon: 'Wallet',
    color: '#059669',
    status: 'active',
    order: 10,
    packageCategory: 'budget',
    seo: {
      metaTitle: {
        en: 'Budget Travel Packages | Affordable Adventures & Backpacking',
        ar: 'حزم السفر الاقتصادي | مغامرات بأسعار معقولة والرحلات الاقتصادية'
      },
      metaDescription: {
        en: 'Explore amazing destinations on a budget with affordable travel packages and backpacking adventures',
        ar: 'استكشف وجهات رائعة بميزانية محدودة مع حزم سفر بأسعار معقولة ومغامرات رحلات اقتصادية'
      },
      keywords: ['budget', 'affordable', 'backpacking', 'cheap travel', 'economical', 'اقتصادي', 'بأسعار معقولة', 'رحلات اقتصادية']
    }
  }
];

async function seedCategories() {
  try {
    // Clear existing categories
    await Category.deleteMany({});
    console.log('Existing categories cleared');

    // Insert new categories
    const categories = await Category.insertMany(categoriesData);
    console.log(`${categories.length} categories inserted successfully`);

    // Display inserted categories
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name.en} (${category.slug}) - ${category.packageCategory}`);
    });

    console.log('\nCategory seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding categories:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedCategories();