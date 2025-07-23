const multilingualConfig = {
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'ar'],
  
  // Language settings
  languages: {
    en: {
      name: 'English',
      nativeName: 'English',
      direction: 'ltr',
      locale: 'en-US',
      currency: 'USD',
      dateFormat: 'MMMM Do, YYYY',
      timeFormat: 'h:mm A',
      numberFormat: 'en-US'
    },
    ar: {
      name: 'Arabic',
      nativeName: 'العربية',
      direction: 'rtl',
      locale: 'ar-SA',
      currency: 'SAR',
      dateFormat: 'D MMMM, YYYY',
      timeFormat: 'h:mm A',
      numberFormat: 'ar-SA'
    }
  },
  
  // Default currency rates (should be updated from API)
  defaultExchangeRates: {
    USD: 1,
    SAR: 3.75
  },
  
  // Email configuration
  email: {
    templates: {
      'booking-confirmation': {
        en: 'booking-confirmation-en.html',
        ar: 'booking-confirmation-ar.html'
      },
      'booking-cancellation': {
        en: 'booking-cancellation-en.html',
        ar: 'booking-cancellation-ar.html'
      },
      'password-reset': {
        en: 'password-reset-en.html',
        ar: 'password-reset-ar.html'
      }
    },
    subjects: {
      'booking-confirmation': {
        en: 'Booking Confirmation',
        ar: 'تأكيد الحجز'
      },
      'booking-cancellation': {
        en: 'Booking Cancellation',
        ar: 'إلغاء الحجز'
      },
      'password-reset': {
        en: 'Password Reset',
        ar: 'إعادة تعيين كلمة المرور'
      }
    }
  },
  
  // API endpoints for different languages
  apiEndpoints: {
    packages: {
      list: '/api/packages',
      search: '/api/packages/search',
      translations: '/api/packages/:id/translations',
      translationStats: '/api/packages/admin/translation-stats'
    },
    users: {
      profile: '/api/users/profile',
      preferences: '/api/users/preferences'
    }
  },
  
  // Translation field mappings
  translationFields: {
    Package: {
      title: 'title_ar',
      description: 'description_ar',
      destination: 'destination_ar',
      inclusions: 'inclusions_ar',
      exclusions: 'exclusions_ar',
      highlights: 'highlights_ar'
    },
    Itinerary: {
      title: 'title_ar',
      description: 'description_ar',
      activities: 'activities_ar'
    }
  },
  
  // Validation rules for translations
  validation: {
    required: ['title', 'description', 'destination'],
    optional: ['inclusions', 'exclusions', 'highlights'],
    maxLength: {
      title: 200,
      description: 2000,
      destination: 100
    }
  },
  
  // Cultural considerations
  cultural: {
    ar: {
      // Arabic-specific cultural considerations
      rightToLeft: true,
      numeralSystem: 'arabic-indic', // Use Arabic-Indic numerals
      calendar: 'gregorian', // Could be 'islamic' for Hijri calendar
      weekStart: 'saturday', // Week starts on Saturday in Saudi Arabia
      currency: {
        symbol: 'ر.س',
        position: 'after' // Currency symbol position
      },
      datePreferences: {
        preferredFormat: 'dd/MM/yyyy',
        timeFormat: '24h' // 24-hour format is common
      }
    },
    en: {
      rightToLeft: false,
      numeralSystem: 'latin',
      calendar: 'gregorian',
      weekStart: 'sunday',
      currency: {
        symbol: '$',
        position: 'before'
      },
      datePreferences: {
        preferredFormat: 'MM/dd/yyyy',
        timeFormat: '12h'
      }
    }
  },
  
  // Content policies
  contentPolicies: {
    ar: {
      // Arabic content should be culturally appropriate for Saudi market
      dietaryAccommodations: true,
      accessibilityFeatures: true,
      familyFriendlyContent: true,
      culturalSensitivity: true,
      localCustomsInfo: true,
      safetyStandards: true
    },
    en: {
      dietaryAccommodations: true,
      accessibilityFeatures: true,
      familyFriendlyContent: true,
      culturalSensitivity: true,
      localCustomsInfo: true,
      safetyStandards: true
    }
  }
}

module.exports = multilingualConfig