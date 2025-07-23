import { Inter } from 'next/font/google'
import { Noto_Sans_Arabic } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, type Locale, getDirectionByLocale } from '@/i18n/request'
import AuthProvider from '@/contexts/AuthContext'
import '../globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const notoSansArabic = Noto_Sans_Arabic({ 
  subsets: ['arabic'],
  variable: '--font-noto-sans-arabic',
  display: 'swap'
})

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  
  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const messages = await getMessages({ locale })
  const direction = getDirectionByLocale(locale as Locale)
  const fontClass = locale === 'ar' ? notoSansArabic.variable : inter.variable

  return (
    <html lang={locale} dir={direction} className={`${inter.variable} ${notoSansArabic.variable}`}>
      <body className={`${fontClass} antialiased`} suppressHydrationWarning={true}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}