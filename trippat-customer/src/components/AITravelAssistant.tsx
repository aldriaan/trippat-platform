'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Bot, 
  Send, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign,
  Heart,
  Star,
  Clock,
  MessageCircle,
  Filter,
  Wand2,
  Plane,
  Camera,
  Music,
  Utensils,
  Mountain,
  Building,
  Palette,
  Waves
} from 'lucide-react';

interface TravelPreferences {
  destinations: string[];
  budget: {
    min: number;
    max: number;
    currency: 'USD' | 'SAR';
  };
  duration: {
    min: number;
    max: number;
  };
  travelStyle: 'relaxed' | 'moderate' | 'active' | 'adventure' | 'luxury';
  interests: string[];
  dietaryPreferences: string[];
  accessibilityNeeds: string[];
  travelDates: {
    flexible: boolean;
    preferredMonth?: string;
    specificDates?: {
      start: string;
      end: string;
    };
  };
  groupSize: number;
  ageGroup: 'family_friendly' | 'adult_only' | 'senior_friendly' | 'young_adult' | 'all_ages';
  accommodationType: 'hotel' | 'resort' | 'apartment' | 'hostel' | 'luxury' | 'any';
}

interface AIRecommendation {
  id: string;
  packageId: string;
  title: string;
  destination: string;
  matchScore: number;
  reasons: string[];
  price: number;
  duration: number;
  category: string;
  highlights: string[];
  images: string[];
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  recommendations?: AIRecommendation[];
}

const AITravelAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [preferences, setPreferences] = useState<TravelPreferences>({
    destinations: [],
    budget: { min: 0, max: 10000, currency: 'USD' },
    duration: { min: 1, max: 14 },
    travelStyle: 'moderate',
    interests: [],
    dietaryPreferences: [],
    accessibilityNeeds: [],
    travelDates: { flexible: true },
    groupSize: 2,
    ageGroup: 'all_ages',
    accommodationType: 'any'
  });
  const [showPreferences, setShowPreferences] = useState(false);

  const travelCategories = [
    { id: 'adventure', label: 'Adventure Travel', icon: Mountain, description: 'Hiking, diving, extreme sports' },
    { id: 'luxury', label: 'Luxury Travel', icon: Star, description: '5-star resorts, premium experiences' },
    { id: 'family', label: 'Family Travel', icon: Users, description: 'Kid-friendly activities, family resorts' },
    { id: 'cultural', label: 'Cultural Travel', icon: Palette, description: 'Historical sites, museums, local culture' },
    { id: 'nature', label: 'Nature Travel', icon: Mountain, description: 'National parks, wildlife, eco-tourism' },
    { id: 'business', label: 'Business Travel', icon: Building, description: 'Corporate packages, conferences' },
    { id: 'wellness', label: 'Wellness Travel', icon: Heart, description: 'Spa retreats, yoga, meditation' },
    { id: 'food', label: 'Food Travel', icon: Utensils, description: 'Culinary tours, cooking classes' },
    { id: 'photography', label: 'Photography Travel', icon: Camera, description: 'Scenic routes, workshops' },
    { id: 'budget', label: 'Budget Travel', icon: DollarSign, description: 'Affordable options, backpacking' }
  ];

  const travelInterests = [
    { id: 'history', label: 'History', icon: Building },
    { id: 'art', label: 'Art & Culture', icon: Palette },
    { id: 'food', label: 'Food & Dining', icon: Utensils },
    { id: 'nature', label: 'Nature & Wildlife', icon: Mountain },
    { id: 'adventure', label: 'Adventure Sports', icon: Waves },
    { id: 'wellness', label: 'Wellness & Spa', icon: Heart },
    { id: 'photography', label: 'Photography', icon: Camera },
    { id: 'music', label: 'Music & Events', icon: Music },
    { id: 'architecture', label: 'Architecture', icon: Building },
    { id: 'nightlife', label: 'Nightlife', icon: Star },
    { id: 'shopping', label: 'Shopping', icon: DollarSign },
    { id: 'sports', label: 'Sports', icon: Users }
  ];

  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'gluten_free', label: 'Gluten-Free' },
    { id: 'halal', label: 'Halal' },
    { id: 'kosher', label: 'Kosher' },
    { id: 'dairy_free', label: 'Dairy-Free' },
    { id: 'nut_free', label: 'Nut-Free' }
  ];

  const accessibilityOptions = [
    { id: 'wheelchair_accessible', label: 'Wheelchair Accessible' },
    { id: 'hearing_assistance', label: 'Hearing Assistance' },
    { id: 'visual_assistance', label: 'Visual Assistance' },
    { id: 'mobility_support', label: 'Mobility Support' }
  ];

  const quickSuggestions = [
    "I want a relaxing beach vacation",
    "Plan an adventure trip for 2 weeks",
    "Best cultural experiences in Saudi Arabia",
    "Family-friendly destinations with kids activities",
    "Luxury travel options within $5000",
    "Adventure sports and hiking destinations"
  ];

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: "Hello! I'm your AI travel assistant. I can help you discover amazing travel experiences tailored to your preferences. What kind of adventure are you looking for?",
        timestamp: new Date(),
        suggestions: quickSuggestions.slice(0, 3)
      }
    ]);
  }, []);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = generateAIResponse(message);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const generateAIResponse = (userMessage: string): ChatMessage => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Enhanced AI response logic with comprehensive categories
    if (lowerMessage.includes('adventure') || lowerMessage.includes('hiking') || lowerMessage.includes('extreme')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "Perfect! I can see you're looking for adventure. Here are some thrilling options that will get your adrenaline pumping.",
        timestamp: new Date(),
        recommendations: [
          {
            id: '2',
            packageId: 'adventure-1',
            title: 'Edge of the World Adventure',
            destination: 'Riyadh, Saudi Arabia',
            matchScore: 92,
            reasons: ['Hiking trails', 'Stunning views', 'Adventure activities'],
            price: 800,
            duration: 3,
            category: 'adventure',
            highlights: ['Cliff hiking', 'Desert camping', 'Photography tours'],
            images: ['/images/edge-world-1.jpg']
          }
        ]
      };
    }

    if (lowerMessage.includes('luxury') || lowerMessage.includes('premium') || lowerMessage.includes('5-star')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "Excellent choice! I've found some luxurious experiences that offer premium amenities and VIP services.",
        timestamp: new Date(),
        recommendations: [
          {
            id: '1',
            packageId: 'luxury-1',
            title: 'Red Sea Luxury Resort',
            destination: 'Jeddah, Saudi Arabia',
            matchScore: 95,
            reasons: ['5-star accommodation', 'VIP services', 'Premium amenities'],
            price: 2500,
            duration: 5,
            category: 'luxury',
            highlights: ['Private beach access', 'Spa treatments', 'Personal concierge'],
            images: ['/images/red-sea-luxury.jpg']
          }
        ]
      };
    }

    if (lowerMessage.includes('family') || lowerMessage.includes('kids') || lowerMessage.includes('children')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "Family travel is wonderful! I've found some great family-friendly destinations with activities for all ages.",
        timestamp: new Date(),
        recommendations: [
          {
            id: '3',
            packageId: 'family-1',
            title: 'Family Fun in AlUla',
            destination: 'AlUla, Saudi Arabia',
            matchScore: 90,
            reasons: ['Kid-friendly activities', 'Educational experiences', 'Safe environment'],
            price: 1500,
            duration: 7,
            category: 'family',
            highlights: ['Historical sites', 'Adventure parks', 'Cultural experiences'],
            images: ['/images/alula-1.jpg']
          }
        ]
      };
    }

    if (lowerMessage.includes('culture') || lowerMessage.includes('history') || lowerMessage.includes('museum')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "Cultural exploration is fascinating! Here are some immersive cultural experiences that showcase local heritage.",
        timestamp: new Date(),
        recommendations: [
          {
            id: '4',
            packageId: 'cultural-1',
            title: 'Cultural Heritage Tour',
            destination: 'Riyadh, Saudi Arabia',
            matchScore: 88,
            reasons: ['Historical sites', 'Cultural immersion', 'Local experiences'],
            price: 900,
            duration: 4,
            category: 'cultural',
            highlights: ['Historical museums', 'Traditional crafts', 'Local cuisine'],
            images: ['/images/riyadh-heritage.jpg']
          }
        ]
      };
    }

    if (lowerMessage.includes('nature') || lowerMessage.includes('wildlife') || lowerMessage.includes('eco')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "Nature lovers will enjoy these eco-friendly experiences! Here are some sustainable travel options.",
        timestamp: new Date(),
        recommendations: [
          {
            id: '5',
            packageId: 'nature-1',
            title: 'Desert Wildlife Safari',
            destination: 'AlUla, Saudi Arabia',
            matchScore: 87,
            reasons: ['Wildlife viewing', 'Eco-tourism', 'Sustainable travel'],
            price: 700,
            duration: 3,
            category: 'nature',
            highlights: ['Wildlife observation', 'Conservation education', 'Nature photography'],
            images: ['/images/desert-wildlife.jpg']
          }
        ]
      };
    }

    if (lowerMessage.includes('business') || lowerMessage.includes('corporate') || lowerMessage.includes('conference')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "For business travelers, I've found professional packages with all the amenities you need.",
        timestamp: new Date(),
        recommendations: [
          {
            id: '6',
            packageId: 'business-1',
            title: 'Executive Business Package',
            destination: 'Riyadh, Saudi Arabia',
            matchScore: 93,
            reasons: ['Conference facilities', 'Business center', 'Executive amenities'],
            price: 1200,
            duration: 2,
            category: 'business',
            highlights: ['Meeting rooms', 'High-speed WiFi', 'Airport transfers'],
            images: ['/images/business-hotel.jpg']
          }
        ]
      };
    }

    if (lowerMessage.includes('wellness') || lowerMessage.includes('spa') || lowerMessage.includes('yoga')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "Wellness travel is perfect for rejuvenation! Here are some health-focused retreats.",
        timestamp: new Date(),
        recommendations: [
          {
            id: '7',
            packageId: 'wellness-1',
            title: 'Desert Wellness Retreat',
            destination: 'AlUla, Saudi Arabia',
            matchScore: 91,
            reasons: ['Spa treatments', 'Yoga programs', 'Wellness activities'],
            price: 1800,
            duration: 5,
            category: 'wellness',
            highlights: ['Spa treatments', 'Meditation sessions', 'Healthy cuisine'],
            images: ['/images/wellness-retreat.jpg']
          }
        ]
      };
    }

    if (lowerMessage.includes('food') || lowerMessage.includes('culinary') || lowerMessage.includes('cooking')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "Food enthusiasts will love these culinary adventures! Discover authentic local flavors.",
        timestamp: new Date(),
        recommendations: [
          {
            id: '8',
            packageId: 'food-1',
            title: 'Culinary Journey',
            destination: 'Jeddah, Saudi Arabia',
            matchScore: 89,
            reasons: ['Culinary tours', 'Cooking classes', 'Local cuisine'],
            price: 1100,
            duration: 4,
            category: 'food',
            highlights: ['Chef-led tours', 'Cooking workshops', 'Food markets'],
            images: ['/images/culinary-tour.jpg']
          }
        ]
      };
    }

    if (lowerMessage.includes('photography') || lowerMessage.includes('instagram') || lowerMessage.includes('scenic')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "Photography enthusiasts will love these scenic destinations! Perfect for capturing stunning shots.",
        timestamp: new Date(),
        recommendations: [
          {
            id: '9',
            packageId: 'photography-1',
            title: 'Photography Expedition',
            destination: 'AlUla, Saudi Arabia',
            matchScore: 94,
            reasons: ['Scenic locations', 'Photography workshops', 'Instagram-worthy spots'],
            price: 950,
            duration: 3,
            category: 'photography',
            highlights: ['Golden hour sessions', 'Landscape photography', 'Expert guidance'],
            images: ['/images/photography-tour.jpg']
          }
        ]
      };
    }

    if (lowerMessage.includes('budget') || lowerMessage.includes('affordable') || lowerMessage.includes('cheap')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "Budget-friendly travel doesn't mean compromising on experiences! Here are some great value options.",
        timestamp: new Date(),
        recommendations: [
          {
            id: '10',
            packageId: 'budget-1',
            title: 'Budget Explorer Package',
            destination: 'Riyadh, Saudi Arabia',
            matchScore: 86,
            reasons: ['Affordable pricing', 'Value for money', 'Budget-friendly activities'],
            price: 450,
            duration: 3,
            category: 'budget',
            highlights: ['Budget accommodation', 'Free activities', 'Local transport'],
            images: ['/images/budget-travel.jpg']
          }
        ]
      };
    }

    // Default response with category suggestions
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: "I'd love to help you plan the perfect trip! What type of travel experience are you looking for?",
      timestamp: new Date(),
      suggestions: [
        "Adventure travel with hiking and outdoor activities",
        "Luxury experiences with premium amenities",
        "Family-friendly destinations with kids activities",
        "Cultural tours and historical experiences",
        "Nature and wildlife eco-tourism",
        "Business travel with conference facilities",
        "Wellness retreats with spa treatments",
        "Food tours and culinary experiences",
        "Photography tours with scenic locations",
        "Budget-friendly travel options"
      ]
    };
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const RecommendationCard: React.FC<{ recommendation: AIRecommendation }> = ({ recommendation }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{recommendation.title}</CardTitle>
          <Badge variant="secondary">{recommendation.matchScore}% match</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{recommendation.destination}</span>
          <Clock className="h-4 w-4 ml-2" />
          <span>{recommendation.duration} days</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">${recommendation.price}</span>
            <Badge>{recommendation.category}</Badge>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Why this matches you:</h4>
            <ul className="text-sm space-y-1">
              {recommendation.reasons.map((reason, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Star className="h-3 w-3 text-yellow-500" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Highlights:</h4>
            <div className="flex flex-wrap gap-1">
              {recommendation.highlights.map((highlight, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {highlight}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" className="flex-1">
              View Details
            </Button>
            <Button size="sm" variant="outline">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PreferencesPanel: React.FC = () => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Travel Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Budget Range</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={preferences.budget.min}
                onChange={(e) => handlePreferenceChange('budget', {
                  ...preferences.budget,
                  min: parseInt(e.target.value) || 0
                })}
              />
              <span>-</span>
              <Input
                type="number"
                placeholder="Max"
                value={preferences.budget.max}
                onChange={(e) => handlePreferenceChange('budget', {
                  ...preferences.budget,
                  max: parseInt(e.target.value) || 10000
                })}
              />
              <Select 
                value={preferences.budget.currency} 
                onValueChange={(value) => handlePreferenceChange('budget', {
                  ...preferences.budget,
                  currency: value
                })}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="SAR">SAR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Travel Style</label>
            <Select 
              value={preferences.travelStyle} 
              onValueChange={(value) => handlePreferenceChange('travelStyle', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relaxed">Relaxed</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="adventure">Adventure</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Interests</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {travelInterests.map((interest) => {
              const Icon = interest.icon;
              return (
                <div key={interest.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={interest.id}
                    checked={preferences.interests.includes(interest.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handlePreferenceChange('interests', [...preferences.interests, interest.id]);
                      } else {
                        handlePreferenceChange('interests', preferences.interests.filter(i => i !== interest.id));
                      }
                    }}
                  />
                  <label htmlFor={interest.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Icon className="h-4 w-4" />
                    {interest.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Dietary Preferences</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {dietaryOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={preferences.dietaryPreferences.includes(option.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handlePreferenceChange('dietaryPreferences', [...preferences.dietaryPreferences, option.id]);
                    } else {
                      handlePreferenceChange('dietaryPreferences', preferences.dietaryPreferences.filter(i => i !== option.id));
                    }
                  }}
                />
                <label htmlFor={option.id} className="text-sm cursor-pointer">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Accessibility Needs</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {accessibilityOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={preferences.accessibilityNeeds.includes(option.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handlePreferenceChange('accessibilityNeeds', [...preferences.accessibilityNeeds, option.id]);
                    } else {
                      handlePreferenceChange('accessibilityNeeds', preferences.accessibilityNeeds.filter(i => i !== option.id));
                    }
                  }}
                />
                <label htmlFor={option.id} className="text-sm cursor-pointer">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl border flex flex-col">
      {/* Header */}
      <div className="bg-primary text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <span className="font-medium">AI Travel Assistant</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreferences(!showPreferences)}
              className="text-white hover:bg-primary/90"
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-primary/90"
            >
              ×
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {showPreferences && <PreferencesPanel />}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              
              {message.suggestions && (
                <div className="mt-2 space-y-1">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(suggestion)}
                      className="block w-full text-left text-xs p-2 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              
              {message.recommendations && (
                <div className="mt-3 space-y-2">
                  {message.recommendations.map((rec) => (
                    <RecommendationCard key={rec.id} recommendation={rec} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-xs text-gray-500">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Ask me anything about travel..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(currentMessage)}
          />
          <Button 
            onClick={() => handleSendMessage(currentMessage)}
            disabled={!currentMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AITravelAssistant;