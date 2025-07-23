'use client'

import Image from 'next/image'
import { type Locale } from '@/i18n/request'
import { Package } from '@/types/package'

interface DiscountPriceDisplayProps {
  pkg: Package
  locale: Locale
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showSymbol?: boolean
}

export const DiscountPriceDisplay = ({ 
  pkg,
  locale, 
  className = '', 
  size = 'md',
  showSymbol = true
}: DiscountPriceDisplayProps) => {
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

  const originalPrice = pkg.priceAdult || pkg.price || 0;
  const hasDiscount = pkg.discountType && pkg.discountType !== 'none' && pkg.discountValue && pkg.discountValue > 0;
  
  // Calculate discounted price
  let discountedPrice = originalPrice;
  if (hasDiscount) {
    if (pkg.discountType === 'percentage') {
      discountedPrice = originalPrice * (1 - (pkg.discountValue / 100));
    } else if (pkg.discountType === 'fixed_amount') {
      discountedPrice = originalPrice - pkg.discountValue;
    }
    // Ensure discounted price is not negative
    discountedPrice = Math.max(0, discountedPrice);
  }

  const symbolSize = {
    sm: { width: 12, height: 12 },
    md: { width: 16, height: 16 },
    lg: { width: 20, height: 20 }
  }

  const { width, height } = symbolSize[size]

  // If no discount, show regular price
  if (!hasDiscount) {
    const formattedAmount = formatNumber(originalPrice)
    
    if (!showSymbol) {
      return <span className={className}>{formattedAmount}</span>
    }

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

  // Show discounted pricing
  const formattedOriginalPrice = formatNumber(originalPrice);
  const formattedDiscountedPrice = formatNumber(discountedPrice);

  const PriceSymbol = ({ className: imgClassName = "" }) => (
    <Image
      src="/saudi-riyal-symbol.png"
      alt="Saudi Riyal"
      width={width}
      height={height}
      className={`inline-block ${imgClassName}`}
    />
  );

  const SmallPriceSymbol = ({ className: imgClassName = "" }) => (
    <Image
      src="/saudi-riyal-symbol.png"
      alt="Saudi Riyal"
      width={width * 0.75}
      height={height * 0.75}
      className={`inline-block ${imgClassName}`}
    />
  );

  if (locale === 'ar') {
    return (
      <div className={`space-y-1 ${className}`}>
        {/* Main discounted price */}
        <div className="inline-flex items-center gap-1 text-green-600 font-bold">
          <span>{formattedDiscountedPrice}</span>
          {showSymbol && <PriceSymbol />}
        </div>
        
        {/* Original price with strikethrough */}
        <div className="inline-flex items-center gap-1 text-gray-500 text-sm line-through">
          <span>{formattedOriginalPrice}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Main discounted price */}
      <div className="inline-flex items-center gap-1 text-green-600 font-bold">
        {showSymbol && <PriceSymbol />}
        <span>{formattedDiscountedPrice}</span>
      </div>
      
      {/* Original price with strikethrough */}
      <div className="inline-flex items-center gap-1 text-gray-500 text-sm line-through">
        <span>{formattedOriginalPrice}</span>
      </div>
    </div>
  )
}

export default DiscountPriceDisplay