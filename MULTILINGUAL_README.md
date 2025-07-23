# Trippat Backend - Multilingual Support

This document outlines the multilingual features implemented in the Trippat backend system.

## Features Implemented

### 1. Database Schema Updates
- **Package Model**: Added Arabic language fields
  - `title_ar` - Arabic title
  - `description_ar` - Arabic description  
  - `destination_ar` - Arabic destination
  - `inclusions_ar` - Arabic inclusions array
  - `exclusions_ar` - Arabic exclusions array
  - `highlights_ar` - Arabic highlights array
  - `currency` - Package currency (USD/SAR)
  - `price_sar` - Price in Saudi Riyal

- **User Model**: Added language preferences
  - `language` - User's preferred language (en/ar)
  - `currency` - User's preferred currency (USD/SAR)
  - `country` - User's country
  - `timezone` - User's timezone

### 2. API Endpoints

#### Package Endpoints with Language Support
- `GET /api/packages` - Supports `language` and `currency` query parameters
- `GET /api/packages/:id` - Returns localized package data
- `PUT /api/packages/:id/translations` - Update package translations
- `GET /api/packages/:id/translations` - Get all translations for a package
- `GET /api/packages/admin/translation-stats` - Translation completion statistics

#### Translation Management
- `PUT /api/packages/:id/translations` - Update Arabic translations
- `GET /api/packages/admin/translation-stats` - Get translation statistics

### 3. Services

#### Currency Service (`src/services/currencyService.js`)
- Real-time currency conversion (USD ↔ SAR)
- Price formatting with locale support
- Exchange rate caching

#### Localization Service (`src/services/localizationService.js`)
- Cultural date formatting (English/Arabic)
- Duration formatting
- Number formatting
- Package content localization
- RTL/LTR direction support

#### Email Service (`src/services/emailService.js`)
- Multilingual email templates
- Language-specific subject lines
- Localized booking confirmations
- Arabic and English templates

### 4. Email Templates

#### Arabic Templates
- `src/templates/email/booking-confirmation-ar.html`
- `src/templates/invoice/invoice-ar.html`

#### English Templates  
- `src/templates/email/booking-confirmation-en.html`
- `src/templates/invoice/invoice-en.html`

### 5. Admin Dashboard

#### Translation Manager (`trippat-admin/src/components/TranslationManager.tsx`)
- Visual translation interface
- Translation progress tracking
- Field-by-field translation editing
- Translation statistics dashboard

### 6. Multilingual Search

Enhanced search functionality supporting:
- Search in both English and Arabic content
- Language-specific result filtering
- Localized search results

## API Usage Examples

### Get Packages with Language Support
```javascript
// Get packages in Arabic with SAR currency
GET /api/packages?language=ar&currency=SAR

// Response includes localized content
{
  "success": true,
  "data": {
    "packages": [
      {
        "title": "رحلة سفاري الصحراء في دبي",
        "description": "اختبر سحر الصحراء العربية...",
        "destination": "دبي، الإمارات العربية المتحدة",
        "price": 1122.50,
        "currency": "SAR",
        "formattedPrice": "ر.س ١٬١٢٢٫٥٠"
      }
    ]
  }
}
```

### Update Package Translation
```javascript
PUT /api/packages/60a7c8b3f1b2c3d4e5f6a7b8/translations
{
  "language": "ar",
  "title_ar": "رحلة استكشاف اسطنبول",
  "description_ar": "استكشف جمال اسطنبول التاريخي...",
  "destination_ar": "اسطنبول، تركيا"
}
```

### Get Translation Statistics
```javascript
GET /api/packages/admin/translation-stats

// Response
{
  "success": true,
  "data": {
    "totalPackages": 25,
    "arabicTranslations": {
      "title": { "count": 20, "percentage": 80 },
      "description": { "count": 15, "percentage": 60 },
      "destination": { "count": 18, "percentage": 72 }
    },
    "overallCompleteness": 71
  }
}
```

## Cultural Considerations

### Arabic (ar) Support
- **RTL Layout**: Right-to-left text direction
- **Date Formatting**: Arabic date formats (D MMMM, YYYY)
- **Number Formatting**: Arabic-Indic numerals support
- **Currency**: Saudi Riyal (SAR) with proper symbol (ر.س)
- **Cultural Content**: Halal-friendly, prayer-time considerations

### English (en) Support
- **LTR Layout**: Left-to-right text direction
- **Date Formatting**: Western date formats (MMMM Do, YYYY)
- **Number Formatting**: Latin numerals
- **Currency**: US Dollar (USD) with $ symbol

## Configuration

### Environment Variables
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@trippat.com
SUPPORT_PHONE=+966 12 345 6789
SUPPORT_EMAIL=support@trippat.com
EMERGENCY_PHONE=+966 12 345 6789
FRONTEND_URL=http://localhost:3000
```

### Multilingual Configuration
See `src/config/multilingual.js` for complete configuration options including:
- Supported languages
- Currency settings
- Email templates
- Cultural preferences
- Content policies

## Admin Dashboard Usage

1. **Access Translation Manager**: Navigate to `/translations` in admin dashboard
2. **View Translation Stats**: See overall translation completion rates
3. **Edit Translations**: Click "Translate" button on any package
4. **Field-by-Field Editing**: Edit titles, descriptions, inclusions, etc.
5. **Save Changes**: Changes are saved immediately to database

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install moment.js with Arabic locale:
```bash
npm install moment
```

3. Set up environment variables in `.env`

4. Start the server:
```bash
npm run dev
```

## Future Enhancements

- Additional language support (French, German, etc.)
- Automatic translation API integration
- Voice-to-text in Arabic
- Advanced cultural customization
- Mobile-specific formatting
- Offline translation capabilities

## Support

For technical support with multilingual features, contact the development team or refer to the API documentation.