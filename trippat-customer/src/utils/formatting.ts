import { type Locale, getCurrencyByLocale } from '@/i18n/request'
import moment from 'moment'
import 'moment-hijri'

declare module 'moment' {
  interface Moment {
    iYear(): number
    iMonth(): number
    iDate(): number
    iDayOfYear(): number
    iWeek(): number
    iWeekday(): number
    iDays(): number
    iDaysInMonth(): number
    iWeeksInYear(): number
    iFormat(format?: string): string
    iAdd(input: moment.DurationInputArg1, unit?: moment.DurationInputArg2): Moment
    iSubtract(input: moment.DurationInputArg1, unit?: moment.DurationInputArg2): Moment
    iStartOf(unit: moment.unitOfTime.StartOf): Moment
    iEndOf(unit: moment.unitOfTime.StartOf): Moment
    iIsLeapYear(): boolean
    iWeeksInYear(): number
    iWeekYear(): number
    iISOWeekYear(): number
    iISOWeek(): number
    iISOWeekday(): number
    iDayOfWeek(): number
    iWeekOfYear(): number
    itoDate(): Date
    iFromNow(): string
    iCalendar(): string
    iSameOrBefore(date: moment.MomentInput, unit?: moment.unitOfTime.StartOf): boolean
    iSameOrAfter(date: moment.MomentInput, unit?: moment.unitOfTime.StartOf): boolean
    iSame(date: moment.MomentInput, unit?: moment.unitOfTime.StartOf): boolean
    iIsSame(date: moment.MomentInput, unit?: moment.unitOfTime.StartOf): boolean
    iIsAfter(date: moment.MomentInput, unit?: moment.unitOfTime.StartOf): boolean
    iIsBefore(date: moment.MomentInput, unit?: moment.unitOfTime.StartOf): boolean
    iDiff(date: moment.MomentInput, unit?: moment.unitOfTime.Diff, precise?: boolean): number
    iIsValid(): boolean
    iClone(): Moment
    iSet(unit: moment.unitOfTime.All, value: number): Moment
    iGet(unit: moment.unitOfTime.All): number
    iLocal(): Moment
    iUtc(): Moment
    iToISOString(): string
    iToJSON(): string
    iToString(): string
    iToArray(): number[]
    iToObject(): moment.MomentObjectOutput
    iCalendar(refTime?: moment.MomentInput, formats?: moment.CalendarSpec): string
    iFromNow(withoutSuffix?: boolean): string
    iFrom(inp: moment.MomentInput, withoutSuffix?: boolean): string
    iToNow(withoutSuffix?: boolean): string
    iTo(inp: moment.MomentInput, withoutSuffix?: boolean): string
    iUnix(): number
    iValueOf(): number
    iCreationData(): moment.MomentCreationData
    iParsingFlags(): moment.MomentParsingFlags
    iInvalidAt(): number
    iIsDST(): boolean
    iIsDSTShifted(): boolean
    iIsLeapYear(): boolean
    iZone(): any
    iUtcOffset(): number
    iUtcOffset(b: number | string): Moment
    iLocale(): string
    iLocale(b: string): Moment
    iLocales(): string[]
    iLocaleData(): moment.Locale
    iMax(...moments: moment.MomentInput[]): Moment
    iMin(...moments: moment.MomentInput[]): Moment
    iIsBetween(a: moment.MomentInput, b: moment.MomentInput, granularity?: moment.unitOfTime.StartOf, inclusivity?: "()" | "[)" | "(]" | "[]"): boolean
    iInspect(): string
  }
}

// Currency formatting
export const formatCurrency = (
  amount: number,
  locale: Locale,
  options?: {
    minimumFractionDigits?: number
    maximumFractionDigits?: number
    showSymbol?: boolean
  }
): string => {
  const currency = getCurrencyByLocale(locale)
  const { minimumFractionDigits = 0, maximumFractionDigits = 2, showSymbol = true } = options || {}

  // Format numbers in Arabic using Arabic-Indic digits
  const formatNumber = (num: number): string => {
    if (locale === 'ar') {
      return num.toLocaleString('ar-SA', {
        minimumFractionDigits,
        maximumFractionDigits,
        useGrouping: true
      })
    }
    return num.toLocaleString('en-US', {
      minimumFractionDigits,
      maximumFractionDigits,
      useGrouping: true
    })
  }

  const formattedAmount = formatNumber(amount)
  
  if (!showSymbol) {
    return formattedAmount
  }

  const symbols: Record<string, Record<string, string>> = {
    USD: { en: '$', ar: 'د.أ' },
    SAR: { en: '﷼', ar: '﷼' }
  }

  const symbol = symbols[currency]?.[locale] || symbols[currency]?.['en'] || '$'
  
  // In Arabic, currency symbol typically comes after the number
  if (locale === 'ar') {
    return `${formattedAmount} ${symbol}`
  }
  
  return `${symbol}${formattedAmount}`
}

// Date formatting
export const formatDate = (
  date: Date | string,
  locale: Locale,
  options?: {
    format?: 'short' | 'medium' | 'long' | 'full'
    calendar?: 'gregorian' | 'hijri'
    includeTime?: boolean
  }
): string => {
  const { format = 'medium', calendar = locale === 'ar' ? 'hijri' : 'gregorian', includeTime = false } = options || {}

  const momentDate = moment(date)

  if (calendar === 'hijri') {
    // Configure moment for Arabic locale
    moment.locale(locale === 'ar' ? 'ar-sa' : 'en')
    
    const hijriFormats = {
      short: 'iYYYY/iMM/iDD',
      medium: 'iDD iMMMM iYYYY',
      long: 'iDD iMMMM iYYYY dddd',
      full: 'iDD iMMMM iYYYY dddd'
    }
    
    let formatString = hijriFormats[format]
    if (includeTime) {
      formatString += ' HH:mm'
    }
    
    return momentDate.iFormat(formatString)
  } else {
    // Gregorian calendar
    const gregorianFormats = {
      short: locale === 'ar' ? 'DD/MM/YYYY' : 'MM/DD/YYYY',
      medium: locale === 'ar' ? 'DD MMMM YYYY' : 'MMMM DD, YYYY',
      long: locale === 'ar' ? 'DD MMMM YYYY dddd' : 'dddd, MMMM DD, YYYY',
      full: locale === 'ar' ? 'DD MMMM YYYY dddd' : 'dddd, MMMM DD, YYYY'
    }
    
    moment.locale(locale === 'ar' ? 'ar-sa' : 'en')
    
    let formatString = gregorianFormats[format]
    if (includeTime) {
      formatString += ' HH:mm'
    }
    
    return momentDate.format(formatString)
  }
}

// Time formatting
export const formatTime = (date: Date | string, locale: Locale, is24Hour: boolean = false): string => {
  const momentDate = moment(date)
  moment.locale(locale === 'ar' ? 'ar-sa' : 'en')
  
  const format = is24Hour ? 'HH:mm' : 'hh:mm A'
  return momentDate.format(format)
}

// Relative time formatting
export const formatRelativeTime = (date: Date | string, locale: Locale): string => {
  const momentDate = moment(date)
  moment.locale(locale === 'ar' ? 'ar-sa' : 'en')
  
  return momentDate.fromNow()
}

// Prayer times formatting (Islamic context)
export const formatPrayerTimes = (
  prayerTimes: { [key: string]: string },
  locale: Locale
): { [key: string]: string } => {
  const prayerNames = {
    en: {
      fajr: 'Fajr',
      dhuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha'
    },
    ar: {
      fajr: 'الفجر',
      dhuhr: 'الظهر',
      asr: 'العصر',
      maghrib: 'المغرب',
      isha: 'العشاء'
    }
  }

  const formattedTimes: { [key: string]: string } = {}
  
  Object.entries(prayerTimes).forEach(([prayer, time]) => {
    const prayerName = prayerNames[locale][prayer as keyof typeof prayerNames.en] || prayer
    const formattedTime = formatTime(time, locale, false)
    formattedTimes[prayerName] = formattedTime
  })

  return formattedTimes
}

// Number formatting for Arabic
export const formatNumber = (num: number, locale: Locale): string => {
  if (locale === 'ar') {
    return num.toLocaleString('ar-SA', { useGrouping: true })
  }
  return num.toLocaleString('en-US', { useGrouping: true })
}

// Duration formatting
export const formatDuration = (
  days: number,
  nights: number,
  locale: Locale
): string => {
  if (locale === 'ar') {
    const daysText = days === 1 ? 'يوم' : days === 2 ? 'يومان' : `${formatNumber(days, locale)} أيام`
    const nightsText = nights === 1 ? 'ليلة' : nights === 2 ? 'ليلتان' : `${formatNumber(nights, locale)} ليال`
    return `${daysText} / ${nightsText}`
  }
  
  const daysText = days === 1 ? 'day' : 'days'
  const nightsText = nights === 1 ? 'night' : 'nights'
  return `${formatNumber(days, locale)} ${daysText} / ${formatNumber(nights, locale)} ${nightsText}`
}

// Phone number formatting
export const formatPhoneNumber = (phone: string, locale: Locale): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  if (locale === 'ar') {
    // Saudi Arabia phone number format
    if (cleaned.startsWith('966')) {
      const formatted = cleaned.replace(/^966/, '+966 ')
      return formatted.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3')
    }
    if (cleaned.startsWith('05')) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3')
    }
  }
  
  // US phone number format
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4')
  }
  
  return phone
}

// Distance formatting
export const formatDistance = (
  distance: number,
  locale: Locale,
  unit: 'km' | 'miles' = 'km'
): string => {
  const formattedDistance = formatNumber(distance, locale)
  
  if (locale === 'ar') {
    const unitText = unit === 'km' ? 'كم' : 'ميل'
    return `${formattedDistance} ${unitText}`
  }
  
  const unitText = unit === 'km' ? 'km' : unit === 'miles' ? 'miles' : unit
  return `${formattedDistance} ${unitText}`
}