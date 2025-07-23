const calendarConfig = {
  // Primary calendar system
  primaryCalendar: 'gregorian',
  
  // Supported calendar systems
  supportedCalendars: ['gregorian'],
  
  // International holidays and observances
  internationalHolidays: {
    // Fixed dates
    newYear: {
      date: '01-01',
      name: {
        en: 'New Year\'s Day',
        ar: 'رأس السنة الميلادية'
      },
      type: 'international'
    },
    
    // Saudi National Days
    saudiNationalDay: {
      date: '09-23',
      name: {
        en: 'Saudi National Day',
        ar: 'اليوم الوطني السعودي'
      },
      type: 'national',
      country: 'SA'
    },
    
    saudiFoundingDay: {
      date: '02-22',
      name: {
        en: 'Saudi Founding Day',
        ar: 'يوم التأسيس السعودي'
      },
      type: 'national',
      country: 'SA'
    },
    
    // International observances
    worldTourismDay: {
      date: '09-27',
      name: {
        en: 'World Tourism Day',
        ar: 'يوم السياحة العالمي'
      },
      type: 'international',
      relevance: 'travel'
    },
    
    internationalDayOfPeace: {
      date: '09-21',
      name: {
        en: 'International Day of Peace',
        ar: 'اليوم الدولي للسلام'
      },
      type: 'international'
    },
    
    earthDay: {
      date: '04-22',
      name: {
        en: 'Earth Day',
        ar: 'يوم الأرض'
      },
      type: 'international',
      relevance: 'environment'
    },
    
    worldHeritageDay: {
      date: '04-18',
      name: {
        en: 'World Heritage Day',
        ar: 'يوم التراث العالمي'
      },
      type: 'international',
      relevance: 'cultural'
    }
  },
  
  // Season definitions for travel planning
  seasons: {
    spring: {
      months: [3, 4, 5],
      name: {
        en: 'Spring',
        ar: 'الربيع'
      },
      characteristics: {
        en: 'Mild temperatures, blooming nature, ideal for outdoor activities',
        ar: 'درجات حرارة معتدلة، طبيعة مزهرة، مثالية للأنشطة الخارجية'
      }
    },
    summer: {
      months: [6, 7, 8],
      name: {
        en: 'Summer',
        ar: 'الصيف'
      },
      characteristics: {
        en: 'Hot temperatures, long days, beach and water activities',
        ar: 'درجات حرارة عالية، أيام طويلة، أنشطة الشاطئ والمياه'
      }
    },
    autumn: {
      months: [9, 10, 11],
      name: {
        en: 'Autumn',
        ar: 'الخريف'
      },
      characteristics: {
        en: 'Comfortable temperatures, cultural activities, harvest season',
        ar: 'درجات حرارة مريحة، أنشطة ثقافية، موسم الحصاد'
      }
    },
    winter: {
      months: [12, 1, 2],
      name: {
        en: 'Winter',
        ar: 'الشتاء'
      },
      characteristics: {
        en: 'Cool temperatures, indoor activities, cozy atmosphere',
        ar: 'درجات حرارة باردة، أنشطة داخلية، أجواء دافئة'
      }
    }
  },
  
  // Peak travel seasons by region
  peakSeasons: {
    saudiArabia: {
      high: {
        months: [10, 11, 12, 1, 2, 3],
        reason: {
          en: 'Pleasant weather, comfortable temperatures',
          ar: 'طقس لطيف، درجات حرارة مريحة'
        }
      },
      low: {
        months: [6, 7, 8],
        reason: {
          en: 'Very hot weather, indoor activities preferred',
          ar: 'طقس حار جداً، الأنشطة الداخلية مفضلة'
        }
      },
      shoulder: {
        months: [4, 5, 9],
        reason: {
          en: 'Moderate temperatures, fewer crowds',
          ar: 'درجات حرارة معتدلة، زحام أقل'
        }
      }
    }
  },
  
  // Weekend configurations by region
  weekendConfig: {
    saudiArabia: {
      weekend: ['friday', 'saturday'],
      firstDayOfWeek: 'sunday',
      workingDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday']
    },
    international: {
      weekend: ['saturday', 'sunday'],
      firstDayOfWeek: 'monday',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }
  },
  
  // Date formatting preferences
  dateFormats: {
    en: {
      short: 'MM/DD/YYYY',
      medium: 'MMM DD, YYYY',
      long: 'MMMM Do, YYYY',
      full: 'dddd, MMMM Do YYYY'
    },
    ar: {
      short: 'DD/MM/YYYY',
      medium: 'DD MMM, YYYY',
      long: 'D MMMM, YYYY',
      full: 'dddd، D MMMM YYYY'
    }
  },
  
  // Time formatting preferences
  timeFormats: {
    en: {
      short: 'h:mm A',
      long: 'h:mm:ss A',
      24h: 'HH:mm'
    },
    ar: {
      short: 'h:mm A',
      long: 'h:mm:ss A',
      24h: 'HH:mm'
    }
  },
  
  // Business calendar considerations
  businessCalendar: {
    // Standard business hours
    businessHours: {
      saudiArabia: {
        sunday: { start: '09:00', end: '17:00' },
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: 'closed',
        saturday: 'closed'
      },
      international: {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' },
        saturday: 'closed',
        sunday: 'closed'
      }
    },
    
    // Booking availability windows
    advanceBooking: {
      minimum: 1, // days
      maximum: 365, // days
      recommended: 30 // days
    },
    
    // Cancellation policies by timing
    cancellationPolicies: {
      flexible: {
        cutoff: 24, // hours
        penalty: 0 // percentage
      },
      moderate: {
        cutoff: 48, // hours
        penalty: 25 // percentage
      },
      strict: {
        cutoff: 168, // hours (7 days)
        penalty: 50 // percentage
      }
    }
  },
  
  // Travel season recommendations
  travelRecommendations: {
    adventure: {
      bestMonths: [10, 11, 12, 1, 2, 3],
      reason: {
        en: 'Ideal weather for outdoor activities',
        ar: 'طقس مثالي للأنشطة الخارجية'
      }
    },
    cultural: {
      bestMonths: [9, 10, 11, 12, 1, 2, 3, 4],
      reason: {
        en: 'Comfortable temperatures for site visits',
        ar: 'درجات حرارة مريحة لزيارة المواقع'
      }
    },
    luxury: {
      bestMonths: [11, 12, 1, 2, 3],
      reason: {
        en: 'Premium weather conditions',
        ar: 'ظروف جوية مثالية'
      }
    },
    family: {
      bestMonths: [10, 11, 12, 1, 2, 3, 4],
      reason: {
        en: 'Family-friendly weather and activities',
        ar: 'طقس وأنشطة مناسبة للعائلات'
      }
    }
  }
};

// Helper functions
calendarConfig.utils = {
  getCurrentSeason: function(month = new Date().getMonth() + 1) {
    for (const [seasonName, season] of Object.entries(this.seasons)) {
      if (season.months.includes(month)) {
        return { name: seasonName, ...season };
      }
    }
    return null;
  },
  
  getPeakSeason: function(month = new Date().getMonth() + 1, region = 'saudiArabia') {
    const regional = this.peakSeasons[region];
    if (!regional) return null;
    
    if (regional.high.months.includes(month)) return 'high';
    if (regional.low.months.includes(month)) return 'low';
    if (regional.shoulder.months.includes(month)) return 'shoulder';
    return null;
  },
  
  getHolidaysInMonth: function(month, year = new Date().getFullYear()) {
    const holidays = [];
    for (const [key, holiday] of Object.entries(this.internationalHolidays)) {
      const [holidayMonth, holidayDay] = holiday.date.split('-').map(Number);
      if (holidayMonth === month) {
        holidays.push({
          key,
          ...holiday,
          date: new Date(year, month - 1, holidayDay)
        });
      }
    }
    return holidays;
  },
  
  isBestTimeForCategory: function(month, category) {
    const recommendation = this.travelRecommendations[category];
    return recommendation ? recommendation.bestMonths.includes(month) : false;
  },
  
  formatDateForLanguage: function(date, language = 'en', format = 'medium') {
    const formats = this.dateFormats[language];
    return formats ? formats[format] : this.dateFormats.en[format];
  }
};

module.exports = calendarConfig;