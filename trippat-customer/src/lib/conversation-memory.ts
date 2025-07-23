import { Locale } from '@/i18n/request'
import { CulturalPreferences } from './cultural-context'

export interface ConversationMemory {
  userId?: string
  sessionId: string
  preferredLanguage: Locale
  culturalPreferences: CulturalPreferences
  travelHistory: TravelInteraction[]
  personalPreferences: PersonalPreferences
  conversationContext: ConversationContext
  lastInteraction: Date
  totalInteractions: number
}

export interface TravelInteraction {
  id: string
  timestamp: Date
  userMessage: string
  aiResponse: string
  language: Locale
  travelType: 'family' | 'religious' | 'cultural' | 'business' | 'leisure'
  destinations: string[]
  preferences: {
    budget?: string
    duration?: string
    groupSize?: number
    interests?: string[]
  }
  recommendedPackages?: string[]
  followUpQuestions?: string[]
}

export interface PersonalPreferences {
  name?: string
  title?: string // Mr., Mrs., Dr., etc.
  preferredGreeting?: string
  travelStyle: 'luxury' | 'mid-range' | 'budget' | 'mixed'
  groupType: 'solo' | 'couple' | 'family' | 'friends' | 'business'
  interests: string[]
  dietaryRestrictions: string[]
  mobilityRequirements?: string[]
  languageLevel: {
    arabic: 'native' | 'fluent' | 'intermediate' | 'basic' | 'none'
    english: 'native' | 'fluent' | 'intermediate' | 'basic' | 'none'
  }
  frequentDestinations: string[]
  avoidedDestinations: string[]
  seasonalPreferences: {
    preferred: string[]
    avoided: string[]
  }
  accommodationPreferences: {
    type: 'hotel' | 'apartment' | 'traditional' | 'mixed'
    amenities: string[]
    location: 'city-center' | 'suburban' | 'rural' | 'mixed'
  }
}

export interface ConversationContext {
  currentTopic: string
  previousTopics: string[]
  pendingQuestions: string[]
  userMood: 'excited' | 'curious' | 'concerned' | 'neutral' | 'frustrated'
  conversationFlow: 'greeting' | 'information-gathering' | 'recommendation' | 'booking' | 'follow-up'
  culturalSensitivity: 'high' | 'medium' | 'low'
  needsTranslation: boolean
  hasLanguageMixed: boolean
  recentKeywords: string[]
  contextualHints: string[]
}

class ConversationMemoryManager {
  private conversations: Map<string, ConversationMemory> = new Map()
  private readonly STORAGE_KEY = 'trippat_conversation_memory'
  private readonly MAX_HISTORY = 50 // Maximum number of interactions to keep

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        Object.entries(data).forEach(([sessionId, memory]) => {
          this.conversations.set(sessionId, {
            ...memory as ConversationMemory,
            lastInteraction: new Date((memory as any).lastInteraction),
            travelHistory: (memory as any).travelHistory.map((interaction: any) => ({
              ...interaction,
              timestamp: new Date(interaction.timestamp)
            }))
          })
        })
      }
    } catch (error) {
      console.error('Error loading conversation memory:', error)
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return

    try {
      const data = Object.fromEntries(this.conversations.entries())
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving conversation memory:', error)
    }
  }

  public getOrCreateMemory(sessionId: string, locale: Locale): ConversationMemory {
    let memory = this.conversations.get(sessionId)
    
    if (!memory) {
      memory = {
        sessionId,
        preferredLanguage: locale,
        culturalPreferences: this.getDefaultCulturalPreferences(locale),
        travelHistory: [],
        personalPreferences: this.getDefaultPersonalPreferences(locale),
        conversationContext: this.getDefaultConversationContext(),
        lastInteraction: new Date(),
        totalInteractions: 0
      }
      this.conversations.set(sessionId, memory)
    }

    return memory
  }

  private getDefaultCulturalPreferences(locale: Locale): CulturalPreferences {
    return {
      familyFriendly: true,
      conservativeDress: locale === 'ar',
      ramadanConscious: locale === 'ar',
      hajjSeasonAware: locale === 'ar',
      genderSeparation: locale === 'ar',
      alcoholFree: locale === 'ar',
      fridayPrayers: locale === 'ar'
    }
  }

  private getDefaultPersonalPreferences(locale: Locale): PersonalPreferences {
    return {
      travelStyle: 'mid-range',
      groupType: 'family',
      interests: [],
      dietaryRestrictions: [],
      languageLevel: {
        arabic: locale === 'ar' ? 'native' : 'none',
        english: locale === 'en' ? 'native' : 'basic'
      },
      frequentDestinations: [],
      avoidedDestinations: [],
      seasonalPreferences: {
        preferred: [],
        avoided: []
      },
      accommodationPreferences: {
        type: 'hotel',
        amenities: [],
        location: 'city-center'
      }
    }
  }

  private getDefaultConversationContext(): ConversationContext {
    return {
      currentTopic: '',
      previousTopics: [],
      pendingQuestions: [],
      userMood: 'neutral',
      conversationFlow: 'greeting',
      culturalSensitivity: 'high',
      needsTranslation: false,
      hasLanguageMixed: false,
      recentKeywords: [],
      contextualHints: []
    }
  }

  public addInteraction(
    sessionId: string,
    userMessage: string,
    aiResponse: string,
    language: Locale,
    additionalData: Partial<TravelInteraction> = {}
  ) {
    const memory = this.getOrCreateMemory(sessionId, language)
    
    const interaction: TravelInteraction = {
      id: Date.now().toString(),
      timestamp: new Date(),
      userMessage,
      aiResponse,
      language,
      travelType: 'leisure',
      destinations: [],
      preferences: {},
      ...additionalData
    }

    memory.travelHistory.push(interaction)
    memory.totalInteractions++
    memory.lastInteraction = new Date()

    // Keep only recent interactions
    if (memory.travelHistory.length > this.MAX_HISTORY) {
      memory.travelHistory = memory.travelHistory.slice(-this.MAX_HISTORY)
    }

    // Update context
    this.updateConversationContext(memory, userMessage, language)

    this.saveToStorage()
    return interaction
  }

  private updateConversationContext(
    memory: ConversationMemory,
    userMessage: string,
    language: Locale
  ) {
    const context = memory.conversationContext
    
    // Update language preference if different
    if (memory.preferredLanguage !== language) {
      memory.preferredLanguage = language
      context.hasLanguageMixed = true
    }

    // Extract keywords
    const keywords = this.extractKeywords(userMessage, language)
    context.recentKeywords = [...new Set([...context.recentKeywords, ...keywords])].slice(-10)

    // Update conversation flow
    context.conversationFlow = this.detectConversationFlow(userMessage, language)

    // Update mood
    context.userMood = this.detectUserMood(userMessage, language)

    // Update topic
    if (context.currentTopic) {
      context.previousTopics.push(context.currentTopic)
    }
    context.currentTopic = this.extractMainTopic(userMessage, language)
  }

  private extractKeywords(message: string, language: Locale): string[] {
    const arabicKeywords = [
      'سفر', 'رحلة', 'سياحة', 'فندق', 'طعام', 'مطعم', 'حلال', 'صلاة', 'مسجد',
      'عائلة', 'أطفال', 'طقس', 'جو', 'سعر', 'ميزانية', 'حجز', 'طيران'
    ]

    const englishKeywords = [
      'travel', 'trip', 'tourism', 'hotel', 'food', 'restaurant', 'halal', 'prayer', 'mosque',
      'family', 'children', 'weather', 'price', 'budget', 'booking', 'flight'
    ]

    const keywords = language === 'ar' ? arabicKeywords : englishKeywords
    return keywords.filter(keyword => message.toLowerCase().includes(keyword.toLowerCase()))
  }

  private detectConversationFlow(message: string, language: Locale): ConversationContext['conversationFlow'] {
    const greetingWords = language === 'ar' 
      ? ['مرحبا', 'السلام', 'أهلا', 'مساء', 'صباح']
      : ['hello', 'hi', 'good', 'peace', 'greetings']

    const bookingWords = language === 'ar'
      ? ['حجز', 'احجز', 'أريد', 'أحتاج', 'سعر']
      : ['book', 'booking', 'want', 'need', 'price']

    if (greetingWords.some(word => message.toLowerCase().includes(word))) {
      return 'greeting'
    }

    if (bookingWords.some(word => message.toLowerCase().includes(word))) {
      return 'booking'
    }

    return 'recommendation'
  }

  private detectUserMood(message: string, language: Locale): ConversationContext['userMood'] {
    const excitedWords = language === 'ar'
      ? ['رائع', 'ممتاز', 'جميل', 'مذهل', 'متحمس']
      : ['amazing', 'great', 'wonderful', 'excited', 'fantastic']

    const concernedWords = language === 'ar'
      ? ['قلق', 'خوف', 'مشكلة', 'صعب', 'مشكوك']
      : ['worried', 'concerned', 'problem', 'difficult', 'unsure']

    if (excitedWords.some(word => message.toLowerCase().includes(word))) {
      return 'excited'
    }

    if (concernedWords.some(word => message.toLowerCase().includes(word))) {
      return 'concerned'
    }

    return 'neutral'
  }

  private extractMainTopic(message: string, language: Locale): string {
    const topics = language === 'ar' ? {
      'accommodation': ['فندق', 'إقامة', 'مبيت', 'منتجع'],
      'food': ['طعام', 'مطعم', 'حلال', 'أكل'],
      'transportation': ['طيران', 'سيارة', 'نقل', 'تذكرة'],
      'activities': ['أنشطة', 'زيارة', 'متحف', 'سياحة'],
      'weather': ['طقس', 'جو', 'حر', 'برد'],
      'budget': ['سعر', 'ميزانية', 'تكلفة', 'رخيص']
    } : {
      'accommodation': ['hotel', 'stay', 'accommodation', 'resort'],
      'food': ['food', 'restaurant', 'halal', 'dining'],
      'transportation': ['flight', 'car', 'transport', 'ticket'],
      'activities': ['activities', 'visit', 'museum', 'tourism'],
      'weather': ['weather', 'climate', 'hot', 'cold'],
      'budget': ['price', 'budget', 'cost', 'cheap']
    }

    for (const [topic, keywords] of Object.entries(topics)) {
      if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
        return topic
      }
    }

    return 'general'
  }

  public updatePreferences(sessionId: string, preferences: Partial<PersonalPreferences>) {
    const memory = this.getOrCreateMemory(sessionId, 'en')
    memory.personalPreferences = { ...memory.personalPreferences, ...preferences }
    this.saveToStorage()
  }

  public updateCulturalPreferences(sessionId: string, preferences: Partial<CulturalPreferences>) {
    const memory = this.getOrCreateMemory(sessionId, 'en')
    memory.culturalPreferences = { ...memory.culturalPreferences, ...preferences }
    this.saveToStorage()
  }

  public getRecentInteractions(sessionId: string, count: number = 5): TravelInteraction[] {
    const memory = this.conversations.get(sessionId)
    if (!memory) return []

    return memory.travelHistory.slice(-count)
  }

  public getPersonalizedGreeting(sessionId: string, locale: Locale): string {
    const memory = this.conversations.get(sessionId)
    if (!memory) {
      return locale === 'ar' ? 'مرحباً بك في مساعد السفر الذكي!' : 'Welcome to your AI travel assistant!'
    }

    const { name, title } = memory.personalPreferences
    const isReturningUser = memory.totalInteractions > 0

    if (locale === 'ar') {
      if (isReturningUser && name) {
        return `أهلاً وسهلاً بعودتك ${title || ''} ${name}! كيف يمكنني مساعدتك اليوم؟`
      }
      return isReturningUser ? 'أهلاً بك مرة أخرى!' : 'مرحباً بك في مساعد السفر الذكي!'
    } else {
      if (isReturningUser && name) {
        return `Welcome back ${title || ''} ${name}! How can I help you today?`
      }
      return isReturningUser ? 'Welcome back!' : 'Welcome to your AI travel assistant!'
    }
  }

  public getContextualSuggestions(sessionId: string, locale: Locale): string[] {
    const memory = this.conversations.get(sessionId)
    if (!memory) return []

    const { recentKeywords, currentTopic } = memory.conversationContext
    const { interests, frequentDestinations } = memory.personalPreferences

    const suggestions = []

    // Based on recent keywords
    if (recentKeywords.includes('hotel') || recentKeywords.includes('فندق')) {
      suggestions.push(
        locale === 'ar' ? 'أوصني بفنادق مناسبة للعائلات' : 'Recommend family-friendly hotels'
      )
    }

    // Based on interests
    if (interests.includes('culture')) {
      suggestions.push(
        locale === 'ar' ? 'أعرض لي المواقع الثقافية' : 'Show me cultural sites'
      )
    }

    // Based on frequent destinations
    if (frequentDestinations.length > 0) {
      const dest = frequentDestinations[0]
      suggestions.push(
        locale === 'ar' ? `ما الجديد في ${dest}؟` : `What's new in ${dest}?`
      )
    }

    return suggestions.slice(0, 3)
  }

  public clearMemory(sessionId: string) {
    this.conversations.delete(sessionId)
    this.saveToStorage()
  }

  public exportMemory(sessionId: string): ConversationMemory | null {
    return this.conversations.get(sessionId) || null
  }

  public importMemory(memory: ConversationMemory) {
    this.conversations.set(memory.sessionId, memory)
    this.saveToStorage()
  }
}

export const conversationMemoryManager = new ConversationMemoryManager()