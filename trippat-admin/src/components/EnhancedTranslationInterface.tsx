'use client'

import React, { useState, useEffect } from 'react'
import { 
  Save, 
  Edit, 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Languages,
  Plus,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Copy,
  Undo,
  Redo,
  AlignLeft,
  AlignRight,
  BookOpen,
  FileText,
  List,
  Star,
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  Info,
  AlertTriangle,
  Lightbulb,
  Target
} from 'lucide-react'
import TranslationStatusIndicator from './TranslationStatusIndicator'
import LanguageSwitcher from './LanguageSwitcher'

interface Package {
  _id: string
  title: string
  title_ar?: string
  description: string
  description_ar?: string
  destination: string
  destination_ar?: string
  inclusions: string[]
  inclusions_ar?: string[]
  exclusions: string[]
  exclusions_ar?: string[]
  highlights: string[]
  highlights_ar?: string[]
  price: number
  duration: number
  category: string
  itinerary: Array<{
    day: number
    title: string
    title_ar?: string
    description: string
    description_ar?: string
    activities: string[]
    activities_ar?: string[]
  }>
}

interface TranslationField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'array' | 'rich-text'
  englishValue: string | string[]
  arabicValue: string | string[]
  isRequired: boolean
  maxLength?: number
  guidelines?: string
  culturalNotes?: string
}

interface EnhancedTranslationInterfaceProps {
  package: Package
  onSave: (updates: any) => Promise<void>
  onClose: () => void
}

const EnhancedTranslationInterface: React.FC<EnhancedTranslationInterfaceProps> = ({
  package: pkg,
  onSave,
  onClose
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ar'>('en')
  const [previewMode, setPreviewMode] = useState(false)
  const [rtlPreview, setRtlPreview] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [changes, setChanges] = useState<any>({})
  const [showGuidelines, setShowGuidelines] = useState(true)
  const [showCulturalNotes, setShowCulturalNotes] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [undoStack, setUndoStack] = useState<any[]>([])
  const [redoStack, setRedoStack] = useState<any[]>([])

  const [translationFields, setTranslationFields] = useState<TranslationField[]>([
    {
      key: 'title',
      label: 'Package Title',
      type: 'text',
      englishValue: pkg.title,
      arabicValue: pkg.title_ar || '',
      isRequired: true,
      maxLength: 100,
      guidelines: 'Keep the title concise and descriptive. Include the destination and main attraction.',
      culturalNotes: 'Ensure the title appeals to Arabic-speaking travelers. Consider cultural significance of destinations.'
    },
    {
      key: 'description',
      label: 'Package Description',
      type: 'textarea',
      englishValue: pkg.description,
      arabicValue: pkg.description_ar || '',
      isRequired: true,
      maxLength: 2000,
      guidelines: 'Provide detailed information about the package. Include highlights, activities, and unique selling points.',
      culturalNotes: 'Emphasize family-friendly aspects, halal food options, and cultural sensitivity where relevant.'
    },
    {
      key: 'destination',
      label: 'Destination',
      type: 'text',
      englishValue: pkg.destination,
      arabicValue: pkg.destination_ar || '',
      isRequired: true,
      maxLength: 100,
      guidelines: 'Use the local name of the destination followed by the country.',
      culturalNotes: 'Use Arabic names for destinations when available and commonly used.'
    },
    {
      key: 'inclusions',
      label: 'Inclusions',
      type: 'array',
      englishValue: pkg.inclusions,
      arabicValue: pkg.inclusions_ar || [],
      isRequired: false,
      guidelines: 'List all services and amenities included in the package.',
      culturalNotes: 'Highlight halal dining options, prayer facilities, and family-friendly amenities.'
    },
    {
      key: 'exclusions',
      label: 'Exclusions',
      type: 'array',
      englishValue: pkg.exclusions,
      arabicValue: pkg.exclusions_ar || [],
      isRequired: false,
      guidelines: 'Clearly state what is not included to avoid misunderstandings.',
      culturalNotes: 'Be transparent about non-halal options or activities that may not be suitable for all travelers.'
    },
    {
      key: 'highlights',
      label: 'Highlights',
      type: 'array',
      englishValue: pkg.highlights,
      arabicValue: pkg.highlights_ar || [],
      isRequired: false,
      guidelines: 'Showcase the most exciting and unique aspects of the package.',
      culturalNotes: 'Emphasize experiences that align with Islamic values and cultural interests.'
    }
  ])

  const culturalGuidelines = [
    {
      icon: <Star className="h-4 w-4 text-yellow-500" />,
      title: 'Cultural Sensitivity',
      description: 'Ensure content respects Islamic values and cultural norms. Avoid references to alcohol, gambling, or inappropriate activities.'
    },
    {
      icon: <Users className="h-4 w-4 text-blue-500" />,
      title: 'Family-Friendly Focus',
      description: 'Emphasize family-friendly aspects of destinations and activities. Highlight separate facilities for men and women where relevant.'
    },
    {
      icon: <MapPin className="h-4 w-4 text-green-500" />,
      title: 'Halal Food & Prayer',
      description: 'Mention halal dining options and prayer facilities availability. This is crucial for Muslim travelers.'
    },
    {
      icon: <Calendar className="h-4 w-4 text-purple-500" />,
      title: 'Religious Considerations',
      description: 'Consider Islamic holidays and prayer times when describing activities and schedules.'
    },
    {
      icon: <BookOpen className="h-4 w-4 text-indigo-500" />,
      title: 'Language & Tone',
      description: 'Use formal Arabic language. Avoid colloquialisms and ensure proper Arabic grammar and spelling.'
    }
  ]

  const getFieldValue = (field: TranslationField, language: 'en' | 'ar') => {
    if (language === 'ar') {
      return changes[`${field.key}_ar`] !== undefined ? changes[`${field.key}_ar`] : field.arabicValue
    }
    return field.englishValue
  }

  const updateFieldValue = (fieldKey: string, value: string | string[]) => {
    const newChanges = { ...changes, [`${fieldKey}_ar`]: value }
    setChanges(newChanges)
    
    // Update the field in translationFields
    setTranslationFields(prev => prev.map(field => 
      field.key === fieldKey 
        ? { ...field, arabicValue: value }
        : field
    ))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(changes)
      setChanges({})
      setUndoStack([])
      setRedoStack([])
    } catch (error) {
      console.error('Error saving translation:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1]
      setRedoStack([...redoStack, changes])
      setChanges(lastState)
      setUndoStack(undoStack.slice(0, -1))
    }
  }

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1]
      setUndoStack([...undoStack, changes])
      setChanges(nextState)
      setRedoStack(redoStack.slice(0, -1))
    }
  }

  const copyFromEnglish = (fieldKey: string) => {
    const field = translationFields.find(f => f.key === fieldKey)
    if (field) {
      updateFieldValue(fieldKey, field.englishValue)
    }
  }

  const getTranslationStatus = () => {
    const totalFields = translationFields.length
    const completedFields = translationFields.filter(field => {
      const arabicValue = getFieldValue(field, 'ar')
      return arabicValue && (Array.isArray(arabicValue) ? arabicValue.length > 0 : arabicValue.trim().length > 0)
    }).length
    
    return {
      percentage: Math.round((completedFields / totalFields) * 100),
      completed: completedFields,
      total: totalFields
    }
  }

  const filteredFields = translationFields.filter(field =>
    field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.key.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const status = getTranslationStatus()

  const TextFieldEditor: React.FC<{ field: TranslationField }> = ({ field }) => {
    const [localValue, setLocalValue] = useState(getFieldValue(field, 'ar') as string)
    
    const handleSave = () => {
      updateFieldValue(field.key, localValue)
      setEditingField(null)
    }

    const handleCancel = () => {
      setLocalValue(getFieldValue(field, 'ar') as string)
      setEditingField(null)
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              English
            </label>
            <div className="p-3 bg-gray-50 rounded-lg border text-sm">
              {field.englishValue}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arabic العربية
            </label>
            {field.type === 'textarea' ? (
              <textarea
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={6}
                dir="rtl"
                placeholder="أدخل الترجمة العربية..."
                maxLength={field.maxLength}
              />
            ) : (
              <input
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                dir="rtl"
                placeholder="أدخل الترجمة العربية..."
                maxLength={field.maxLength}
              />
            )}
            {field.maxLength && (
              <div className="text-xs text-gray-500 mt-1">
                {localValue.length}/{field.maxLength} characters
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-1"
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => copyFromEnglish(field.key)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1"
          >
            <Copy className="h-4 w-4" />
            <span>Copy from English</span>
          </button>
        </div>
      </div>
    )
  }

  const ArrayFieldEditor: React.FC<{ field: TranslationField }> = ({ field }) => {
    const [localValue, setLocalValue] = useState(getFieldValue(field, 'ar') as string[])
    
    const addItem = () => {
      setLocalValue([...localValue, ''])
    }

    const removeItem = (index: number) => {
      setLocalValue(localValue.filter((_, i) => i !== index))
    }

    const updateItem = (index: number, value: string) => {
      const newValue = [...localValue]
      newValue[index] = value
      setLocalValue(newValue)
    }

    const handleSave = () => {
      updateFieldValue(field.key, localValue.filter(v => v.trim()))
      setEditingField(null)
    }

    const handleCancel = () => {
      setLocalValue(getFieldValue(field, 'ar') as string[])
      setEditingField(null)
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              English
            </label>
            <div className="space-y-2">
              {(field.englishValue as string[]).map((item, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded border text-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arabic العربية
            </label>
            <div className="space-y-2">
              {localValue.map((value, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateItem(index, e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    dir="rtl"
                    placeholder="أدخل الترجمة العربية..."
                  />
                  <button
                    onClick={() => removeItem(index)}
                    className="px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addItem}
                className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 text-gray-600 hover:text-gray-800"
              >
                <Plus className="h-4 w-4 mx-auto" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-1"
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <Languages className="h-7 w-7 text-blue-600" />
                <span>Enhanced Translation Interface</span>
              </h1>
              <p className="text-gray-600 mt-1">
                {pkg.title} - {status.completed}/{status.total} fields completed ({status.percentage}%)
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </button>
            </div>
            
            <LanguageSwitcher
              currentLanguage={currentLanguage}
              onLanguageChange={(lang) => setCurrentLanguage(lang as 'en' | 'ar')}
            />
            
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                previewMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="ml-2">{previewMode ? 'Edit' : 'Preview'}</span>
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving || Object.keys(changes).length === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save All'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Progress */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">Translation Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completed</span>
                  <span>{status.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${status.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {status.completed} of {status.total} fields completed
                </div>
              </div>
            </div>

            {/* Cultural Guidelines */}
            {showCulturalNotes && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Cultural Guidelines</h3>
                  <button
                    onClick={() => setShowCulturalNotes(!showCulturalNotes)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <EyeOff className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {culturalGuidelines.map((guideline, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      {guideline.icon}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {guideline.title}
                        </div>
                        <div className="text-xs text-gray-600">
                          {guideline.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {filteredFields.map((field) => (
                <div key={field.key} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">{field.label}</h3>
                      {field.isRequired && (
                        <span className="text-red-500 text-sm">*</span>
                      )}
                      <div className="flex items-center space-x-1">
                        {getFieldValue(field, 'ar') && (Array.isArray(getFieldValue(field, 'ar')) ? (getFieldValue(field, 'ar') as string[]).length > 0 : (getFieldValue(field, 'ar') as string).trim().length > 0) ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {field.guidelines && (
                        <div className="group relative">
                          <Info className="h-4 w-4 text-gray-400 cursor-help" />
                          <div className="absolute right-0 top-6 w-64 bg-black text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            {field.guidelines}
                          </div>
                        </div>
                      )}
                      
                      <button
                        onClick={() => setEditingField(editingField === field.key ? null : field.key)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {field.culturalNotes && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Cultural Note:</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">{field.culturalNotes}</p>
                    </div>
                  )}

                  {editingField === field.key ? (
                    field.type === 'array' ? (
                      <ArrayFieldEditor field={field} />
                    ) : (
                      <TextFieldEditor field={field} />
                    )
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          English
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg border text-sm">
                          {Array.isArray(field.englishValue) ? (
                            <ul className="space-y-1">
                              {field.englishValue.map((item, index) => (
                                <li key={index}>• {item}</li>
                              ))}
                            </ul>
                          ) : (
                            field.englishValue
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Arabic العربية
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg border text-sm min-h-[44px] flex items-center" dir="rtl">
                          {(() => {
                            const arabicValue = getFieldValue(field, 'ar')
                            if (Array.isArray(arabicValue)) {
                              return arabicValue.length > 0 ? (
                                <ul className="space-y-1">
                                  {arabicValue.map((item, index) => (
                                    <li key={index}>• {item}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-gray-400 italic">No Arabic translation</span>
                              )
                            } else {
                              return arabicValue ? (
                                arabicValue
                              ) : (
                                <span className="text-gray-400 italic">No Arabic translation</span>
                              )
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedTranslationInterface