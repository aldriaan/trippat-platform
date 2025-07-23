import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

export const locales = ['en', 'ar'] as const
export const defaultLocale = 'en' as const

export type Locale = (typeof locales)[number]

export default getRequestConfig(async ({ locale }) => {
  // If locale is undefined, use the default locale
  if (!locale) {
    locale = defaultLocale
  }
  
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  }
})

export const localeConfig = {
  locales,
  defaultLocale,
  localeDetection: true,
  domains: {
    en: {
      currency: 'SAR',
      dateFormat: 'gregorian',
      direction: 'ltr',
      font: 'inter'
    },
    ar: {
      currency: 'SAR',
      dateFormat: 'hijri',
      direction: 'rtl',
      font: 'noto-sans-arabic'
    }
  }
}

export const getCurrencyByLocale = (locale: Locale) => {
  return localeConfig.domains[locale].currency
}

export const getDirectionByLocale = (locale: Locale) => {
  return localeConfig.domains[locale].direction
}

export const getDateFormatByLocale = (locale: Locale) => {
  return localeConfig.domains[locale].dateFormat
}

export const getFontByLocale = (locale: Locale) => {
  return localeConfig.domains[locale].font
}