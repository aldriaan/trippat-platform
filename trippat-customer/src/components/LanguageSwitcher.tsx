'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { locales, type Locale } from '@/i18n/request'

const LanguageSwitcher = () => {
  const t = useTranslations('nav')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const languages = {
    en: { name: t('english'), flag: '🇺🇸', dir: 'ltr' },
    ar: { name: t('arabic'), flag: '🇸🇦', dir: 'rtl' }
  }

  const currentLanguage = languages[locale as keyof typeof languages]

  const handleLanguageChange = (newLocale: Locale) => {
    const currentPath = pathname.split('/').slice(2).join('/')
    const newPath = `/${newLocale}${currentPath ? `/${currentPath}` : ''}`
    
    setIsOpen(false)
    router.push(newPath)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm text-gray-700 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
        aria-label={t('language')}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLanguage.flag}</span>
        <span className="hidden md:inline">{currentLanguage.name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 min-w-[140px] dropdown-menu">
          {locales.map((loc) => {
            const language = languages[loc as keyof typeof languages]
            return (
              <button
                key={loc}
                onClick={() => handleLanguageChange(loc)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-3 rtl:space-x-reverse rtl:text-right ${
                  loc === locale ? 'bg-secondary/20 text-primary' : 'text-gray-700'
                }`}
              >
                <span className="text-base">{language.flag}</span>
                <span className="flex-1">{language.name}</span>
                {loc === locale && (
                  <span className="text-primary">✓</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher