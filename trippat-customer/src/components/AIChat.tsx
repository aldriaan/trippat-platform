'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  X, 
  Plus, 
  Sparkles,
  MapPin,
  Clock,
  Star,
  Utensils,
  Home,
  Users
} from 'lucide-react'
import { type Locale } from '@/i18n/request'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  culturalContext?: {
    isFamilyFriendly?: boolean
  }
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  locale: Locale
  createdAt: Date
}

interface AIChatProps {
  isOpen: boolean
  onClose: () => void
}

// Safe ID generation to avoid hydration mismatches
let idCounter = 0;
const generateId = () => `chat-${++idCounter}`

// Safe timestamp generation to avoid hydration mismatches
const generateTimestamp = () => {
  // Use a static timestamp during SSR to avoid hydration mismatch
  if (typeof window === 'undefined') {
    return new Date('2024-01-01T00:00:00.000Z')
  }
  return new Date()
}

const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose }) => {
  const t = useTranslations('chat')
  const locale = useLocale() as Locale
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = t.raw('suggestions.items') as string[]

  const currentConversation = conversations.find(c => c.id === activeConversation)

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [currentConversation?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: generateId(),
      title: t('newConversation'),
      messages: [],
      locale: locale,
      createdAt: generateTimestamp()
    }
    
    setConversations(prev => [newConversation, ...prev])
    setActiveConversation(newConversation.id)
    setShowSuggestions(true)
  }, [locale, t])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const messageId = generateId()
    const userMessage: Message = {
      id: messageId,
      content: content.trim(),
      role: 'user',
      timestamp: generateTimestamp()
    }

    // If no active conversation, create one
    if (!activeConversation) {
      createNewConversation()
    }

    // Add user message
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversation 
        ? { ...conv, messages: [...conv.messages, userMessage] }
        : conv
    ))

    setInputValue('')
    setIsLoading(true)
    setShowSuggestions(false)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          locale: locale,
          conversationHistory: currentConversation?.messages || []
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: generateId(),
        content: data.message,
        role: 'assistant',
        timestamp: generateTimestamp(),
        culturalContext: data.culturalContext
      }

      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation 
          ? { 
              ...conv, 
              messages: [...conv.messages, assistantMessage],
              title: conv.messages.length === 1 ? content.slice(0, 30) + '...' : conv.title
            }
          : conv
      ))

    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMessage: Message = {
        id: generateId(),
        content: locale === 'ar' 
          ? 'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.'
          : 'Sorry, there was an error processing your request. Please try again.',
        role: 'assistant',
        timestamp: generateTimestamp()
      }

      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation 
          ? { ...conv, messages: [...conv.messages, errorMessage] }
          : conv
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    sendMessage(suggestion)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  const getCulturalIcon = (context: Message['culturalContext']) => {
    if (!context) return null

    const icons = []
    if (context.isFamilyFriendly) icons.push(<Users key="family" className="h-4 w-4 text-purple-600" />)

    return icons.length > 0 ? (
      <div className="flex items-center space-x-1 mt-2">
        {icons}
      </div>
    ) : null
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="relative">
              <Bot className="h-8 w-8 text-primary" />
              <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('title')}</h2>
              <p className="text-sm text-gray-500">{t('subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={createNewConversation}
              className="p-2 text-gray-500 hover:text-primary hover:bg-secondary/20 rounded-md transition-colors"
              title={t('newConversation')}
            >
              <Plus className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Conversations */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={createNewConversation}
                className="w-full flex items-center space-x-2 rtl:space-x-reverse p-3 text-primary bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span className="text-sm font-medium">{t('newConversation')}</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map(conversation => (
                <button
                  key={conversation.id}
                  onClick={() => setActiveConversation(conversation.id)}
                  className={`w-full text-left p-3 hover:bg-gray-100 transition-colors border-b border-gray-100 ${
                    activeConversation === conversation.id ? 'bg-secondary/20 border-secondary/50' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900 line-clamp-1">
                    {conversation.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {conversation.messages.length} {conversation.messages.length === 1 ? 'message' : 'messages'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!currentConversation || currentConversation.messages.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('title')}</h3>
                  <p className="text-gray-500 mb-6">{t('subtitle')}</p>
                  
                  {showSuggestions && (
                    <div className="max-w-md mx-auto">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">{t('suggestions.title')}</h4>
                      <div className="space-y-2">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {currentConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-white chat-bubble-user'
                          : 'bg-gray-100 text-gray-900 chat-bubble-assistant'
                      }`}>
                        <div className="flex items-start space-x-2 rtl:space-x-reverse">
                          <div className="flex-shrink-0 mt-1">
                            {message.role === 'user' ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {getCulturalIcon(message.culturalContext)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-4 chat-bubble-assistant">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-4 w-4 text-gray-600" />
                          <div className="text-sm text-gray-600">{t('thinking')}</div>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('placeholder')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary rtl:text-right"
                  disabled={isLoading}
                />
                <button
                  onClick={() => sendMessage(inputValue)}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIChat