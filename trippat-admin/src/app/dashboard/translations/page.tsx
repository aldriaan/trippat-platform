'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/shared/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectOption } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Languages, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Package,
  BarChart3,
  Eye,
  Edit
} from 'lucide-react';
import TranslationInterface from '@/components/TranslationInterface';

interface Translation {
  id: string;
  contentType: string;
  contentId: string;
  fieldName: string;
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  status: 'pending' | 'in_progress' | 'completed' | 'reviewed' | 'rejected' | 'needs_revision';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  qualityScore?: number;
  culturalValidation: 'pending' | 'approved' | 'needs_review' | 'rejected';
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  dueDate?: string;
  createdAt: string;
  comments: any[];
}

interface TranslationStats {
  statusStats: Array<{
    _id: string;
    count: number;
    avgQualityScore: number;
  }>;
  languageStats: Array<{
    _id: string;
    count: number;
    completed: number;
  }>;
  overdueCount: number;
}

const TranslationDashboard: React.FC = () => {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [stats, setStats] = useState<TranslationStats | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchTranslations();
    fetchStats();
  }, [statusFilter, languageFilter, priorityFilter]);

  const fetchTranslations = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (languageFilter !== 'all') params.append('language', languageFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      
      const response = await fetch(`http://localhost:5001/api/translations?${params}`);
      if (!response.ok) {
        // If backend is not available, use empty data
        setTranslations([]);
        return;
      }
      const data = await response.json();
      setTranslations(data.translations || []);
    } catch (error) {
      console.error('Error fetching translations:', error);
      // If backend is not available, use empty data
      setTranslations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/translations/stats');
      if (!response.ok) {
        // If backend is not available, use null
        setStats(null);
        return;
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // If backend is not available, use null
      setStats(null);
    }
  };

  const handleTranslationUpdate = async (id: string, updates: Partial<Translation>) => {
    try {
      const response = await fetch(`http://localhost:5001/api/translations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        fetchTranslations();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating translation:', error);
    }
  };

  const handlePreview = (text: string, language: string) => {
    // This would open a preview modal or panel
    console.log('Preview:', { text, language });
  };

  const filteredTranslations = translations.filter(translation =>
    translation.sourceText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    translation.translatedText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    translation.fieldName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'reviewed': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'needs_revision': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = 
    ({ title, value, icon, color }) => (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${color}`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }


  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Translation Management</h1>
            <p className="text-gray-600 mt-2">Manage multilingual content translations and workflow</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Translation Task
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Translations"
            value={stats.statusStats.reduce((sum, stat) => sum + stat.count, 0)}
            icon={<Languages className="h-6 w-6 text-blue-600" />}
            color="bg-blue-100"
          />
          <StatCard
            title="In Progress"
            value={stats.statusStats.find(s => s._id === 'in_progress')?.count || 0}
            icon={<Clock className="h-6 w-6 text-yellow-600" />}
            color="bg-yellow-100"
          />
          <StatCard
            title="Completed"
            value={stats.statusStats.find(s => s._id === 'completed')?.count || 0}
            icon={<CheckCircle className="h-6 w-6 text-green-600" />}
            color="bg-green-100"
          />
          <StatCard
            title="Overdue"
            value={stats.overdueCount}
            icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
            color="bg-red-100"
          />
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="translations">Translations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Language Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Language Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.languageStats.map((langStat) => (
                  <div key={langStat._id} className="flex items-center justify-between p-4 border rounded-lg mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Languages className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{langStat._id === 'ar' ? 'Arabic' : 'English'}</p>
                        <p className="text-sm text-gray-600">{langStat.count} total translations</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{langStat.completed}</p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Translations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTranslations.slice(0, 5).map((translation) => (
                    <div key={translation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{translation.fieldName}</p>
                          <p className="text-sm text-gray-600 truncate max-w-xs">
                            {translation.sourceText}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(translation.status)}>
                          {translation.status}
                        </Badge>
                        <Badge className={getPriorityColor(translation.priority)}>
                          {translation.priority}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTranslation(translation)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="translations" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2 min-w-[300px]">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search translations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  
                  <Select 
                    value={statusFilter} 
                    onValueChange={setStatusFilter}
                    options={[
                      { value: "all", label: "All Status" },
                      { value: "pending", label: "Pending" },
                      { value: "in_progress", label: "In Progress" },
                      { value: "completed", label: "Completed" },
                      { value: "reviewed", label: "Reviewed" },
                      { value: "rejected", label: "Rejected" },
                      { value: "needs_revision", label: "Needs Revision" }
                    ]}
                    placeholder="Status"
                    className="w-40"
                  />

                  <Select 
                    value={languageFilter} 
                    onValueChange={setLanguageFilter}
                    options={[
                      { value: "all", label: "All Languages" },
                      { value: "ar", label: "Arabic" },
                      { value: "en", label: "English" }
                    ]}
                    placeholder="Language"
                    className="w-40"
                  />

                  <Select 
                    value={priorityFilter} 
                    onValueChange={setPriorityFilter}
                    options={[
                      { value: "all", label: "All Priorities" },
                      { value: "urgent", label: "Urgent" },
                      { value: "high", label: "High" },
                      { value: "medium", label: "Medium" },
                      { value: "low", label: "Low" }
                    ]}
                    placeholder="Priority"
                    className="w-40"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Translation List */}
            <Card>
              <CardHeader>
                <CardTitle>Translation Tasks ({filteredTranslations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTranslations.map((translation) => (
                    <div key={translation.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{translation.fieldName}</span>
                            <Badge className={getStatusColor(translation.status)}>
                              {translation.status}
                            </Badge>
                            <Badge className={getPriorityColor(translation.priority)}>
                              {translation.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {translation.sourceText}
                          </p>
                          {translation.translatedText && (
                            <p className="text-sm text-gray-800 mb-2 line-clamp-2 bg-gray-50 p-2 rounded">
                              {translation.translatedText}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{translation.targetLanguage.toUpperCase()}</span>
                            {translation.assignedTo && (
                              <span>Assigned to: {translation.assignedTo.name}</span>
                            )}
                            {translation.dueDate && (
                              <span>Due: {new Date(translation.dueDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(translation.translatedText || translation.sourceText, translation.targetLanguage)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTranslation(translation)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Translation Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-4">Status Distribution</h3>
                    <div className="space-y-3">
                      {stats?.statusStats.map((stat) => (
                        <div key={stat._id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(stat._id).replace('text-', 'bg-').replace('bg-', 'bg-').split(' ')[0]}`}></div>
                            <span className="capitalize">{stat._id.replace('_', ' ')}</span>
                          </div>
                          <span className="font-medium">{stat.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-4">Language Distribution</h3>
                    <div className="space-y-3">
                      {stats?.languageStats.map((stat) => (
                        <div key={stat._id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span>{stat._id === 'ar' ? 'Arabic' : 'English'}</span>
                          </div>
                          <span className="font-medium">{stat.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      {/* Translation Interface Modal */}
      {selectedTranslation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">Edit Translation</h2>
              <Button
                variant="ghost"
                onClick={() => setSelectedTranslation(null)}
              >
                ×
              </Button>
            </div>
            <div className="p-4">
              <TranslationInterface
                translation={selectedTranslation}
                onUpdate={handleTranslationUpdate}
                onPreview={handlePreview}
                isRTL={selectedTranslation.targetLanguage === 'ar'}
              />
            </div>
          </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TranslationDashboard;