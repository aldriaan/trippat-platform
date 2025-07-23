'use client'

import Image from 'next/image'
import { type Locale } from '@/i18n/request'

interface PriceDisplayProps {
  amount: number
  locale: Locale
  className?: string
  showSymbol?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const PriceDisplay = ({ 
  amount, 
  locale, 
  className = '', 
  showSymbol = true, 
  size = 'md' 
}: PriceDisplayProps) => {
  // Format numbers in Arabic using Arabic-Indic digits
  const formatNumber = (num: number): string => {
    if (locale === 'ar') {
      return num.toLocaleString('ar-SA', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        useGrouping: true
      })
    }
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true
    })
  }

  const formattedAmount = formatNumber(amount)
  
  if (!showSymbol) {
    return <span className={className}>{formattedAmount}</span>
  }

  const symbolSize = {
    sm: { width: 12, height: 12 },
    md: { width: 16, height: 16 },
    lg: { width: 20, height: 20 }
  }

  const { width, height } = symbolSize[size]

  // In Arabic, currency symbol typically comes after the number
  if (locale === 'ar') {
    return (
      <span className={`inline-flex items-center gap-1 ${className}`}>
        <span>{formattedAmount}</span>
        <Image
          src="/saudi-riyal-symbol.png"
          alt="Saudi Riyal"
          width={width}
          height={height}
          className="inline-block"
        />
      </span>
    )
  }
  
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <Image
        src="/saudi-riyal-symbol.png"
        alt="Saudi Riyal"
        width={width}
        height={height}
        className="inline-block"
      />
      <span>{formattedAmount}</span>
    </span>
  )
}

export default PriceDisplay