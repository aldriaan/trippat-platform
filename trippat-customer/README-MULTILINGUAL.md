# Trippat - AI-Powered Multilingual Travel Platform

A cutting-edge travel platform that combines artificial intelligence with multilingual support for Arabic and English speakers, featuring cultural context awareness and RTL/LTR layout optimization.

## 🌟 Features

### 🤖 AI-Powered Travel Assistant
- **Multilingual Support**: Seamless conversations in Arabic and English
- **Cultural Context**: Understands Islamic culture, halal food preferences, prayer times
- **Personalized Recommendations**: Tailored travel suggestions based on cultural needs
- **Real-time Chat**: Instant responses with cultural sensitivity

### 🌍 Internationalization
- **RTL/LTR Support**: Proper layout for Arabic (RTL) and English (LTR)
- **Arabic Typography**: Noto Sans Arabic font with optimized line spacing
- **Localized Content**: Complete translations for all interface elements
- **Cultural Formatting**: Date, currency, and number formatting per locale

### 🕌 Cultural Features
- **Halal Food Options**: Restaurants and food recommendations
- **Prayer Times**: Integration with prayer time information
- **Islamic Heritage**: Historical and cultural site recommendations
- **Family-Friendly**: Curated content suitable for Muslim families

### 💰 Smart Pricing
- **Multi-Currency**: USD for English, SAR for Arabic
- **Dynamic Pricing**: Real-time price updates
- **Cultural Pricing**: Localized pricing strategies

### 📅 Calendar Systems
- **Gregorian Calendar**: Standard international dating
- **Hijri Calendar**: Islamic lunar calendar support
- **Dual Format**: Display both calendar systems when relevant

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key
- MongoDB (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trippat-customer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # OpenAI API Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Application Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   
   # Feature Flags
   NEXT_PUBLIC_ENABLE_CHAT=true
   NEXT_PUBLIC_ENABLE_MULTILINGUAL=true
   NEXT_PUBLIC_ENABLE_CULTURAL_CONTEXT=true
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - English: `http://localhost:3000/en`
   - Arabic: `http://localhost:3000/ar`

## 🛠️ Technical Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **next-intl**: Internationalization library
- **Lucide React**: Icon library

### AI & Language Processing
- **OpenAI GPT-4**: Advanced language model
- **Cultural Context AI**: Custom prompts for cultural sensitivity
- **Multilingual Processing**: Arabic and English language support

### Internationalization
- **next-intl**: Complete i18n solution
- **Noto Sans Arabic**: Arabic font optimization
- **RTL Support**: Right-to-left layout system
- **Locale Routing**: URL-based language switching

## 📁 Project Structure

```
src/
├── app/
│   ├── [locale]/          # Locale-specific pages
│   │   ├── page.tsx       # Home page
│   │   ├── layout.tsx     # Locale layout
│   │   └── api/
│   │       └── chat/      # AI chat API
│   ├── globals.css        # Global styles with RTL support
│   └── layout.tsx         # Root layout
├── components/
│   ├── AIChat.tsx         # AI chat interface
│   └── LanguageSwitcher.tsx # Language switching component
├── contexts/
│   └── AuthContext.tsx    # Authentication context
├── i18n/
│   ├── config.ts          # i18n configuration
│   └── messages/          # Translation files
│       ├── en.json        # English translations
│       └── ar.json        # Arabic translations
├── utils/
│   └── formatting.ts      # Locale-specific formatting
└── middleware.ts          # Next.js middleware for i18n
```

## 🎨 Design Features

### RTL (Right-to-Left) Support
- **Layout Mirroring**: Automatic layout direction switching
- **Text Alignment**: Proper text alignment for Arabic
- **Navigation**: RTL-optimized navigation menus
- **Forms**: RTL-compatible form inputs and validation

### Arabic Typography
- **Font Selection**: Noto Sans Arabic for optimal readability
- **Line Height**: Increased line spacing for Arabic text
- **Word Spacing**: Optimized spacing for Arabic scripts
- **Number Formatting**: Arabic-Indic numerals support

### Cultural UI Elements
- **Prayer Time Icons**: Visual indicators for Islamic features
- **Halal Badges**: Clear halal food identification
- **Family Indicators**: Family-friendly content markers
- **Heritage Symbols**: Islamic heritage site indicators

## 🤖 AI Chat Features

### Multilingual Conversations
- **Language Detection**: Automatic language recognition
- **Context Switching**: Seamless language switching mid-conversation
- **Cultural Adaptation**: Responses adapted to cultural context

### Cultural Intelligence
- **Halal Recommendations**: Food and restaurant suggestions
- **Prayer Time Awareness**: Travel planning with prayer considerations
- **Family Planning**: Family-friendly activity suggestions
- **Heritage Focus**: Islamic historical site recommendations

### Smart Suggestions
- **Popular Questions**: Pre-defined culturally relevant questions
- **Context Badges**: Visual indicators for cultural features
- **Personalized Responses**: Tailored to user's cultural background

## 📱 Mobile Optimization

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Touch-Friendly**: Large touch targets for mobile interaction
- **Adaptive Layout**: Layout adjusts to screen size

### Mobile Chat Experience
- **Swipe Gestures**: Natural mobile navigation
- **Keyboard Handling**: Proper keyboard interaction
- **Voice Input**: Future voice input support

## 🔧 Configuration

### Language Configuration
```typescript
// i18n/config.ts
export const locales = ['en', 'ar'] as const
export const defaultLocale = 'en' as const

export const localeConfig = {
  locales,
  defaultLocale,
  domains: {
    en: { currency: 'USD', dateFormat: 'gregorian', direction: 'ltr' },
    ar: { currency: 'SAR', dateFormat: 'hijri', direction: 'rtl' }
  }
}
```

### AI Configuration
```typescript
// Custom system prompts for cultural context
const getSystemPrompt = (locale: Locale): string => {
  if (locale === 'ar') {
    return `أنت مساعد سفر ذكي متخصص في تقديم توصيات السفر للمسافرين الناطقين بالعربية...`
  }
  return `You are an AI travel assistant specializing in personalized travel recommendations...`
}
```

## 🚀 Deployment

### Environment Variables
Set the following environment variables in your deployment:
- `OPENAI_API_KEY`: Your OpenAI API key
- `NEXT_PUBLIC_APP_URL`: Your app's URL
- `NEXT_PUBLIC_API_URL`: Your API endpoint

### Build Commands
```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please contact our development team or create an issue in the repository.

## 🌟 Future Enhancements

- **Voice Input**: Arabic and English voice recognition
- **Offline Mode**: Cached translations for offline use
- **Regional Dialects**: Support for different Arabic dialects
- **Advanced Cultural Features**: More nuanced cultural recommendations
- **Integration APIs**: Prayer times, weather, currency exchange
- **Mobile App**: Native mobile application development

---

**Made with ❤️ for the global Muslim travel community**