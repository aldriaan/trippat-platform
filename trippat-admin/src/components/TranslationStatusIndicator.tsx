'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  Languages,
  Eye,
  Edit,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TranslationStatus {
  language: 'en' | 'ar';
  status: 'complete' | 'partial' | 'missing' | 'needs_review';
  percentage: number;
  completedFields: number;
  totalFields: number;
  lastUpdate?: string;
}

interface TranslationStatusIndicatorProps {
  packageId: string;
  title: string;
  englishStatus: TranslationStatus;
  arabicStatus: TranslationStatus;
  onEdit?: (packageId: string, language: 'en' | 'ar') => void;
  onPreview?: (packageId: string, language: 'en' | 'ar') => void;
  onCreateTranslation?: (packageId: string) => void;
  compact?: boolean;
}

const TranslationStatusIndicator: React.FC<TranslationStatusIndicatorProps> = ({
  packageId,
  title,
  englishStatus,
  arabicStatus,
  onEdit,
  onPreview,
  onCreateTranslation,
  compact = false
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'complete':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800 border-green-300',
          label: 'Complete',
          variant: 'success' as const
        };
      case 'partial':
        return {
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          label: 'Partial',
          variant: 'warning' as const
        };
      case 'missing':
        return {
          icon: XCircle,
          color: 'bg-red-100 text-red-800 border-red-300',
          label: 'Missing',
          variant: 'destructive' as const
        };
      case 'needs_review':
        return {
          icon: AlertCircle,
          color: 'bg-orange-100 text-orange-800 border-orange-300',
          label: 'Needs Review',
          variant: 'warning' as const
        };
      default:
        return {
          icon: AlertCircle,
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          label: 'Unknown',
          variant: 'secondary' as const
        };
    }
  };

  const StatusBadge: React.FC<{ status: TranslationStatus }> = ({ status }) => {
    const config = getStatusConfig(status.status);
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label} ({status.percentage}%)
      </Badge>
    );
  };

  const ProgressBar: React.FC<{ status: TranslationStatus }> = ({ status }) => {
    const getProgressColor = (percentage: number) => {
      if (percentage === 100) return 'bg-green-500';
      if (percentage >= 70) return 'bg-yellow-500';
      if (percentage >= 30) return 'bg-orange-500';
      return 'bg-red-500';
    };

    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-600">
          <span>{status.completedFields}/{status.totalFields} fields</span>
          <span>{status.percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(status.percentage)}`}
            style={{ width: `${status.percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const CompactView: React.FC = () => (
    <div className="flex items-center gap-3 p-2 border rounded-lg">
      <div className="flex-1">
        <div className="font-medium text-sm truncate">{title}</div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">EN:</span>
            <StatusBadge status={englishStatus} />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">AR:</span>
            <StatusBadge status={arabicStatus} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {onPreview && (
          <Button variant="ghost" size="sm" onClick={() => onPreview(packageId, 'ar')}>
            <Eye className="h-4 w-4" />
          </Button>
        )}
        {onEdit && (
          <Button variant="ghost" size="sm" onClick={() => onEdit(packageId, 'ar')}>
            <Edit className="h-4 w-4" />
          </Button>
        )}
        {onCreateTranslation && arabicStatus.status === 'missing' && (
          <Button variant="ghost" size="sm" onClick={() => onCreateTranslation(packageId)}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  const DetailedView: React.FC = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            <span className="truncate">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            {onPreview && (
              <Button variant="outline" size="sm" onClick={() => onPreview(packageId, 'ar')}>
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(packageId, 'ar')}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            {onCreateTranslation && arabicStatus.status === 'missing' && (
              <Button onClick={() => onCreateTranslation(packageId)}>
                <Plus className="h-4 w-4 mr-1" />
                Create Translation
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* English Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">English</span>
              <span className="text-lg">🇺🇸</span>
            </div>
            <StatusBadge status={englishStatus} />
          </div>
          <ProgressBar status={englishStatus} />
          {englishStatus.lastUpdate && (
            <p className="text-xs text-gray-500">
              Last updated: {new Date(englishStatus.lastUpdate).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Arabic Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">العربية</span>
              <span className="text-lg">🇸🇦</span>
            </div>
            <StatusBadge status={arabicStatus} />
          </div>
          <ProgressBar status={arabicStatus} />
          {arabicStatus.lastUpdate && (
            <p className="text-xs text-gray-500">
              Last updated: {new Date(arabicStatus.lastUpdate).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Translation Priority Indicator */}
        {arabicStatus.status === 'missing' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Translation Required
              </span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              This package needs Arabic translation to be published to Arabic-speaking users.
            </p>
          </div>
        )}

        {/* Review Required Indicator */}
        {arabicStatus.status === 'needs_review' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                Review Required
              </span>
            </div>
            <p className="text-xs text-orange-700 mt-1">
              Arabic translation needs cultural and linguistic review before publication.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return compact ? <CompactView /> : <DetailedView />;
};

export default TranslationStatusIndicator;