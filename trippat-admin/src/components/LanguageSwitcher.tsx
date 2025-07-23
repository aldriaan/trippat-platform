'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe, Languages, Eye, Monitor } from 'lucide-react';

interface LanguageSwitcherProps {
  currentLanguage: 'en' | 'ar';
  onLanguageChange: (language: 'en' | 'ar') => void;
  showPreviewMode?: boolean;
  previewMode?: 'desktop' | 'mobile';
  onPreviewModeChange?: (mode: 'desktop' | 'mobile') => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLanguage,
  onLanguageChange,
  showPreviewMode = false,
  previewMode = 'desktop',
  onPreviewModeChange
}) => {
  const [rtlMode, setRtlMode] = useState(false);

  useEffect(() => {
    // Apply RTL mode when Arabic is selected
    if (currentLanguage === 'ar') {
      setRtlMode(true);
      document.documentElement.dir = 'rtl';
      document.documentElement.className = `${document.documentElement.className} rtl`;
    } else {
      setRtlMode(false);
      document.documentElement.dir = 'ltr';
      document.documentElement.className = document.documentElement.className.replace(' rtl', '');
    }
  }, [currentLanguage]);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' }
  ];

  const handleLanguageSelect = (languageCode: string) => {
    onLanguageChange(languageCode as 'en' | 'ar');
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <div className="flex items-center gap-3">
      {/* Language Selector */}
      <div className="flex items-center gap-2">
        <Select value={currentLanguage} onValueChange={handleLanguageSelect}>
          <SelectTrigger className="w-[140px]">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentLang?.flag}</span>
                <span className="text-sm font-medium">{currentLang?.name}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {languages.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{language.flag}</span>
                  <span className="text-sm font-medium">{language.name}</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {language.dir.toUpperCase()}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* RTL Indicator */}
      {rtlMode && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Languages className="h-3 w-3" />
          RTL Mode
        </Badge>
      )}

      {/* Preview Mode Selector */}
      {showPreviewMode && onPreviewModeChange && (
        <div className="flex items-center gap-2">
          <Select value={previewMode} onValueChange={onPreviewModeChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue>
                <div className="flex items-center gap-2">
                  {previewMode === 'desktop' ? 
                    <Monitor className="h-4 w-4" /> : 
                    <Globe className="h-4 w-4" />
                  }
                  <span className="text-sm capitalize">{previewMode}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desktop">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <span>Desktop</span>
                </div>
              </SelectItem>
              <SelectItem value="mobile">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>Mobile</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Preview Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => window.open('/preview', '_blank')}
      >
        <Eye className="h-4 w-4" />
        Preview
      </Button>
    </div>
  );
};

export default LanguageSwitcher;