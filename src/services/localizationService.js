const moment = require('moment');
require('moment/locale/ar');

class LocalizationService {
  constructor() {
    this.supportedLanguages = ['en', 'ar'];
    this.defaultLanguage = 'en';
  }

  formatDate(date, language = 'en', format = 'MMMM Do, YYYY') {
    const momentDate = moment(date);
    
    if (language === 'ar') {
      momentDate.locale('ar');
      // Common Arabic date formats
      const arabicFormats = {
        'MMMM Do, YYYY': 'D MMMM, YYYY',
        'MMM DD, YYYY': 'DD MMM, YYYY',
        'DD/MM/YYYY': 'DD/MM/YYYY',
        'short': 'DD/MM/YYYY',
        'long': 'dddd، D MMMM YYYY',
        'medium': 'D MMMM, YYYY'
      };
      
      const arabicFormat = arabicFormats[format] || format;
      return momentDate.format(arabicFormat);
    } else {
      momentDate.locale('en');
      return momentDate.format(format);
    }
  }

  formatTime(date, language = 'en', is24Hour = false) {
    const momentDate = moment(date);
    
    if (language === 'ar') {
      momentDate.locale('ar');
      return is24Hour ? momentDate.format('HH:mm') : momentDate.format('h:mm A');
    } else {
      momentDate.locale('en');
      return is24Hour ? momentDate.format('HH:mm') : momentDate.format('h:mm A');
    }
  }

  formatDateTime(date, language = 'en', format = 'full') {
    const momentDate = moment(date);
    
    if (language === 'ar') {
      momentDate.locale('ar');
      switch (format) {
        case 'full':
          return momentDate.format('dddd، D MMMM YYYY - h:mm A');
        case 'medium':
          return momentDate.format('D MMMM, YYYY - h:mm A');
        case 'short':
          return momentDate.format('DD/MM/YYYY - HH:mm');
        default:
          return momentDate.format(format);
      }
    } else {
      momentDate.locale('en');
      switch (format) {
        case 'full':
          return momentDate.format('dddd, MMMM Do YYYY - h:mm A');
        case 'medium':
          return momentDate.format('MMMM Do, YYYY - h:mm A');
        case 'short':
          return momentDate.format('MM/DD/YYYY - HH:mm');
        default:
          return momentDate.format(format);
      }
    }
  }

  formatDuration(days, language = 'en') {
    if (language === 'ar') {
      if (days === 1) return 'يوم واحد';
      if (days === 2) return 'يومان';
      if (days <= 10) return `${days} أيام`;
      return `${days} يوماً`;
    } else {
      if (days === 1) return '1 day';
      return `${days} days`;
    }
  }

  formatNumber(number, language = 'en') {
    if (language === 'ar') {
      // Arabic-Indic digits
      const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
      return number.toString().replace(/\d/g, (digit) => arabicDigits[digit]);
    }
    return number.toString();
  }

  getLocalizedText(textObj, language = 'en') {
    if (typeof textObj === 'string') {
      return textObj;
    }
    
    if (typeof textObj === 'object' && textObj !== null) {
      // Support for objects with language keys
      if (language === 'ar' && textObj.ar) {
        return textObj.ar;
      }
      if (textObj.en) {
        return textObj.en;
      }
      if (textObj[language]) {
        return textObj[language];
      }
    }
    
    return textObj || '';
  }

  localizePackage(packageData, language = 'en') {
    if (!packageData) return packageData;

    const localized = { ...packageData };

    // Localize basic fields
    localized.title = this.getLocalizedText({
      en: packageData.title,
      ar: packageData.title_ar
    }, language);

    localized.description = this.getLocalizedText({
      en: packageData.description,
      ar: packageData.description_ar
    }, language);

    localized.destination = this.getLocalizedText({
      en: packageData.destination,
      ar: packageData.destination_ar
    }, language);

    // Localize arrays
    if (packageData.inclusions) {
      localized.inclusions = language === 'ar' && packageData.inclusions_ar?.length 
        ? packageData.inclusions_ar 
        : packageData.inclusions;
    }

    if (packageData.exclusions) {
      localized.exclusions = language === 'ar' && packageData.exclusions_ar?.length 
        ? packageData.exclusions_ar 
        : packageData.exclusions;
    }

    if (packageData.highlights) {
      localized.highlights = language === 'ar' && packageData.highlights_ar?.length 
        ? packageData.highlights_ar 
        : packageData.highlights;
    }

    // Localize itinerary
    if (packageData.itinerary) {
      localized.itinerary = packageData.itinerary.map(day => ({
        ...day,
        title: this.getLocalizedText({
          en: day.title,
          ar: day.title_ar
        }, language),
        description: this.getLocalizedText({
          en: day.description,
          ar: day.description_ar
        }, language),
        activities: language === 'ar' && day.activities_ar?.length 
          ? day.activities_ar 
          : day.activities
      }));
    }

    // Format duration
    if (packageData.duration) {
      localized.formattedDuration = this.formatDuration(packageData.duration, language);
    }

    return localized;
  }

  getLanguageDirection(language) {
    return language === 'ar' ? 'rtl' : 'ltr';
  }

  isRTL(language) {
    return language === 'ar';
  }

  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  validateLanguage(language) {
    return this.supportedLanguages.includes(language) ? language : this.defaultLanguage;
  }
}

module.exports = new LocalizationService();