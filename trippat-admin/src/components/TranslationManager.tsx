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
  Search
} from 'lucide-react'

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

interface TranslationStats {
  totalPackages: number
  arabicTranslations: {
    title: { count: number; percentage: number }
    description: { count: number; percentage: number }
    destination: { count: number; percentage: number }
  }
  overallCompleteness: number
}

const TranslationManager: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([])
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [translationStats, setTranslationStats] = useState<TranslationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterComplete, setFilterComplete] = useState<'all' | 'complete' | 'incomplete'>('all')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchPackages()
    fetchTranslationStats()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages')
      const data = await response.json()
      if (data.success) {
        setPackages(data.data.packages)
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
      setErrorMessage('Failed to load packages')
    } finally {
      setLoading(false)
    }
  }

  const fetchTranslationStats = async () => {
    try {
      const response = await fetch('/api/packages/admin/translation-stats')
      const data = await response.json()
      if (data.success) {
        setTranslationStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching translation stats:', error)
    }
  }

  const saveTranslation = async (packageId: string, updates: any) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/packages/${packageId}/translations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: 'ar',
          ...updates
        })
      })

      const data = await response.json()
      if (data.success) {
        setSuccessMessage('Translation saved successfully')
        fetchPackages()
        fetchTranslationStats()
      } else {
        setErrorMessage(data.message || 'Failed to save translation')
      }
    } catch (error) {
      console.error('Error saving translation:', error)
      setErrorMessage('Failed to save translation')
    } finally {
      setSaving(false)
      setEditingField(null)
    }
  }

  const getTranslationCompleteness = (pkg: Package) => {
    const fields = ['title_ar', 'description_ar', 'destination_ar']
    const completed = fields.filter(field => pkg[field as keyof Package] && (pkg[field as keyof Package] as string).trim().length > 0)
    return Math.round((completed.length / fields.length) * 100)
  }

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (pkg.title_ar && pkg.title_ar.includes(searchTerm)) ||
                         (pkg.destination_ar && pkg.destination_ar.includes(searchTerm))

    if (filterComplete === 'complete') {
      return matchesSearch && getTranslationCompleteness(pkg) === 100
    } else if (filterComplete === 'incomplete') {
      return matchesSearch && getTranslationCompleteness(pkg) < 100
    }
    
    return matchesSearch
  })

  const TranslationField: React.FC<{
    label: string
    originalValue: string
    translatedValue: string
    fieldName: string
    packageId: string
    multiline?: boolean
  }> = ({ label, originalValue, translatedValue, fieldName, packageId, multiline = false }) => {
    const [value, setValue] = useState(translatedValue || '')
    const [isEditing, setIsEditing] = useState(false)

    const handleSave = () => {
      saveTranslation(packageId, { [fieldName]: value })
      setIsEditing(false)
    }

    const handleCancel = () => {
      setValue(translatedValue || '')
      setIsEditing(false)
    }

    return (
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">{label}</h4>
          <div className="flex items-center space-x-2">
            {translatedValue ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-primary hover:text-primary-700"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              English
            </label>
            <div className="p-3 bg-gray-50 rounded border text-sm">
              {originalValue}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arabic العربية
            </label>
            {isEditing ? (
              <div className="space-y-2">
                {multiline ? (
                  <textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={4}
                    dir="rtl"
                    placeholder="أدخل الترجمة العربية..."
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    dir="rtl"
                    placeholder="أدخل الترجمة العربية..."
                  />
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-1"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded border text-sm min-h-[44px] flex items-center" dir="rtl">
                {translatedValue || (
                  <span className="text-gray-400 italic">No Arabic translation</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const ArrayTranslationField: React.FC<{
    label: string
    originalValues: string[]
    translatedValues: string[]
    fieldName: string
    packageId: string
  }> = ({ label, originalValues, translatedValues, fieldName, packageId }) => {
    const [values, setValues] = useState<string[]>(translatedValues || [])
    const [isEditing, setIsEditing] = useState(false)

    const handleSave = () => {
      saveTranslation(packageId, { [fieldName]: values.filter(v => v.trim()) })
      setIsEditing(false)
    }

    const handleCancel = () => {
      setValues(translatedValues || [])
      setIsEditing(false)
    }

    const addItem = () => {
      setValues([...values, ''])
    }

    const removeItem = (index: number) => {
      setValues(values.filter((_, i) => i !== index))
    }

    const updateItem = (index: number, value: string) => {
      const newValues = [...values]
      newValues[index] = value
      setValues(newValues)
    }

    return (
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">{label}</h4>
          <div className="flex items-center space-x-2">
            {translatedValues.length > 0 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-primary hover:text-primary-700"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              English
            </label>
            <div className="space-y-2">
              {originalValues.map((item, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded border text-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arabic العربية
            </label>
            {isEditing ? (
              <div className="space-y-2">
                {values.map((value, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateItem(index, e.target.value)}
                      className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      dir="rtl"
                      placeholder="أدخل الترجمة العربية..."
                    />
                    <button
                      onClick={() => removeItem(index)}
                      className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addItem}
                  className="w-full p-2 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 text-gray-600 hover:text-gray-800"
                >
                  <Plus className="h-4 w-4 mx-auto" />
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-1"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {translatedValues.length > 0 ? (
                  translatedValues.map((item, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded border text-sm" dir="rtl">
                      {item}
                    </div>
                  ))
                ) : (
                  <div className="p-2 bg-gray-50 rounded border text-sm text-gray-400 italic">
                    No Arabic translations
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Languages className="h-8 w-8 text-primary" />
          <span>Translation Manager</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Manage Arabic translations for travel packages
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-green-800">{successMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-red-800">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Translation Stats */}
      {translationStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-gray-900">{translationStats.totalPackages}</div>
            <div className="text-sm text-gray-600">Total Packages</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{translationStats.arabicTranslations.title.count}</div>
            <div className="text-sm text-gray-600">Arabic Titles ({translationStats.arabicTranslations.title.percentage}%)</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-primary">{translationStats.arabicTranslations.description.count}</div>
            <div className="text-sm text-gray-600">Arabic Descriptions ({translationStats.arabicTranslations.description.percentage}%)</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-purple-600">{translationStats.overallCompleteness}%</div>
            <div className="text-sm text-gray-600">Overall Completeness</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={filterComplete}
          onChange={(e) => setFilterComplete(e.target.value as 'all' | 'complete' | 'incomplete')}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All Packages</option>
          <option value="complete">Complete Translations</option>
          <option value="incomplete">Incomplete Translations</option>
        </select>
      </div>

      {/* Package List */}
      <div className="space-y-4">
        {filteredPackages.map((pkg) => (
          <div key={pkg._id} className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{pkg.title}</h3>
                <p className="text-sm text-gray-600">{pkg.destination} • {pkg.duration} days</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="text-gray-600">Translation: </span>
                  <span className={`font-medium ${getTranslationCompleteness(pkg) === 100 ? 'text-green-600' : 'text-red-600'}`}>
                    {getTranslationCompleteness(pkg)}%
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPackage(selectedPackage?._id === pkg._id ? null : pkg)}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 flex items-center space-x-1"
                >
                  <Globe className="h-4 w-4" />
                  <span>{selectedPackage?._id === pkg._id ? 'Hide' : 'Translate'}</span>
                </button>
              </div>
            </div>

            {selectedPackage?._id === pkg._id && (
              <div className="space-y-6 pt-4 border-t">
                <TranslationField
                  label="Title"
                  originalValue={pkg.title}
                  translatedValue={pkg.title_ar || ''}
                  fieldName="title_ar"
                  packageId={pkg._id}
                />

                <TranslationField
                  label="Description"
                  originalValue={pkg.description}
                  translatedValue={pkg.description_ar || ''}
                  fieldName="description_ar"
                  packageId={pkg._id}
                  multiline={true}
                />

                <TranslationField
                  label="Destination"
                  originalValue={pkg.destination}
                  translatedValue={pkg.destination_ar || ''}
                  fieldName="destination_ar"
                  packageId={pkg._id}
                />

                <ArrayTranslationField
                  label="Inclusions"
                  originalValues={pkg.inclusions}
                  translatedValues={pkg.inclusions_ar || []}
                  fieldName="inclusions_ar"
                  packageId={pkg._id}
                />

                <ArrayTranslationField
                  label="Exclusions"
                  originalValues={pkg.exclusions}
                  translatedValues={pkg.exclusions_ar || []}
                  fieldName="exclusions_ar"
                  packageId={pkg._id}
                />

                <ArrayTranslationField
                  label="Highlights"
                  originalValues={pkg.highlights}
                  translatedValues={pkg.highlights_ar || []}
                  fieldName="highlights_ar"
                  packageId={pkg._id}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredPackages.length === 0 && (
        <div className="text-center py-8">
          <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No packages found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}

export default TranslationManager