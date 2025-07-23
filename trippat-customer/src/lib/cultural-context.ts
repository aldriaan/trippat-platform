import { Locale } from '@/i18n/request'

export interface CulturalPreferences {
  familyFriendly: boolean
  conservativeDress: boolean
  ramadanConscious: boolean
  hajjSeasonAware: boolean
  genderSeparation: boolean
  alcoholFree: boolean
  fridayPrayers: boolean
}

export interface TravelSeason {
  id: string
  name: {
    en: string
    ar: string
  }
  startDate: string
  endDate: string
  description: {
    en: string
    ar: string
  }
  travelImpact: {
    en: string
    ar: string
  }
  recommendations: {
    en: string[]
    ar: string[]
  }
}

export interface CulturalHoliday {
  id: string
  name: {
    en: string
    ar: string
  }
  type: 'islamic' | 'national' | 'cultural'
  date: string // ISO format or hijri format
  isLunar: boolean
  significance: {
    en: string
    ar: string
  }
  travelConsiderations: {
    en: string[]
    ar: string[]
  }
  recommendations: {
    en: string[]
    ar: string[]
  }
}

export interface LocalCustoms {
  country: string
  customs: {
    id: string
    category: 'dress' | 'behavior' | 'dining' | 'religious' | 'social'
    title: {
      en: string
      ar: string
    }
    description: {
      en: string
      ar: string
    }
    importance: 'critical' | 'important' | 'helpful'
    tips: {
      en: string[]
      ar: string[]
    }
  }[]
}

export interface ArabicTravelTerms {
  [key: string]: {
    arabic: string
    transliteration: string
    english: string
    context: string
    usage: {
      en: string
      ar: string
    }
  }
}

export interface SaudiTravelInsights {
  regions: {
    id: string
    name: {
      en: string
      ar: string
    }
    climate: {
      en: string
      ar: string
    }
    bestTime: {
      en: string
      ar: string
    }
    attractions: {
      name: {
        en: string
        ar: string
      }
      type: string
      culturalSignificance: {
        en: string
        ar: string
      }
      visitingTips: {
        en: string[]
        ar: string[]
      }
    }[]
    localCuisine: {
      name: {
        en: string
        ar: string
      }
      description: {
        en: string
        ar: string
      }
      isHalal: boolean
      recommendations: {
        en: string[]
        ar: string[]
      }
    }[]
    transportation: {
      en: string[]
      ar: string[]
    }
    accommodation: {
      en: string[]
      ar: string[]
    }
  }[]
}

// Cultural Holidays Data
export const culturalHolidays: CulturalHoliday[] = [
  {
    id: 'ramadan',
    name: {
      en: 'Ramadan',
      ar: 'رمضان'
    },
    type: 'islamic',
    date: '2024-03-11', // This would be calculated dynamically
    isLunar: true,
    significance: {
      en: 'Holy month of fasting and spiritual reflection in Islam',
      ar: 'الشهر المقدس للصيام والتأمل الروحي في الإسلام'
    },
    travelConsiderations: {
      en: [
        'Restaurants may be closed during daytime',
        'Reduced business hours',
        'Respectful behavior expected in public',
        'Drinking and eating in public discouraged'
      ],
      ar: [
        'قد تكون المطاعم مغلقة خلال النهار',
        'ساعات عمل مقلصة',
        'سلوك محترم متوقع في الأماكن العامة',
        'تجنب الشرب والأكل في الأماكن العامة'
      ]
    },
    recommendations: {
      en: [
        'Experience authentic Iftar meals',
        'Visit night markets and festivals',
        'Enjoy extended evening hours',
        'Participate in charitable activities'
      ],
      ar: [
        'تجربة وجبات إفطار أصيلة',
        'زيارة الأسواق الليلية والمهرجانات',
        'الاستمتاع بساعات المساء الممتدة',
        'المشاركة في الأنشطة الخيرية'
      ]
    }
  },
  {
    id: 'hajj',
    name: {
      en: 'Hajj Season',
      ar: 'موسم الحج'
    },
    type: 'islamic',
    date: '2024-06-14',
    isLunar: true,
    significance: {
      en: 'Annual Islamic pilgrimage to Mecca',
      ar: 'الحج الإسلامي السنوي إلى مكة المكرمة'
    },
    travelConsiderations: {
      en: [
        'Mecca and Medina extremely crowded',
        'Accommodation prices surge',
        'Transportation heavily booked',
        'Increased security measures'
      ],
      ar: [
        'مكة المكرمة والمدينة المنورة مكتظة جداً',
        'ارتفاع أسعار الإقامة',
        'حجوزات النقل مكتظة',
        'إجراءات أمنية مشددة'
      ]
    },
    recommendations: {
      en: [
        'Book well in advance',
        'Consider alternative cities',
        'Respect pilgrim routes',
        'Be patient with crowds'
      ],
      ar: [
        'احجز مسبقاً',
        'فكر في مدن بديلة',
        'احترم طرق الحجاج',
        'تحلى بالصبر مع الحشود'
      ]
    }
  },
  {
    id: 'saudi-national-day',
    name: {
      en: 'Saudi National Day',
      ar: 'اليوم الوطني السعودي'
    },
    type: 'national',
    date: '2024-09-23',
    isLunar: false,
    significance: {
      en: 'Celebrates the unification of Saudi Arabia',
      ar: 'يحتفل بتوحيد المملكة العربية السعودية'
    },
    travelConsiderations: {
      en: [
        'National holiday - many businesses closed',
        'Public celebrations and fireworks',
        'Heavy traffic in major cities',
        'Patriotic decorations everywhere'
      ],
      ar: [
        'عطلة وطنية - العديد من الشركات مغلقة',
        'احتفالات عامة وألعاب نارية',
        'حركة مرور كثيفة في المدن الكبرى',
        'زينة وطنية في كل مكان'
      ]
    },
    recommendations: {
      en: [
        'Join in national celebrations',
        'Visit cultural events',
        'Enjoy special performances',
        'Experience Saudi pride'
      ],
      ar: [
        'انضم للاحتفالات الوطنية',
        'زر الفعاليات الثقافية',
        'استمتع بالعروض الخاصة',
        'اختبر الفخر السعودي'
      ]
    }
  }
]

// Travel Seasons Data
export const travelSeasons: TravelSeason[] = [
  {
    id: 'winter',
    name: {
      en: 'Winter Season',
      ar: 'فصل الشتاء'
    },
    startDate: '2024-12-01',
    endDate: '2025-02-28',
    description: {
      en: 'Best weather for travel across most of Saudi Arabia',
      ar: 'أفضل طقس للسفر عبر معظم أنحاء المملكة العربية السعودية'
    },
    travelImpact: {
      en: 'Peak tourism season with pleasant temperatures',
      ar: 'موسم الذروة السياحية مع درجات حرارة لطيفة'
    },
    recommendations: {
      en: [
        'Book accommodations early',
        'Perfect for desert activities',
        'Ideal for outdoor exploration',
        'Great for family trips'
      ],
      ar: [
        'احجز الإقامة مبكراً',
        'مثالي للأنشطة الصحراوية',
        'مناسب للاستكشاف الخارجي',
        'رائع للرحلات العائلية'
      ]
    }
  },
  {
    id: 'spring',
    name: {
      en: 'Spring Season',
      ar: 'فصل الربيع'
    },
    startDate: '2025-03-01',
    endDate: '2025-05-31',
    description: {
      en: 'Mild temperatures with occasional rain',
      ar: 'درجات حرارة معتدلة مع أمطار عرضية'
    },
    travelImpact: {
      en: 'Good weather for most activities',
      ar: 'طقس جيد لمعظم الأنشطة'
    },
    recommendations: {
      en: [
        'Enjoy blooming landscapes',
        'Perfect for hiking',
        'Great for cultural tours',
        'Photography season'
      ],
      ar: [
        'استمتع بالمناظر المزهرة',
        'مثالي للمشي لمسافات طويلة',
        'رائع للجولات الثقافية',
        'موسم التصوير'
      ]
    }
  },
  {
    id: 'summer',
    name: {
      en: 'Summer Season',
      ar: 'فصل الصيف'
    },
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    description: {
      en: 'Very hot weather, especially in central regions',
      ar: 'طقس حار جداً، خاصة في المناطق الوسطى'
    },
    travelImpact: {
      en: 'Challenging outdoor activities due to heat',
      ar: 'أنشطة خارجية صعبة بسبب الحر'
    },
    recommendations: {
      en: [
        'Visit cooler mountain regions',
        'Focus on indoor attractions',
        'Early morning/evening activities',
        'Stay hydrated always'
      ],
      ar: [
        'زر المناطق الجبلية الباردة',
        'ركز على المعالم الداخلية',
        'أنشطة الصباح الباكر/المساء',
        'حافظ على رطوبة الجسم دائماً'
      ]
    }
  }
]

// Arabic Travel Terms
export const arabicTravelTerms: ArabicTravelTerms = {
  airport: {
    arabic: 'مطار',
    transliteration: 'matar',
    english: 'airport',
    context: 'transportation',
    usage: {
      en: 'Which airport should I fly into?',
      ar: 'أي مطار يجب أن أطير إليه؟'
    }
  },
  hotel: {
    arabic: 'فندق',
    transliteration: 'funduq',
    english: 'hotel',
    context: 'accommodation',
    usage: {
      en: 'I need a hotel reservation',
      ar: 'أحتاج حجز فندق'
    }
  },
  restaurant: {
    arabic: 'مطعم',
    transliteration: 'matam',
    english: 'restaurant',
    context: 'dining',
    usage: {
      en: 'Where is the nearest restaurant?',
      ar: 'أين أقرب مطعم؟'
    }
  },
  mosque: {
    arabic: 'مسجد',
    transliteration: 'masjid',
    english: 'mosque',
    context: 'religious',
    usage: {
      en: 'Are there mosques nearby?',
      ar: 'هل توجد مساجد قريبة؟'
    }
  },
  desert: {
    arabic: 'صحراء',
    transliteration: 'sahra',
    english: 'desert',
    context: 'geography',
    usage: {
      en: 'I want to visit the desert',
      ar: 'أريد زيارة الصحراء'
    }
  },
  pilgrimage: {
    arabic: 'حج',
    transliteration: 'hajj',
    english: 'pilgrimage',
    context: 'religious',
    usage: {
      en: 'Information about pilgrimage routes',
      ar: 'معلومات عن طرق الحج'
    }
  },
  marketplace: {
    arabic: 'سوق',
    transliteration: 'souq',
    english: 'marketplace/bazaar',
    context: 'shopping',
    usage: {
      en: 'Take me to the traditional market',
      ar: 'خذني إلى السوق التقليدي'
    }
  },
  journey: {
    arabic: 'رحلة',
    transliteration: 'rihla',
    english: 'journey/trip',
    context: 'travel',
    usage: {
      en: 'Plan my journey',
      ar: 'خطط رحلتي'
    }
  },
  guide: {
    arabic: 'مرشد',
    transliteration: 'murshid',
    english: 'guide',
    context: 'assistance',
    usage: {
      en: 'I need a tour guide',
      ar: 'أحتاج مرشد سياحي'
    }
  },
  heritage: {
    arabic: 'تراث',
    transliteration: 'turath',
    english: 'heritage',
    context: 'culture',
    usage: {
      en: 'Show me cultural heritage sites',
      ar: 'أرني مواقع التراث الثقافي'
    }
  }
}

// Saudi Travel Insights
export const saudiTravelInsights: SaudiTravelInsights = {
  regions: [
    {
      id: 'riyadh',
      name: {
        en: 'Riyadh Region',
        ar: 'منطقة الرياض'
      },
      climate: {
        en: 'Hot desert climate with very hot summers and mild winters',
        ar: 'مناخ صحراوي حار مع صيف حار جداً وشتاء معتدل'
      },
      bestTime: {
        en: 'November to March for pleasant weather',
        ar: 'نوفمبر إلى مارس للطقس اللطيف'
      },
      attractions: [
        {
          name: {
            en: 'Masmak Fortress',
            ar: 'قصر المصمك'
          },
          type: 'historical',
          culturalSignificance: {
            en: 'Birthplace of modern Saudi Arabia',
            ar: 'مهد المملكة العربية السعودية الحديثة'
          },
          visitingTips: {
            en: [
              'Visit during cooler hours',
              'Respect photography restrictions',
              'Guided tours available in Arabic and English'
            ],
            ar: [
              'زر في الساعات الباردة',
              'احترم قيود التصوير',
              'جولات مرشدة متاحة بالعربية والإنجليزية'
            ]
          }
        },
        {
          name: {
            en: 'Kingdom Centre Tower',
            ar: 'برج المملكة'
          },
          type: 'modern',
          culturalSignificance: {
            en: 'Symbol of modern Saudi development',
            ar: 'رمز التطور السعودي الحديث'
          },
          visitingTips: {
            en: [
              'Sky bridge offers panoramic views',
              'Shopping and dining available',
              'Best visited in evening for city lights'
            ],
            ar: [
              'الجسر السماوي يوفر مناظر بانورامية',
              'التسوق والطعام متاحان',
              'الأفضل زيارته في المساء لأضواء المدينة'
            ]
          }
        }
      ],
      localCuisine: [
        {
          name: {
            en: 'Kabsa',
            ar: 'كبسة'
          },
          description: {
            en: 'Traditional Saudi rice dish with meat and spices',
            ar: 'طبق الأرز السعودي التقليدي مع اللحم والتوابل'
          },
          isHalal: true,
          recommendations: {
            en: [
              'Try authentic versions at local restaurants',
              'Usually served for lunch',
              'Eaten with hands traditionally'
            ],
            ar: [
              'جرب الأصناف الأصيلة في المطاعم المحلية',
              'عادة يقدم للغداء',
              'يؤكل باليد تقليدياً'
            ]
          }
        }
      ],
      transportation: {
        en: [
          'Riyadh Metro (modern public transport)',
          'Taxis and ride-sharing services',
          'Car rental widely available',
          'Bus system connects major areas'
        ],
        ar: [
          'قطار الرياض (النقل العام الحديث)',
          'سيارات الأجرة وخدمات النقل التشاركي',
          'تأجير السيارات متاح بكثرة',
          'نظام الحافلات يربط المناطق الرئيسية'
        ]
      },
      accommodation: {
        en: [
          'Luxury hotels in business districts',
          'Family-friendly accommodations',
          'Budget options available',
          'Traditional Arabic hospitality'
        ],
        ar: [
          'فنادق فاخرة في المناطق التجارية',
          'إقامة مناسبة للعائلات',
          'خيارات اقتصادية متاحة',
          'ضيافة عربية تقليدية'
        ]
      }
    },
    {
      id: 'mecca',
      name: {
        en: 'Mecca Region',
        ar: 'منطقة مكة المكرمة'
      },
      climate: {
        en: 'Hot desert climate, very hot and humid',
        ar: 'مناخ صحراوي حار، حار جداً ورطب'
      },
      bestTime: {
        en: 'October to April, avoid Hajj season crowds',
        ar: 'أكتوبر إلى أبريل، تجنب زحام موسم الحج'
      },
      attractions: [
        {
          name: {
            en: 'Masjid al-Haram',
            ar: 'المسجد الحرام'
          },
          type: 'religious',
          culturalSignificance: {
            en: 'Holiest site in Islam, contains the Kaaba',
            ar: 'أقدس مكان في الإسلام، يحتوي على الكعبة المشرفة'
          },
          visitingTips: {
            en: [
              'Dress modestly and appropriately',
              'Respect prayer times',
              'Follow crowd management guidelines',
              'Bring prayer mat and water'
            ],
            ar: [
              'البس بطريقة محتشمة ومناسبة',
              'احترم أوقات الصلاة',
              'اتبع إرشادات إدارة الحشود',
              'أحضر سجادة صلاة وماء'
            ]
          }
        }
      ],
      localCuisine: [
        {
          name: {
            en: 'Mutabbaq',
            ar: 'مطبق'
          },
          description: {
            en: 'Stuffed pancake with meat, vegetables, or cheese',
            ar: 'فطيرة محشوة باللحم أو الخضار أو الجبن'
          },
          isHalal: true,
          recommendations: {
            en: [
              'Popular street food',
              'Available at most food stalls',
              'Great for quick meals'
            ],
            ar: [
              'طعام شعبي شائع',
              'متاح في معظم المحلات',
              'رائع للوجبات السريعة'
            ]
          }
        }
      ],
      transportation: {
        en: [
          'Haramain High-Speed Railway',
          'Shuttle buses to holy sites',
          'Taxis and ride-sharing',
          'Walking is common in holy areas'
        ],
        ar: [
          'قطار الحرمين السريع',
          'حافلات مكوكية للمواقع المقدسة',
          'سيارات الأجرة والنقل التشاركي',
          'المشي شائع في المناطق المقدسة'
        ]
      },
      accommodation: {
        en: [
          'Hotels near Haram for pilgrims',
          'Luxury accommodations available',
          'Budget-friendly options',
          'Book well in advance'
        ],
        ar: [
          'فنادق قريبة من الحرم للحجاج',
          'إقامة فاخرة متاحة',
          'خيارات اقتصادية',
          'احجز مسبقاً'
        ]
      }
    }
  ]
}

// Local Customs Data
export const localCustoms: LocalCustoms = {
  country: 'Saudi Arabia',
  customs: [
    {
      id: 'dress-code',
      category: 'dress',
      title: {
        en: 'Modest Dress Code',
        ar: 'قواعد اللباس المحتشم'
      },
      description: {
        en: 'Both men and women should dress modestly in public',
        ar: 'يجب على الرجال والنساء ارتداء ملابس محتشمة في الأماكن العامة'
      },
      importance: 'critical',
      tips: {
        en: [
          'Cover shoulders and knees',
          'Avoid tight-fitting clothes',
          'Women should consider loose-fitting attire',
          'Respect local customs in religious sites'
        ],
        ar: [
          'غطِ الكتفين والركبتين',
          'تجنب الملابس الضيقة',
          'النساء يجب أن يفكرن في الملابس الفضفاضة',
          'احترم العادات المحلية في المواقع الدينية'
        ]
      }
    },
    {
      id: 'prayer-times',
      category: 'religious',
      title: {
        en: 'Prayer Times Respect',
        ar: 'احترام أوقات الصلاة'
      },
      description: {
        en: 'Business and activities pause during prayer times',
        ar: 'الأعمال والأنشطة تتوقف خلال أوقات الصلاة'
      },
      importance: 'important',
      tips: {
        en: [
          'Expect shops to close briefly',
          'Plan activities around prayer times',
          'Show respect during prayer calls',
          'Use prayer apps for timing'
        ],
        ar: [
          'توقع إغلاق المحلات لفترة قصيرة',
          'خطط الأنشطة حول أوقات الصلاة',
          'أظهر الاحترام خلال الأذان',
          'استخدم تطبيقات الصلاة للمواعيد'
        ]
      }
    },
    {
      id: 'greetings',
      category: 'social',
      title: {
        en: 'Traditional Greetings',
        ar: 'التحيات التقليدية'
      },
      description: {
        en: 'Learn common Arabic greetings and customs',
        ar: 'تعلم التحيات العربية الشائعة والعادات'
      },
      importance: 'helpful',
      tips: {
        en: [
          'Say "As-salamu alaykum" (Peace be upon you)',
          'Respond with "Wa alaykum as-salam"',
          'Use right hand for greetings',
          'Show respect to elders'
        ],
        ar: [
          'قل "السلام عليكم"',
          'اجب بـ"وعليكم السلام"',
          'استخدم اليد اليمنى للتحية',
          'أظهر الاحترام للكبار'
        ]
      }
    },
    {
      id: 'dining-etiquette',
      category: 'dining',
      title: {
        en: 'Dining Etiquette',
        ar: 'آداب الطعام'
      },
      description: {
        en: 'Traditional dining customs and table manners',
        ar: 'عادات الطعام التقليدية وآداب المائدة'
      },
      importance: 'important',
      tips: {
        en: [
          'Eat with right hand',
          'Accept hospitality graciously',
          'Try traditional foods',
          'Leave some food to show satisfaction'
        ],
        ar: [
          'كل بالید اليمنى',
          'اقبل الضيافة بلطف',
          'جرب الأطعمة التقليدية',
          'اترك بعض الطعام لإظهار الرضا'
        ]
      }
    }
  ]
}

// Cultural Preferences Helper
export const getCulturalPreferences = (locale: Locale): CulturalPreferences => {
  const basePreferences: CulturalPreferences = {
    familyFriendly: true,
    conservativeDress: true,
    ramadanConscious: true,
    hajjSeasonAware: true,
    genderSeparation: false,
    alcoholFree: true,
    fridayPrayers: true
  }

  // Adjust based on locale
  if (locale === 'ar') {
    return {
      ...basePreferences,
      genderSeparation: true,
      ramadanConscious: true,
      hajjSeasonAware: true
    }
  }

  return basePreferences
}

// Get current cultural context
export const getCurrentCulturalContext = (locale: Locale) => {
  const preferences = getCulturalPreferences(locale)
  const currentDate = new Date()
  
  // Check for active holidays
  const activeHolidays = culturalHolidays.filter(holiday => {
    const holidayDate = new Date(holiday.date)
    const timeDiff = Math.abs(currentDate.getTime() - holidayDate.getTime())
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    return dayDiff <= 30 // Within 30 days
  })

  // Check for active season
  const activeSeason = travelSeasons.find(season => {
    const startDate = new Date(season.startDate)
    const endDate = new Date(season.endDate)
    return currentDate >= startDate && currentDate <= endDate
  })

  return {
    preferences,
    activeHolidays,
    activeSeason,
    locale
  }
}