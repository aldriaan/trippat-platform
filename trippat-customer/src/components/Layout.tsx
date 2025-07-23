'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { MessageCircle, Globe } from 'lucide-react'
import { type Locale } from '@/i18n/request'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import AIChat from '@/components/AIChat'
import Link from 'next/link'
import Image from 'next/image'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const t = useTranslations()
  const locale = useLocale() as Locale
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="h-[51px] w-[150px] relative">
                  <Image
                    src="/trippat-logo.png?v=2"
                    alt="Trippat Logo"
                    fill
                    className="object-fill"
                    priority
                  />
                </div>
              </Link>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
              <Link href="/" className="text-gray-700 hover:text-primary transition-colors">
                {t('nav.home')}
              </Link>
              <Link href="/packages" className="text-gray-700 hover:text-primary transition-colors">
                {t('nav.packages')}
              </Link>
              <Link href="/activities" className="text-gray-700 hover:text-primary transition-colors">
                {locale === 'ar' ? 'الأنشطة' : 'Activities'}
              </Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-primary transition-colors">
                {t('nav.dashboard')}
              </Link>
              <Link href="/auth/login" className="text-gray-700 hover:text-primary transition-colors">
                {t('nav.login')}
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <LanguageSwitcher />
              <button
                onClick={() => setIsChatOpen(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">{t('hero.aiAssistant')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <div className="h-[51px] w-[150px] relative">
                  <Image
                    src="/trippat-logo.png?v=2"
                    alt="Trippat Logo"
                    fill
                    className="object-fill"
                  />
                </div>
              </div>
              <p className="text-gray-400">
                {t('home.features.subtitle')}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-4 uppercase tracking-wide">
                {t('home.companySection')}
              </h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.about')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.support')}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-4 uppercase tracking-wide">
                {t('home.legalSection')}
              </h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-4 uppercase tracking-wide">
                {t('footer.followUs')}
              </h4>
              <div className="flex space-x-4 rtl:space-x-reverse">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323C5.902 8.198 7.053 7.708 8.35 7.708s2.448.49 3.323 1.297c.877.877 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 {t('home.brandName')}. {t('home.allRightsReserved')}.</p>
          </div>
        </div>
      </footer>

      {/* AI Chat Modal */}
      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  )
}

export default Layout