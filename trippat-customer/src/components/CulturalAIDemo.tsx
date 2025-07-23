'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { 
  Globe, 
  Shield, 
  Clock, 
  Users, 
  Star, 
  Calendar,
  MapPin,
  Book,
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { type Locale } from '@/i18n/request'
import { getCurrentCulturalContext, arabicTravelTerms, saudiTravelInsights } from '@/lib/cultural-context'

const CulturalAIDemo: React.FC = () => {
  const t = useTranslations()
  const locale = useLocale() as Locale
  const [activeTab, setActiveTab] = useState<'features' | 'terms' | 'insights'>('features')
  
  const culturalContext = getCurrentCulturalContext(locale)
  
  const features = [
    {
      icon: Globe,
      title: locale === 'ar' ? 'محادثة ثنائية اللغة' : 'Bilingual Conversation',
      description: locale === 'ar' 
        ? 'تبديل سلس بين العربية والإنجليزية أثناء المحادثة'
        : 'Seamless switching between Arabic and English during conversation',
      color: 'blue'
    },
    {
      icon: Users,
      title: locale === 'ar' ? 'مناسب للعائلات' : 'Family-Friendly',
      description: locale === 'ar'
        ? 'أنشطة ووجهات مناسبة للأطفال والعائلات'
        : 'Child and family-appropriate activities and destinations',
      color: 'orange'
    },
    {
      icon: Star,
      title: locale === 'ar' ? 'التراث الثقافي' : 'Cultural Heritage',
      description: locale === 'ar'
        ? 'معلومات عن المواقع التاريخية والثقافية'
        : 'Information about historical and cultural sites',
      color: 'yellow'
    },
    {
      icon: Calendar,
      title: locale === 'ar' ? 'الأعياد والمواسم' : 'Holidays & Seasons',
      description: locale === 'ar'
        ? 'وعي بالمواسم الثقافية والأعياد الوطنية'
        : 'Awareness of cultural seasons and national holidays',
      color: 'red'
    }
  ]

  const arabicTermsArray = Object.entries(arabicTravelTerms).slice(0, 6)
  const saudiRegions = saudiTravelInsights.regions.slice(0, 3)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">
            {locale === 'ar' ? 'مساعد السفر الذكي الثقافي' : 'Cultural AI Travel Assistant'}
          </h2>
        </div>
        <p className="text-gray-600">
          {locale === 'ar' 
            ? 'ذكاء اصطناعي متقدم مع فهم عميق للثقافة العربية'
            : 'Advanced AI with deep understanding of Arabic culture'
          }
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'features', label: locale === 'ar' ? 'الميزات' : 'Features', icon: CheckCircle },
          { id: 'terms', label: locale === 'ar' ? 'المصطلحات' : 'Terms', icon: Book },
          { id: 'insights', label: locale === 'ar' ? 'الرؤى' : 'Insights', icon: MapPin }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-md transition-all flex-1
              ${activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <tab.icon className="h-4 w-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Features Tab */}
      {activeTab === 'features' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className={`
                  p-2 rounded-lg
                  ${feature.color === 'blue' ? 'bg-blue-100 text-blue-600' : ''}
                  ${feature.color === 'green' ? 'bg-green-100 text-green-600' : ''}
                  ${feature.color === 'purple' ? 'bg-purple-100 text-purple-600' : ''}
                  ${feature.color === 'orange' ? 'bg-orange-100 text-orange-600' : ''}
                  ${feature.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' : ''}
                  ${feature.color === 'red' ? 'bg-red-100 text-red-600' : ''}
                `}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Terms Tab */}
      {activeTab === 'terms' && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {locale === 'ar' ? 'مصطلحات السفر العربية' : 'Arabic Travel Terms'}
            </h3>
            <p className="text-gray-600">
              {locale === 'ar' 
                ? 'مصطلحات أساسية للسفر باللغة العربية'
                : 'Essential travel terms in Arabic language'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {arabicTermsArray.map(([key, term]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl font-bold text-gray-900">{term.arabic}</span>
                  <span className="text-sm text-gray-500">{term.transliteration}</span>
                </div>
                <p className="text-gray-700 mb-2">{term.english}</p>
                <div className="text-sm text-gray-600">
                  <div className="mb-1">
                    <strong>{locale === 'ar' ? 'مثال:' : 'Example:'}</strong>
                  </div>
                  <p className="italic">{term.usage[locale]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {locale === 'ar' ? 'رؤى السفر السعودي' : 'Saudi Travel Insights'}
            </h3>
            <p className="text-gray-600">
              {locale === 'ar' 
                ? 'معلومات محلية عن المناطق السعودية'
                : 'Local insights about Saudi regions'
              }
            </p>
          </div>
          
          <div className="space-y-4">
            {saudiRegions.map((region) => (
              <div key={region.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {region.name[locale]}
                    </h4>
                    <p className="text-gray-600">{region.climate[locale]}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">
                      {locale === 'ar' ? 'أفضل وقت:' : 'Best time:'}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      {region.bestTime[locale]}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">
                      {locale === 'ar' ? 'المعالم الرئيسية:' : 'Main Attractions:'}
                    </h5>
                    <ul className="space-y-1">
                      {region.attractions.slice(0, 2).map((attraction, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{attraction.name[locale]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">
                      {locale === 'ar' ? 'النقل:' : 'Transportation:'}
                    </h5>
                    <ul className="space-y-1">
                      {region.transportation[locale].slice(0, 2).map((transport, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <ArrowRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{transport}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Context Info */}
      <div className="mt-8 bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">
          {locale === 'ar' ? 'السياق الثقافي الحالي:' : 'Current Cultural Context:'}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-blue-700">
            <span className="font-medium">
              {locale === 'ar' ? 'اللغة:' : 'Language:'}
            </span>
            <br />
            {locale === 'ar' ? 'العربية' : 'English'}
          </div>
          <div className="text-blue-700">
            <span className="font-medium">
              {locale === 'ar' ? 'محتوى محافظ:' : 'Conservative Content:'}
            </span>
            <br />
            {culturalContext.preferences.conservativeDress 
              ? (locale === 'ar' ? 'مطلوب' : 'Required')
              : (locale === 'ar' ? 'اختياري' : 'Optional')
            }
          </div>
          <div className="text-blue-700">
            <span className="font-medium">
              {locale === 'ar' ? 'خالي من الكحول:' : 'Alcohol-Free:'}
            </span>
            <br />
            {culturalContext.preferences.alcoholFree 
              ? (locale === 'ar' ? 'مطلوب' : 'Required')
              : (locale === 'ar' ? 'اختياري' : 'Optional')
            }
          </div>
          <div className="text-blue-700">
            <span className="font-medium">
              {locale === 'ar' ? 'عائلي:' : 'Family-Friendly:'}
            </span>
            <br />
            {culturalContext.preferences.familyFriendly 
              ? (locale === 'ar' ? 'مطلوب' : 'Required')
              : (locale === 'ar' ? 'اختياري' : 'Optional')
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default CulturalAIDemo