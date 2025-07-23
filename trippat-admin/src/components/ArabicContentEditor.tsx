'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  Edit, 
  Save, 
  RotateCcw, 
  Languages, 
  AlignRight, 
  AlignLeft,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Monitor,
  Smartphone,
  Copy,
  Wand2
} from 'lucide-react';

interface ArabicContentEditorProps {
  packageId: string;
  englishContent: {
    title: string;
    description: string;
    destination: string;
    inclusions: string[];
    exclusions: string[];
    highlights: string[];
    itinerary: Array<{
      day: number;
      title: string;
      description: string;
      activities: string[];
    }>;
  };
  arabicContent: {
    title_ar?: string;
    description_ar?: string;
    destination_ar?: string;
    inclusions_ar?: string[];
    exclusions_ar?: string[];
    highlights_ar?: string[];
    itinerary?: Array<{
      day: number;
      title_ar?: string;
      description_ar?: string;
      activities_ar?: string[];
    }>;
  };
  onSave: (arabicContent: any) => Promise<void>;
  onPreview: (content: any, mode: 'desktop' | 'mobile') => void;
}

const ArabicContentEditor: React.FC<ArabicContentEditorProps> = ({
  packageId,
  englishContent,
  arabicContent,
  onSave,
  onPreview
}) => {
  const [editMode, setEditMode] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showRTL, setShowRTL] = useState(true);
  const [currentContent, setCurrentContent] = useState(arabicContent);
  const [activeTab, setActiveTab] = useState('basic');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [culturalNotes, setCulturalNotes] = useState<string>('');

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (editMode && currentContent !== arabicContent) {
        handleAutoSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [editMode, currentContent, arabicContent]);

  const handleAutoSave = async () => {
    try {
      await onSave(currentContent);
      console.log('Auto-saved successfully');
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleSave = async () => {
    try {
      await onSave(currentContent);
      setEditMode(false);
      setValidationErrors([]);
    } catch (error) {
      console.error('Save failed:', error);
      setValidationErrors(['Failed to save content. Please try again.']);
    }
  };

  const handleReset = () => {
    setCurrentContent(arabicContent);
    setValidationErrors([]);
  };

  const handlePreview = () => {
    onPreview(currentContent, previewMode);
  };

  const handleAIAssist = async (field: string, englishText: string) => {
    try {
      const response = await fetch('/api/translations/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: englishText,
          sourceLanguage: 'en',
          targetLanguage: 'ar',
          context: 'travel_package',
          culturalConsiderations: true
        })
      });
      
      const data = await response.json();
      if (data.translation) {
        setCurrentContent({
          ...currentContent,
          [field]: data.translation
        });
      }
    } catch (error) {
      console.error('AI assist failed:', error);
    }
  };

  const validateArabicContent = () => {
    const errors: string[] = [];
    
    if (!currentContent.title_ar?.trim()) {
      errors.push('Arabic title is required');
    }
    
    if (!currentContent.description_ar?.trim()) {
      errors.push('Arabic description is required');
    }
    
    if (!currentContent.destination_ar?.trim()) {
      errors.push('Arabic destination is required');
    }
    
    // Check for cultural appropriateness (basic validation)
    const culturallyInappropriate = ['alcohol', 'bar', 'nightclub', 'casino'];
    const allText = `${currentContent.title_ar} ${currentContent.description_ar}`.toLowerCase();
    
    culturallyInappropriate.forEach(term => {
      if (allText.includes(term)) {
        errors.push(`Content may contain culturally inappropriate terms: ${term}`);
      }
    });
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const calculateCompleteness = () => {
    const fields = [
      'title_ar',
      'description_ar', 
      'destination_ar',
      'inclusions_ar',
      'exclusions_ar',
      'highlights_ar'
    ];
    
    let completed = 0;
    fields.forEach(field => {
      if (currentContent[field] && 
          (typeof currentContent[field] === 'string' ? currentContent[field].trim() : currentContent[field].length > 0)) {
        completed++;
      }
    });
    
    return Math.round((completed / fields.length) * 100);
  };

  const CompletionBadge = () => {
    const completeness = calculateCompleteness();
    const color = completeness === 100 ? 'bg-green-100 text-green-800' : 
                  completeness >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800';
    
    return (
      <Badge className={color}>
        {completeness}% Complete
      </Badge>
    );
  };

  const RTLTextField = ({ 
    label, 
    value, 
    onChange, 
    placeholder, 
    multiline = false,
    englishText = '',
    fieldName = ''
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    multiline?: boolean;
    englishText?: string;
    fieldName?: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-2">
          {englishText && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAIAssist(fieldName, englishText)}
            >
              <Wand2 className="h-4 w-4 mr-1" />
              AI Assist
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRTL(!showRTL)}
          >
            {showRTL ? <AlignLeft className="h-4 w-4" /> : <AlignRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {englishText && (
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
          <span className="font-medium">English:</span> {englishText}
        </div>
      )}
      
      {multiline ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`min-h-[100px] ${showRTL ? 'text-right' : 'text-left'}`}
          dir={showRTL ? 'rtl' : 'ltr'}
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={showRTL ? 'text-right' : 'text-left'}
          dir={showRTL ? 'rtl' : 'ltr'}
        />
      )}
    </div>
  );

  const ArrayField = ({ 
    label, 
    items, 
    onChange, 
    placeholder,
    englishItems = []
  }: {
    label: string;
    items: string[];
    onChange: (items: string[]) => void;
    placeholder: string;
    englishItems?: string[];
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      
      {englishItems.length > 0 && (
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
          <span className="font-medium">English:</span>
          <ul className="list-disc list-inside mt-1">
            {englishItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={item}
              onChange={(e) => {
                const newItems = [...items];
                newItems[index] = e.target.value;
                onChange(newItems);
              }}
              placeholder={placeholder}
              className={showRTL ? 'text-right' : 'text-left'}
              dir={showRTL ? 'rtl' : 'ltr'}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newItems = items.filter((_, i) => i !== index);
                onChange(newItems);
              }}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange([...items, ''])}
        >
          Add Item
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Arabic Content Editor
              <CompletionBadge />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(previewMode === 'desktop' ? 'mobile' : 'desktop')}
              >
                {previewMode === 'desktop' ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                {previewMode}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode(!editMode)}
              >
                <Edit className="h-4 w-4 mr-1" />
                {editMode ? 'View' : 'Edit'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Content Guidelines */}
          <Alert>
            <BookOpen className="h-4 w-4" />
            <AlertDescription>
              <strong>Content Guidelines:</strong> When creating Arabic content, ensure it uses appropriate 
              formal language, considers Saudi Arabian cultural context, and provides inclusive information 
              for all travelers including accessibility and dietary preferences.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Content Editor */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <RTLTextField
                label="Package Title (Arabic)"
                value={currentContent.title_ar || ''}
                onChange={(value) => setCurrentContent({...currentContent, title_ar: value})}
                placeholder="أدخل عنوان الحزمة باللغة العربية"
                englishText={englishContent.title}
                fieldName="title_ar"
              />
              
              <RTLTextField
                label="Description (Arabic)"
                value={currentContent.description_ar || ''}
                onChange={(value) => setCurrentContent({...currentContent, description_ar: value})}
                placeholder="أدخل وصف الحزمة باللغة العربية"
                multiline
                englishText={englishContent.description}
                fieldName="description_ar"
              />
              
              <RTLTextField
                label="Destination (Arabic)"
                value={currentContent.destination_ar || ''}
                onChange={(value) => setCurrentContent({...currentContent, destination_ar: value})}
                placeholder="أدخل الوجهة باللغة العربية"
                englishText={englishContent.destination}
                fieldName="destination_ar"
              />
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <ArrayField
                label="Inclusions (Arabic)"
                items={currentContent.inclusions_ar || []}
                onChange={(items) => setCurrentContent({...currentContent, inclusions_ar: items})}
                placeholder="أدخل ما يشمله باللغة العربية"
                englishItems={englishContent.inclusions}
              />
              
              <ArrayField
                label="Exclusions (Arabic)"
                items={currentContent.exclusions_ar || []}
                onChange={(items) => setCurrentContent({...currentContent, exclusions_ar: items})}
                placeholder="أدخل ما لا يشمله باللغة العربية"
                englishItems={englishContent.exclusions}
              />
              
              <ArrayField
                label="Highlights (Arabic)"
                items={currentContent.highlights_ar || []}
                onChange={(items) => setCurrentContent({...currentContent, highlights_ar: items})}
                placeholder="أدخل أبرز النقاط باللغة العربية"
                englishItems={englishContent.highlights}
              />
            </TabsContent>

            <TabsContent value="itinerary" className="space-y-4">
              {englishContent.itinerary.map((day, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">Day {day.day}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RTLTextField
                      label={`Day ${day.day} Title (Arabic)`}
                      value={currentContent.itinerary?.[index]?.title_ar || ''}
                      onChange={(value) => {
                        const newItinerary = [...(currentContent.itinerary || [])];
                        newItinerary[index] = {
                          ...newItinerary[index],
                          day: day.day,
                          title_ar: value
                        };
                        setCurrentContent({...currentContent, itinerary: newItinerary});
                      }}
                      placeholder="أدخل عنوان اليوم باللغة العربية"
                      englishText={day.title}
                    />
                    
                    <RTLTextField
                      label={`Day ${day.day} Description (Arabic)`}
                      value={currentContent.itinerary?.[index]?.description_ar || ''}
                      onChange={(value) => {
                        const newItinerary = [...(currentContent.itinerary || [])];
                        newItinerary[index] = {
                          ...newItinerary[index],
                          day: day.day,
                          description_ar: value
                        };
                        setCurrentContent({...currentContent, itinerary: newItinerary});
                      }}
                      placeholder="أدخل وصف اليوم باللغة العربية"
                      multiline
                      englishText={day.description}
                    />
                    
                    <ArrayField
                      label={`Day ${day.day} Activities (Arabic)`}
                      items={currentContent.itinerary?.[index]?.activities_ar || []}
                      onChange={(items) => {
                        const newItinerary = [...(currentContent.itinerary || [])];
                        newItinerary[index] = {
                          ...newItinerary[index],
                          day: day.day,
                          activities_ar: items
                        };
                        setCurrentContent({...currentContent, itinerary: newItinerary});
                      }}
                      placeholder="أدخل النشاط باللغة العربية"
                      englishItems={day.activities}
                    />
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className={`p-6 border rounded-lg bg-white ${showRTL ? 'text-right' : 'text-left'}`} dir={showRTL ? 'rtl' : 'ltr'}>
                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">
                      {currentContent.title_ar || englishContent.title}
                    </h1>
                    <p className="text-gray-600 mb-4">
                      {currentContent.destination_ar || englishContent.destination}
                    </p>
                    <p className="text-gray-800 leading-relaxed">
                      {currentContent.description_ar || englishContent.description}
                    </p>
                  </div>
                  
                  {(currentContent.highlights_ar?.length || englishContent.highlights.length) > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Highlights</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {(currentContent.highlights_ar || englishContent.highlights).map((highlight, index) => (
                          <li key={index} className="text-gray-700">{highlight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Actions */}
      {editMode && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  onClick={() => validateArabicContent()}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Validate
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!validateArabicContent()}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ArabicContentEditor;