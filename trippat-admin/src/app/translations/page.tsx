import { Metadata } from 'next'
import TranslationManager from '@/components/TranslationManager'

export const metadata: Metadata = {
  title: 'Translation Manager - Trippat Admin',
  description: 'Manage Arabic translations for travel packages',
}

export default function TranslationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <TranslationManager />
    </div>
  )
}