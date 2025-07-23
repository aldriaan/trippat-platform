import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { type Locale } from '@/i18n/request'
import { getCulturalSystemPrompt, getSeasonalTravelPrompt, getHolidayTravelPrompt } from '@/lib/ai-cultural-prompts'
import { getCurrentCulturalContext, saudiTravelInsights, arabicTravelTerms, localCustoms } from '@/lib/cultural-context'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

interface ChatRequest {
  message: string
  locale: Locale
  conversationHistory: Message[]
  sessionId?: string
  culturalContext?: any
  conversationMemory?: any[]
}

interface CulturalContext {
  isFamilyFriendly?: boolean
  travelType?: string
  destinations?: string[]
  recommendedPackages?: string[]
  detectedLanguage?: Locale
  needsTranslation?: boolean
}

// Enhanced system prompt with cultural context
const getEnhancedSystemPrompt = (locale: Locale, culturalContext: any, conversationMemory: any[]) => {
  let basePrompt = getCulturalSystemPrompt(locale)
  
  // Add seasonal context
  const seasonalPrompt = getSeasonalTravelPrompt(locale)
  if (seasonalPrompt) {
    basePrompt += `\n\nCURRENT SEASONAL CONTEXT:\n${seasonalPrompt}`
  }
  
  // Add holiday context
  const holidayPrompt = getHolidayTravelPrompt(locale)
  if (holidayPrompt) {
    basePrompt += `\n\nCURRENT HOLIDAY CONTEXT:\n${holidayPrompt}`
  }
  
  // Add Saudi travel insights
  if (locale === 'ar') {
    basePrompt += `\n\nSAUDI TRAVEL EXPERTISE:\n`
    basePrompt += `You have deep knowledge of Saudi Arabia's regions, attractions, and cultural sites. `
    basePrompt += `Reference specific places like Riyadh, Mecca, Medina, Jeddah, AlUla, NEOM, and the Red Sea project. `
    basePrompt += `Understand Vision 2030 tourism initiatives and new developments.`
  }
  
  // Add conversation memory context
  if (conversationMemory && conversationMemory.length > 0) {
    basePrompt += `\n\nCONVERSATION MEMORY:\n`
    basePrompt += `Previous interactions show user interest in: ${conversationMemory.map(m => m.travelType || 'general travel').join(', ')}`
  }
  
  // Add cultural preferences
  if (culturalContext?.preferences) {
    basePrompt += `\n\nUSER CULTURAL PREFERENCES:\n`
    const prefs = culturalContext.preferences
    if (prefs.halalFood) basePrompt += `- Strictly halal food requirements\n`
    if (prefs.prayerTimes) basePrompt += `- Prayer time considerations important\n`
    if (prefs.familyFriendly) basePrompt += `- Family-friendly activities preferred\n`
    if (prefs.conservativeDress) basePrompt += `- Conservative dress code awareness needed\n`
    if (prefs.islamicHeritage) basePrompt += `- Interest in Islamic heritage sites\n`
  }
  
  // Add Arabic terms knowledge
  if (locale === 'ar') {
    basePrompt += `\n\nARABIC TRAVEL TERMINOLOGY:\n`
    Object.entries(arabicTravelTerms).slice(0, 5).forEach(([key, term]) => {
      basePrompt += `- ${term.arabic} (${term.transliteration}): ${term.english}\n`
    })
  }
  
  return basePrompt
}

// Enhanced function to analyze cultural context
const analyzeCulturalContext = (message: string, locale: Locale, userCulturalContext?: any): CulturalContext => {
  const context: CulturalContext = {}

  // Keywords for cultural context detection
  const familyKeywords = ['family', 'عائلة', 'kids', 'أطفال', 'children', 'الأطفال', 'family-friendly', 'مناسب للعائلات']
  const heritageKeywords = ['heritage', 'تراث', 'historical', 'تاريخي', 'culture', 'ثقافة']
  
  // Travel type keywords
  const businessKeywords = ['business', 'أعمال', 'conference', 'مؤتمر', 'meeting', 'اجتماع', 'work', 'عمل']
  const leisureKeywords = ['vacation', 'إجازة', 'holiday', 'عطلة', 'relaxation', 'استرخاء', 'fun', 'متعة']
  const religiousKeywords = ['hajj', 'حج', 'umrah', 'عمرة', 'pilgrimage', 'حج', 'mecca', 'مكة', 'medina', 'المدينة']
  const culturalKeywords = ['culture', 'ثقافة', 'museum', 'متحف', 'art', 'فن', 'history', 'تاريخ']
  
  // Destination keywords
  const saudiKeywords = ['saudi', 'السعودية', 'riyadh', 'الرياض', 'jeddah', 'جدة', 'mecca', 'مكة', 'medina', 'المدينة']
  const gulfKeywords = ['dubai', 'دبي', 'abu dhabi', 'أبو ظبي', 'qatar', 'قطر', 'kuwait', 'الكويت', 'bahrain', 'البحرين']
  const middleEastKeywords = ['egypt', 'مصر', 'jordan', 'الأردن', 'lebanon', 'لبنان', 'turkey', 'تركيا', 'morocco', 'المغرب']

  const lowerMessage = message.toLowerCase()

  // Basic cultural context
  context.isFamilyFriendly = familyKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase())) || 
                            (userCulturalContext?.preferences?.familyFriendly)

  // Travel type detection
  if (businessKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
    context.travelType = 'business'
  } else if (religiousKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
    context.travelType = 'religious'
  } else if (culturalKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
    context.travelType = 'cultural'
  } else if (leisureKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
    context.travelType = 'leisure'
  } else if (familyKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
    context.travelType = 'family'
  } else {
    context.travelType = 'general'
  }

  // Destination detection
  context.destinations = []
  if (saudiKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
    context.destinations.push('Saudi Arabia')
  }
  if (gulfKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
    context.destinations.push('Gulf Countries')
  }
  if (middleEastKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
    context.destinations.push('Middle East')
  }

  // Language detection
  const arabicRegex = /[\u0600-\u06FF]/
  const hasArabicText = arabicRegex.test(message)
  
  if (hasArabicText && locale === 'en') {
    context.detectedLanguage = 'ar'
    context.needsTranslation = true
  } else if (!hasArabicText && locale === 'ar') {
    context.detectedLanguage = 'en'
    context.needsTranslation = true
  }

  return context
}

// Function to enhance response with cultural information
const enhanceResponseWithCulturalInfo = (response: string, context: CulturalContext, locale: Locale): string => {
  let enhancedResponse = response

  if (locale === 'ar') {
    if (context.isFamilyFriendly) {
      enhancedResponse += '\n\n👨‍👩‍👧‍👦 تم اختيار هذه التوصيات خصيصاً لتناسب العائلات والأطفال.'
    }
  } else {
    if (context.isFamilyFriendly) {
      enhancedResponse += '\n\n👨‍👩‍👧‍👦 These recommendations are specially selected for families with children.'
    }
  }

  return enhancedResponse
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const { 
      message, 
      locale, 
      conversationHistory, 
      sessionId, 
      culturalContext: userCulturalContext,
      conversationMemory 
    }: ChatRequest = await request.json()

    if (!message || !locale) {
      return NextResponse.json(
        { error: 'Message and locale are required' },
        { status: 400 }
      )
    }

    // Analyze cultural context with enhanced detection
    const culturalContext = analyzeCulturalContext(message, locale, userCulturalContext)

    // Get enhanced system prompt with cultural context
    const systemPrompt = getEnhancedSystemPrompt(locale, userCulturalContext, conversationMemory || [])

    // Prepare conversation history for OpenAI
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt
      }
    ]

    // Add conversation history
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })
    })

    // Add current message with cultural context
    let enhancedMessage = message
    if (culturalContext.needsTranslation) {
      enhancedMessage = `[User message in ${culturalContext.detectedLanguage}]: ${message}`
    }

    messages.push({
      role: 'user',
      content: enhancedMessage
    })

    // Call OpenAI API with enhanced parameters
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      max_tokens: 1200,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
      stop: ['<END>'],
      // Add function calling for package recommendations
      functions: [
        {
          name: 'recommend_packages',
          description: 'Recommend travel packages based on user preferences',
          parameters: {
            type: 'object',
            properties: {
              destination: {
                type: 'string',
                description: 'The destination or region'
              },
              travelType: {
                type: 'string',
                description: 'Type of travel (family, religious, cultural, business, leisure)'
              },
              budget: {
                type: 'string',
                description: 'Budget range (budget, mid-range, luxury)'
              },
              culturalPreferences: {
                type: 'object',
                description: 'Cultural preferences like halal, prayer times, family-friendly'
              }
            },
            required: ['destination', 'travelType']
          }
        }
      ]
    })

    const aiResponse = completion.choices[0]?.message?.content
    const functionCall = completion.choices[0]?.message?.function_call

    if (!aiResponse && !functionCall) {
      throw new Error('No response from OpenAI')
    }

    let finalResponse = aiResponse || ''
    let recommendedPackages: string[] = []

    // Handle function calls for package recommendations
    if (functionCall && functionCall.name === 'recommend_packages') {
      const params = JSON.parse(functionCall.arguments || '{}')
      recommendedPackages = ['pkg1', 'pkg2', 'pkg3'] // This would come from your backend
      
      if (locale === 'ar') {
        finalResponse += `\n\n📦 إليك بعض الحزم المقترحة لـ${params.destination}:`
      } else {
        finalResponse += `\n\n📦 Here are some recommended packages for ${params.destination}:`
      }
    }

    // Enhance response with cultural information
    const enhancedResponse = enhanceResponseWithCulturalInfo(finalResponse, culturalContext, locale)

    // Handle language switching
    let responseLanguage = locale
    if (culturalContext.needsTranslation && culturalContext.detectedLanguage) {
      responseLanguage = culturalContext.detectedLanguage
    }

    return NextResponse.json({
      message: enhancedResponse,
      culturalContext: culturalContext,
      responseLanguage,
      travelType: culturalContext.travelType,
      destinations: culturalContext.destinations,
      recommendedPackages,
      isTranslated: culturalContext.needsTranslation,
      originalLanguage: culturalContext.needsTranslation ? locale : undefined
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    // Return localized error message
    const errorMessage = request.headers.get('accept-language')?.includes('ar')
      ? 'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.'
      : 'Sorry, there was an error processing your request. Please try again.'

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}