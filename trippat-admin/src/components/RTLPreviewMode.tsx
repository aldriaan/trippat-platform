'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  AlignRight, 
  AlignLeft, 
  Eye, 
  RefreshCw,
  Languages,
  Globe,
  Settings,
  Check,
  X
} from 'lucide-react';

interface RTLPreviewModeProps {
  content: {
    title: string;
    title_ar?: string;
    description: string;
    description_ar?: string;
    destination: string;
    destination_ar?: string;
    inclusions?: string[];
    inclusions_ar?: string[];
    exclusions?: string[];
    exclusions_ar?: string[];
    highlights?: string[];
    highlights_ar?: string[];
    price?: number;
    price_sar?: number;
    duration?: number;
    maxTravelers?: number;
    itinerary?: Array<{
      day: number;
      title: string;
      title_ar?: string;
      description: string;
      description_ar?: string;
      activities?: string[];
      activities_ar?: string[];
    }>;
    images?: string[];
  };
  language: 'en' | 'ar';
  onLanguageChange: (language: 'en' | 'ar') => void;
}

const RTLPreviewMode: React.FC<RTLPreviewModeProps> = ({
  content,
  language,
  onLanguageChange
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showLayoutGrid, setShowLayoutGrid] = useState(false);
  const [currentTab, setCurrentTab] = useState('overview');

  const isRTL = language === 'ar';

  const deviceDimensions = {
    desktop: 'w-full max-w-6xl',
    tablet: 'w-full max-w-2xl',
    mobile: 'w-full max-w-sm'
  };

  const getLocalizedText = (enText: string, arText?: string) => {
    return language === 'ar' && arText ? arText : enText;
  };

  const getLocalizedArray = (enArray: string[], arArray?: string[]) => {
    return language === 'ar' && arArray?.length ? arArray : enArray;
  };

  const DeviceFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className={`mx-auto ${deviceDimensions[device]} transition-all duration-300`}>
      <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${showLayoutGrid ? 'border-2 border-dashed border-blue-300' : ''}`}>
        {children}
      </div>
    </div>
  );

  const RTLAwareSection: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
    children, 
    className = '' 
  }) => (
    <div 
      className={`${className} ${isRTL ? 'text-right' : 'text-left'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {children}
    </div>
  );

  const ImageGallery: React.FC = () => (
    <div className="relative">
      <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
        {content.images && content.images.length > 0 ? (
          <img 
            src={content.images[0]} 
            alt={getLocalizedText(content.title, content.title_ar)}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-gray-500">No images available</div>
        )}
      </div>
      {content.images && content.images.length > 1 && (
        <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'}`}>
          <Badge variant="secondary">
            +{content.images.length - 1} more
          </Badge>
        </div>
      )}
    </div>
  );

  const PackageHeader: React.FC = () => (
    <RTLAwareSection className="p-6 border-b">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getLocalizedText(content.title, content.title_ar)}
            </h1>
            <div className="flex items-center gap-2 text-gray-600">
              <Globe className="h-4 w-4" />
              <span>{getLocalizedText(content.destination, content.destination_ar)}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {language === 'ar' && content.price_sar ? 
                `${content.price_sar} ر.س` : 
                `$${content.price || 0}`
              }
            </div>
            <div className="text-sm text-gray-500">
              {language === 'ar' ? 'للشخص الواحد' : 'per person'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span>{content.duration || 0}</span>
            <span>{language === 'ar' ? 'أيام' : 'days'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>{language === 'ar' ? 'حتى' : 'Up to'}</span>
            <span>{content.maxTravelers || 0}</span>
            <span>{language === 'ar' ? 'مسافرين' : 'travelers'}</span>
          </div>
        </div>
      </div>
    </RTLAwareSection>
  );

  const PackageDescription: React.FC = () => (
    <RTLAwareSection className="p-6 border-b">
      <h2 className="text-xl font-semibold mb-4">
        {language === 'ar' ? 'نظرة عامة' : 'Overview'}
      </h2>
      <p className="text-gray-700 leading-relaxed">
        {getLocalizedText(content.description, content.description_ar)}
      </p>
    </RTLAwareSection>
  );

  const PackageHighlights: React.FC = () => {
    const highlights = getLocalizedArray(content.highlights || [], content.highlights_ar);
    
    if (highlights.length === 0) return null;

    return (
      <RTLAwareSection className="p-6 border-b">
        <h2 className="text-xl font-semibold mb-4">
          {language === 'ar' ? 'أبرز المعالم' : 'Highlights'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {highlights.map((highlight, index) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{highlight}</span>
            </div>
          ))}
        </div>
      </RTLAwareSection>
    );
  };

  const PackageInclusions: React.FC = () => {
    const inclusions = getLocalizedArray(content.inclusions || [], content.inclusions_ar);
    const exclusions = getLocalizedArray(content.exclusions || [], content.exclusions_ar);

    return (
      <RTLAwareSection className="p-6 border-b">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {inclusions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-700">
                {language === 'ar' ? 'ما يشمله' : 'Included'}
              </h3>
              <ul className="space-y-2">
                {inclusions.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {exclusions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-700">
                {language === 'ar' ? 'ما لا يشمله' : 'Not Included'}
              </h3>
              <ul className="space-y-2">
                {exclusions.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </RTLAwareSection>
    );
  };

  const PackageItinerary: React.FC = () => {
    if (!content.itinerary || content.itinerary.length === 0) return null;

    return (
      <RTLAwareSection className="p-6">
        <h2 className="text-xl font-semibold mb-6">
          {language === 'ar' ? 'برنامج الرحلة' : 'Itinerary'}
        </h2>
        <div className="space-y-6">
          {content.itinerary.map((day, index) => (
            <div key={index} className="border-l-4 border-primary pl-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {day.day}
                </div>
                <h3 className="text-lg font-semibold">
                  {getLocalizedText(day.title, day.title_ar)}
                </h3>
              </div>
              <p className="text-gray-700 mb-3">
                {getLocalizedText(day.description, day.description_ar)}
              </p>
              {day.activities && day.activities.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">
                    {language === 'ar' ? 'الأنشطة:' : 'Activities:'}
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {getLocalizedArray(day.activities, day.activities_ar).map((activity, actIndex) => (
                      <li key={actIndex} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </RTLAwareSection>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Preview Controls */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Languages className="h-3 w-3" />
                RTL Preview Mode
              </Badge>
              
              {/* Device Selector */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={device === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDevice('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={device === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDevice('tablet')}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={device === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDevice('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>

              {/* Language Selector */}
              <Select value={language} onValueChange={onLanguageChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">
                    <div className="flex items-center gap-2">
                      <span>🇺🇸</span>
                      <span>English</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ar">
                    <div className="flex items-center gap-2">
                      <span>🇸🇦</span>
                      <span>العربية</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLayoutGrid(!showLayoutGrid)}
              >
                <Settings className="h-4 w-4" />
                {showLayoutGrid ? 'Hide Grid' : 'Show Grid'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="max-w-7xl mx-auto p-6">
        <DeviceFrame>
          {/* Navigation Tabs */}
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <div className="border-b">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview">
                  {language === 'ar' ? 'نظرة عامة' : 'Overview'}
                </TabsTrigger>
                <TabsTrigger value="itinerary">
                  {language === 'ar' ? 'برنامج الرحلة' : 'Itinerary'}
                </TabsTrigger>
                <TabsTrigger value="details">
                  {language === 'ar' ? 'التفاصيل' : 'Details'}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="m-0">
              <ImageGallery />
              <PackageHeader />
              <PackageDescription />
              <PackageHighlights />
            </TabsContent>

            <TabsContent value="itinerary" className="m-0">
              <PackageItinerary />
            </TabsContent>

            <TabsContent value="details" className="m-0">
              <PackageInclusions />
            </TabsContent>
          </Tabs>
        </DeviceFrame>
      </div>

      {/* RTL Layout Guidelines */}
      {isRTL && (
        <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlignRight className="h-4 w-4 text-primary" />
            <span className="font-medium">RTL Layout Active</span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Text alignment: Right-to-left</p>
            <p>• Navigation: Mirrored layout</p>
            <p>• Icons: Contextually flipped</p>
            <p>• Reading flow: Right to left</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RTLPreviewMode;