'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Languages, 
  Download, 
  Upload, 
  FileText, 
  Users, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  Square
} from 'lucide-react';

interface Package {
  id: string;
  title: string;
  title_ar?: string;
  destination: string;
  destination_ar?: string;
  translationStatus: {
    ar: string;
  };
  translationCompleteness: {
    ar: number;
  };
  selected?: boolean;
}

interface BulkTranslationJob {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  totalPackages: number;
  processedPackages: number;
  targetLanguage: string;
  createdAt: string;
  estimatedCompletion?: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface BulkTranslationManagerProps {
  packages: Package[];
  onCreateBulkTranslation: (packageIds: string[], options: any) => Promise<void>;
  onExportTranslations: (packageIds: string[], format: 'csv' | 'xlsx' | 'json') => Promise<void>;
  onImportTranslations: (file: File) => Promise<void>;
}

const BulkTranslationManager: React.FC<BulkTranslationManagerProps> = ({
  packages,
  onCreateBulkTranslation,
  onExportTranslations,
  onImportTranslations
}) => {
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [bulkJobs, setBulkJobs] = useState<BulkTranslationJob[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [targetLanguage, setTargetLanguage] = useState<string>('ar');
  const [priority, setPriority] = useState<string>('medium');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx' | 'json'>('csv');
  const [importFile, setImportFile] = useState<File | null>(null);

  const filteredPackages = packages.filter(pkg => {
    if (filterStatus === 'all') return true;
    return pkg.translationStatus.ar === filterStatus;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPackages(filteredPackages.map(pkg => pkg.id));
    } else {
      setSelectedPackages([]);
    }
  };

  const handleSelectPackage = (packageId: string, checked: boolean) => {
    if (checked) {
      setSelectedPackages([...selectedPackages, packageId]);
    } else {
      setSelectedPackages(selectedPackages.filter(id => id !== packageId));
    }
  };

  const handleCreateBulkTranslation = async () => {
    if (selectedPackages.length === 0) return;
    
    const options = {
      targetLanguage,
      priority,
      assignedTo: assignedTo || undefined,
      dueDate: dueDate || undefined
    };

    try {
      await onCreateBulkTranslation(selectedPackages, options);
      setSelectedPackages([]);
      setShowBulkActions(false);
      // Refresh jobs list
      fetchBulkJobs();
    } catch (error) {
      console.error('Error creating bulk translation:', error);
    }
  };

  const handleExport = async () => {
    if (selectedPackages.length === 0) return;
    
    try {
      await onExportTranslations(selectedPackages, exportFormat);
    } catch (error) {
      console.error('Error exporting translations:', error);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    
    try {
      await onImportTranslations(importFile);
      setImportFile(null);
    } catch (error) {
      console.error('Error importing translations:', error);
    }
  };

  const fetchBulkJobs = async () => {
    try {
      const response = await fetch('/api/translations/bulk-jobs');
      const data = await response.json();
      setBulkJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching bulk jobs:', error);
    }
  };

  useEffect(() => {
    fetchBulkJobs();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'missing': return 'bg-red-100 text-red-800';
      case 'needs_review': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getJobStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'running': return <Play className="h-4 w-4 text-blue-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'paused': return <Pause className="h-4 w-4 text-gray-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = 
    ({ title, value, icon }) => (
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="p-2 bg-blue-100 rounded-full">
            {icon}
          </div>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Bulk Translation Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Packages"
              value={packages.length}
              icon={<FileText className="h-5 w-5 text-blue-600" />}
            />
            <StatCard
              title="Needs Translation"
              value={packages.filter(p => p.translationStatus.ar === 'missing').length}
              icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
            />
            <StatCard
              title="In Progress"
              value={packages.filter(p => p.translationStatus.ar === 'partial').length}
              icon={<Clock className="h-5 w-5 text-yellow-600" />}
            />
            <StatCard
              title="Completed"
              value={packages.filter(p => p.translationStatus.ar === 'complete').length}
              icon={<CheckCircle className="h-5 w-5 text-green-600" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Package Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="missing">Missing Translation</SelectItem>
                <SelectItem value="partial">Partial Translation</SelectItem>
                <SelectItem value="complete">Complete Translation</SelectItem>
                <SelectItem value="needs_review">Needs Review</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={selectedPackages.length > 0 ? "default" : "outline"}
              onClick={() => setShowBulkActions(!showBulkActions)}
              disabled={selectedPackages.length === 0}
            >
              Bulk Actions ({selectedPackages.length})
            </Button>

            {/* Export Actions */}
            <div className="flex items-center gap-2">
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={selectedPackages.length === 0}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>

            {/* Import Actions */}
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".csv,.xlsx,.json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="w-48"
              />
              <Button
                variant="outline"
                onClick={handleImport}
                disabled={!importFile}
              >
                <Upload className="h-4 w-4 mr-1" />
                Import
              </Button>
            </div>
          </div>

          {/* Bulk Actions Panel */}
          {showBulkActions && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-4 mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Target Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">Arabic</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Assigned to (optional)"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                    />

                    <Input
                      type="date"
                      placeholder="Due date (optional)"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button onClick={handleCreateBulkTranslation}>
                      Create {selectedPackages.length} Translation Tasks
                    </Button>
                    <Button variant="outline" onClick={() => setShowBulkActions(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Package List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Packages ({filteredPackages.length})</span>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedPackages.length === filteredPackages.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm">Select All</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredPackages.map((pkg) => (
              <div key={pkg.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  checked={selectedPackages.includes(pkg.id)}
                  onCheckedChange={(checked) => handleSelectPackage(pkg.id, checked)}
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{pkg.title}</span>
                    <Badge className={getStatusColor(pkg.translationStatus.ar)}>
                      {pkg.translationStatus.ar}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {pkg.destination} • Arabic: {pkg.translationCompleteness.ar}% complete
                  </div>
                  {pkg.title_ar && (
                    <div className="text-sm text-gray-800 mt-1" dir="rtl">
                      {pkg.title_ar}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-24">
                    <Progress value={pkg.translationCompleteness.ar} className="h-2" />
                  </div>
                  <span className="text-sm text-gray-600 w-12">
                    {pkg.translationCompleteness.ar}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Translation Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Translation Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bulkJobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getJobStatusIcon(job.status)}
                    <span className="font-medium">{job.name}</span>
                    <Badge variant="outline">{job.targetLanguage.toUpperCase()}</Badge>
                    <Badge variant="outline">{job.priority}</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {job.processedPackages}/{job.totalPackages} packages
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Progress value={job.progress} className="h-2" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                    {job.estimatedCompletion && (
                      <span>Est. completion: {new Date(job.estimatedCompletion).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {bulkJobs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No translation jobs found. Create a bulk translation to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkTranslationManager;