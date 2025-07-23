'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Edit,
  Save,
  Shield,
  Globe,
  Users,
  Heart,
  Zap,
  Star,
  MessageCircle
} from 'lucide-react';

interface CulturalGuideline {
  id: string;
  category: 'religious' | 'social' | 'linguistic' | 'business' | 'travel';
  title: string;
  description: string;
  examples: string[];
  severity: 'error' | 'warning' | 'info';
  language: 'ar' | 'en' | 'both';
}

interface ValidationResult {
  id: string;
  guidelineId: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
  context: string;
  position?: {
    start: number;
    end: number;
  };
}

interface CulturalContentValidatorProps {
  content: {
    title: string;
    description: string;
    inclusions?: string[];
    exclusions?: string[];
    highlights?: string[];
    itinerary?: Array<{
      title: string;
      description: string;
      activities?: string[];
    }>;
  };
  language: 'ar' | 'en';
  onValidate: (results: ValidationResult[]) => void;
  onApprove: (approved: boolean, notes?: string) => void;
}

const CulturalContentValidator: React.FC<CulturalContentValidatorProps> = ({
  content,
  language,
  onValidate,
  onApprove
}) => {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [activeTab, setActiveTab] = useState('guidelines');

  const universalGuidelines: CulturalGuideline[] = [
    {
      id: 'safety_standards',
      category: 'travel',
      title: 'Safety Standards',
      description: 'Ensure all activities and accommodations meet safety requirements',
      examples: ['Safety equipment provided', 'Emergency procedures', 'Insurance coverage'],
      severity: 'error',
      language: 'both'
    },
    {
      id: 'accessibility_info',
      category: 'social',
      title: 'Accessibility Information',
      description: 'Provide clear information about accessibility features',
      examples: ['Wheelchair accessibility', 'Visual/hearing assistance', 'Mobility support'],
      severity: 'warning',
      language: 'both'
    },
    {
      id: 'dietary_options',
      category: 'business',
      title: 'Dietary Options',
      description: 'Include information about various dietary preferences and restrictions',
      examples: ['Vegetarian options', 'Gluten-free meals', 'Dietary restrictions accommodation'],
      severity: 'warning',
      language: 'both'
    },
    {
      id: 'local_customs',
      category: 'social',
      title: 'Local Customs and Etiquette',
      description: 'Inform travelers about local customs and appropriate behavior',
      examples: ['Dress codes for sites', 'Tipping practices', 'Local greetings'],
      severity: 'info',
      language: 'both'
    },
    {
      id: 'age_appropriateness',
      category: 'social',
      title: 'Age Appropriateness',
      description: 'Clearly indicate age suitability for activities and destinations',
      examples: ['Family-friendly activities', 'Age restrictions', 'Senior-friendly options'],
      severity: 'warning',
      language: 'both'
    },
    {
      id: 'weather_seasons',
      category: 'travel',
      title: 'Weather and Seasonal Information',
      description: 'Provide accurate weather and seasonal travel information',
      examples: ['Best travel months', 'Weather conditions', 'Seasonal activities'],
      severity: 'info',
      language: 'both'
    },
    {
      id: 'language_clarity',
      category: 'linguistic',
      title: 'Language Clarity',
      description: 'Use clear, professional language appropriate for international travelers',
      examples: ['Professional terminology', 'Clear instructions', 'Accurate translations'],
      severity: 'warning',
      language: 'both'
    },
    {
      id: 'inclusive_content',
      category: 'social',
      title: 'Inclusive Content',
      description: 'Ensure content is inclusive and welcoming to all travelers',
      examples: ['Diverse imagery', 'Inclusive language', 'Cultural sensitivity'],
      severity: 'error',
      language: 'both'
    },
    {
      id: 'booking_transparency',
      category: 'business',
      title: 'Booking Transparency',
      description: 'Provide clear and accurate booking information',
      examples: ['Transparent pricing', 'Clear cancellation policy', 'Accurate descriptions'],
      severity: 'error',
      language: 'both'
    }
  ];

  const validateContent = async () => {
    setIsValidating(true);
    const results: ValidationResult[] = [];

    // Extract all text content for validation
    const allText = [
      content.title,
      content.description,
      ...(content.inclusions || []),
      ...(content.exclusions || []),
      ...(content.highlights || []),
      ...(content.itinerary?.flatMap(day => [day.title, day.description, ...(day.activities || [])]) || [])
    ].join(' ').toLowerCase();

    // Check each guideline
    universalGuidelines.forEach(guideline => {
      if (guideline.language !== 'both' && guideline.language !== language) return;

      let violations: ValidationResult[] = [];

      switch (guideline.id) {
        case 'safety_standards':
          violations = checkSafetyStandards(allText, guideline);
          break;
        case 'accessibility_info':
          violations = checkAccessibilityInfo(allText, guideline);
          break;
        case 'dietary_options':
          violations = checkDietaryOptions(allText, guideline);
          break;
        case 'local_customs':
          violations = checkLocalCustoms(allText, guideline);
          break;
        case 'age_appropriateness':
          violations = checkAgeAppropriateness(allText, guideline);
          break;
        case 'weather_seasons':
          violations = checkWeatherSeasons(allText, guideline);
          break;
        case 'language_clarity':
          violations = checkLanguageClarity(allText, guideline);
          break;
        case 'inclusive_content':
          violations = checkInclusiveContent(allText, guideline);
          break;
        case 'booking_transparency':
          violations = checkBookingTransparency(allText, guideline);
          break;
        default:
          break;
      }

      results.push(...violations);
    });

    setValidationResults(results);
    setIsValidating(false);
    onValidate(results);
  };

  const checkSafetyStandards = (text: string, guideline: CulturalGuideline): ValidationResult[] => {
    const violations: ValidationResult[] = [];
    
    const safetyTerms = ['safety', 'emergency', 'insurance', 'first aid', 'medical'];
    const activityTerms = ['activity', 'tour', 'adventure', 'sport', 'excursion'];
    
    const hasActivityContent = activityTerms.some(term => text.includes(term));
    const hasSafetyMention = safetyTerms.some(term => text.includes(term));
    
    if (hasActivityContent && !hasSafetyMention) {
      violations.push({
        id: 'safety_standards_missing',
        guidelineId: guideline.id,
        severity: 'warning',
        message: 'Activity content without safety information',
        suggestion: 'Include safety equipment, procedures, or insurance details',
        context: 'Activity-related content found'
      });
    }

    return violations;
  };

  const checkAccessibilityInfo = (text: string, guideline: CulturalGuideline): ValidationResult[] => {
    const violations: ValidationResult[] = [];
    
    const accessibilityTerms = ['wheelchair', 'accessible', 'mobility', 'disabled', 'special needs'];
    const venueTerms = ['hotel', 'restaurant', 'museum', 'attraction', 'venue'];
    
    const hasVenueContent = venueTerms.some(term => text.includes(term));
    const hasAccessibilityMention = accessibilityTerms.some(term => text.includes(term));
    
    if (hasVenueContent && !hasAccessibilityMention) {
      violations.push({
        id: 'accessibility_info_missing',
        guidelineId: guideline.id,
        severity: 'info',
        message: 'Venue content without accessibility information',
        suggestion: 'Consider adding accessibility details for inclusive travel',
        context: 'Venue-related content found'
      });
    }

    return violations;
  };

  const checkDietaryOptions = (text: string, guideline: CulturalGuideline): ValidationResult[] => {
    const violations: ValidationResult[] = [];
    
    const foodTerms = ['restaurant', 'dining', 'meal', 'food', 'cuisine', 'breakfast', 'lunch', 'dinner'];
    const dietaryTerms = ['vegetarian', 'vegan', 'gluten-free', 'dietary', 'allergies', 'halal', 'kosher'];
    
    const hasFoodContent = foodTerms.some(term => text.includes(term));
    const hasDietaryMention = dietaryTerms.some(term => text.includes(term));
    
    if (hasFoodContent && !hasDietaryMention) {
      violations.push({
        id: 'dietary_options_missing',
        guidelineId: guideline.id,
        severity: 'info',
        message: 'Food content without dietary options information',
        suggestion: 'Consider mentioning available dietary accommodations',
        context: 'Food-related content found'
      });
    }

    return violations;
  };

  const checkLocalCustoms = (text: string, guideline: CulturalGuideline): ValidationResult[] => {
    const violations: ValidationResult[] = [];
    
    const culturalSites = ['mosque', 'temple', 'shrine', 'cultural site', 'historical site'];
    const customsTerms = ['dress code', 'etiquette', 'customs', 'behavior', 'respect'];
    
    const hasCulturalSite = culturalSites.some(term => text.includes(term));
    const hasCustomsMention = customsTerms.some(term => text.includes(term));
    
    if (hasCulturalSite && !hasCustomsMention) {
      violations.push({
        id: 'local_customs_missing',
        guidelineId: guideline.id,
        severity: 'info',
        message: 'Cultural site content without customs information',
        suggestion: 'Add information about local customs and appropriate behavior',
        context: 'Cultural site content found'
      });
    }

    return violations;
  };

  const checkAgeAppropriateness = (text: string, guideline: CulturalGuideline): ValidationResult[] => {
    const violations: ValidationResult[] = [];
    
    const ageTerms = ['age', 'children', 'kids', 'family', 'adult', 'senior'];
    const activityTerms = ['activity', 'tour', 'adventure', 'experience'];
    
    const hasActivityContent = activityTerms.some(term => text.includes(term));
    const hasAgeMention = ageTerms.some(term => text.includes(term));
    
    if (hasActivityContent && !hasAgeMention) {
      violations.push({
        id: 'age_appropriateness_missing',
        guidelineId: guideline.id,
        severity: 'info',
        message: 'Activity content without age information',
        suggestion: 'Consider adding age suitability information',
        context: 'Activity-related content found'
      });
    }

    return violations;
  };

  const checkWeatherSeasons = (text: string, guideline: CulturalGuideline): ValidationResult[] => {
    const violations: ValidationResult[] = [];
    
    const weatherTerms = ['weather', 'climate', 'temperature', 'season', 'rain', 'sun'];
    const destinationTerms = ['destination', 'location', 'place', 'country', 'city'];
    
    const hasDestinationContent = destinationTerms.some(term => text.includes(term));
    const hasWeatherMention = weatherTerms.some(term => text.includes(term));
    
    if (hasDestinationContent && !hasWeatherMention) {
      violations.push({
        id: 'weather_seasons_missing',
        guidelineId: guideline.id,
        severity: 'info',
        message: 'Destination content without weather information',
        suggestion: 'Consider adding seasonal weather information',
        context: 'Destination-related content found'
      });
    }

    return violations;
  };

  const checkLanguageClarity = (text: string, guideline: CulturalGuideline): ValidationResult[] => {
    const violations: ValidationResult[] = [];
    
    // Check for informal language or unclear terms
    const informalTerms = ['gonna', 'wanna', 'cool', 'awesome', 'super'];
    const vagueLangTerms = ['maybe', 'possibly', 'might', 'could be', 'sort of'];
    
    informalTerms.forEach(term => {
      if (text.includes(term)) {
        violations.push({
          id: `informal_language_${term}`,
          guidelineId: guideline.id,
          severity: 'warning',
          message: `Informal language detected: "${term}"`,
          suggestion: 'Use professional language appropriate for international travelers',
          context: `Found: "${term}"`
        });
      }
    });

    return violations;
  };

  const checkInclusiveContent = (text: string, guideline: CulturalGuideline): ValidationResult[] => {
    const violations: ValidationResult[] = [];
    
    // Check for potentially exclusive language
    const exclusiveTerms = ['guys', 'ladies and gentlemen', 'able-bodied', 'normal'];
    
    exclusiveTerms.forEach(term => {
      if (text.includes(term)) {
        violations.push({
          id: `inclusive_content_${term}`,
          guidelineId: guideline.id,
          severity: 'warning',
          message: `Potentially exclusive language detected: "${term}"`,
          suggestion: 'Use inclusive language that welcomes all travelers',
          context: `Found: "${term}"`
        });
      }
    });

    return violations;
  };

  const checkBookingTransparency = (text: string, guideline: CulturalGuideline): ValidationResult[] => {
    const violations: ValidationResult[] = [];
    
    const bookingTerms = ['price', 'cost', 'booking', 'reservation', 'payment'];
    const transparencyTerms = ['included', 'excluded', 'additional', 'extra', 'cancellation'];
    
    const hasBookingContent = bookingTerms.some(term => text.includes(term));
    const hasTransparencyMention = transparencyTerms.some(term => text.includes(term));
    
    if (hasBookingContent && !hasTransparencyMention) {
      violations.push({
        id: 'booking_transparency_missing',
        guidelineId: guideline.id,
        severity: 'warning',
        message: 'Booking content without clear terms',
        suggestion: 'Include clear information about what is included/excluded',
        context: 'Booking-related content found'
      });
    }

    return violations;
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Eye className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-100 text-red-800 border-red-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'religious': return <Heart className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      case 'linguistic': return <MessageCircle className="h-4 w-4" />;
      case 'business': return <Zap className="h-4 w-4" />;
      case 'travel': return <Globe className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const errorCount = validationResults.filter(r => r.severity === 'error').length;
  const warningCount = validationResults.filter(r => r.severity === 'warning').length;
  const infoCount = validationResults.filter(r => r.severity === 'info').length;

  const canApprove = errorCount === 0;

  useEffect(() => {
    validateContent();
  }, [content, language]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Universal Content Validation
            <Badge variant="outline" className="ml-2">
              {language === 'ar' ? 'العربية' : 'English'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm">{errorCount} Errors</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">{warningCount} Warnings</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-500" />
              <span className="text-sm">{infoCount} Info</span>
            </div>
            <Button
              onClick={validateContent}
              disabled={isValidating}
              className="ml-auto"
            >
              {isValidating ? 'Validating...' : 'Re-validate'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
              <TabsTrigger value="results">Validation Results</TabsTrigger>
              <TabsTrigger value="approval">Approval</TabsTrigger>
            </TabsList>

            <TabsContent value="guidelines" className="space-y-4">
              <div className="space-y-4">
                {universalGuidelines
                  .filter(g => g.language === 'both' || g.language === language)
                  .map((guideline) => (
                    <Card key={guideline.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getCategoryIcon(guideline.category)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{guideline.title}</h3>
                              <Badge className={getSeverityColor(guideline.severity)}>
                                {guideline.severity}
                              </Badge>
                              <Badge variant="outline">{guideline.category}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{guideline.description}</p>
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Examples:</h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {guideline.examples.map((example, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <span className="text-blue-500">•</span>
                                    <span>{example}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {validationResults.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Issues Found</h3>
                  <p className="text-gray-600">
                    The content passes all cultural validation checks.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {validationResults.map((result) => (
                    <Alert key={result.id} className={getSeverityColor(result.severity)}>
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(result.severity)}
                        <div className="flex-1">
                          <AlertDescription>
                            <div className="space-y-2">
                              <p className="font-medium">{result.message}</p>
                              <p className="text-sm opacity-90">{result.context}</p>
                              {result.suggestion && (
                                <p className="text-sm bg-white bg-opacity-50 p-2 rounded">
                                  <strong>Suggestion:</strong> {result.suggestion}
                                </p>
                              )}
                            </div>
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="approval" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{errorCount}</div>
                      <div className="text-sm text-gray-600">Errors</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{warningCount}</div>
                      <div className="text-sm text-gray-600">Warnings</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Eye className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{infoCount}</div>
                      <div className="text-sm text-gray-600">Info</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Approval Notes (Optional)
                    </label>
                    <Textarea
                      placeholder="Add any notes about the cultural validation..."
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => onApprove(true, approvalNotes)}
                      disabled={!canApprove}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve Content
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onApprove(false, approvalNotes)}
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject Content
                    </Button>
                  </div>

                  {!canApprove && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Content cannot be approved due to {errorCount} error(s). 
                        Please resolve all errors before approval.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CulturalContentValidator;