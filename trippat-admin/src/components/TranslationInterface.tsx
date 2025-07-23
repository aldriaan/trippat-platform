'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectOption } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Languages, 
  Eye, 
  Save, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  BookOpen
} from 'lucide-react';

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
  culturalNotes?: string;
  dueDate?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  comments: Array<{
    user: {
      id: string;
      name: string;
    };
    comment: string;
    type: 'general' | 'suggestion' | 'issue' | 'approval';
    createdAt: string;
  }>;
}

interface TranslationInterfaceProps {
  translation: Translation;
  onUpdate: (id: string, updates: Partial<Translation>) => void;
  onPreview: (text: string, language: string) => void;
  isRTL?: boolean;
}

const TranslationInterface: React.FC<TranslationInterfaceProps> = ({
  translation,
  onUpdate,
  onPreview,
  isRTL = false
}) => {
  const [translatedText, setTranslatedText] = useState(translation.translatedText || '');
  const [status, setStatus] = useState(translation.status);
  const [qualityScore, setQualityScore] = useState(translation.qualityScore || '');
  const [culturalValidation, setCulturalValidation] = useState(translation.culturalValidation);
  const [culturalNotes, setCulturalNotes] = useState(translation.culturalNotes || '');
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'general' | 'suggestion' | 'issue' | 'approval'>('general');
  const [showPreview, setShowPreview] = useState(false);

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
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCulturalValidationColor = (validation: string) => {
    switch (validation) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'needs_review': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSave = () => {
    onUpdate(translation.id, {
      translatedText,
      status,
      qualityScore: qualityScore ? Number(qualityScore) : undefined,
      culturalValidation,
      culturalNotes: culturalNotes || undefined
    });
  };

  const handlePreview = () => {
    onPreview(translatedText, translation.targetLanguage);
    setShowPreview(true);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // This would typically call an API to add the comment
      console.log('Adding comment:', { comment: newComment, type: commentType });
      setNewComment('');
    }
  };

  const isOverdue = translation.dueDate && new Date(translation.dueDate) < new Date();

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            {translation.fieldName} Translation
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getPriorityColor(translation.priority)}>
              {translation.priority}
            </Badge>
            <Badge className={getStatusColor(status)}>
              {status}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Overdue
              </Badge>
            )}
          </div>
        </div>
        
        {translation.dueDate && (
          <div className="text-sm text-gray-600">
            Due: {new Date(translation.dueDate).toLocaleDateString()}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Source Text */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Source Text (English)
          </label>
          <div className="p-3 bg-gray-50 rounded-md border">
            <p className="text-sm leading-relaxed">{translation.sourceText}</p>
          </div>
        </div>

        {/* Translation Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Translation (Arabic)
          </label>
          <Textarea
            value={translatedText}
            onChange={(e) => setTranslatedText(e.target.value)}
            placeholder="Enter Arabic translation here..."
            className={`min-h-[120px] ${isRTL ? 'text-right' : 'text-left'}`}
            dir={translation.targetLanguage === 'ar' ? 'rtl' : 'ltr'}
          />
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              disabled={!translatedText}
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <span className="text-xs text-gray-500">
              {translatedText.length} characters
            </span>
          </div>
        </div>

        {/* Status and Quality Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <Select 
              value={status} 
              onValueChange={setStatus}
              options={[
                { value: "pending", label: "Pending" },
                { value: "in_progress", label: "In Progress" },
                { value: "completed", label: "Completed" },
                { value: "reviewed", label: "Reviewed" },
                { value: "rejected", label: "Rejected" },
                { value: "needs_revision", label: "Needs Revision" }
              ]}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Quality Score</label>
            <Select 
              value={qualityScore.toString()} 
              onValueChange={setQualityScore}
              options={[
                { value: "100", label: "Excellent (100)" },
                { value: "90", label: "Very Good (90)" },
                { value: "80", label: "Good (80)" },
                { value: "70", label: "Fair (70)" },
                { value: "60", label: "Poor (60)" },
                { value: "50", label: "Very Poor (50)" }
              ]}
              placeholder="Select score"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Cultural Validation</label>
            <Select 
              value={culturalValidation} 
              onValueChange={setCulturalValidation}
              options={[
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "needs_review", label: "Needs Review" },
                { value: "rejected", label: "Rejected" }
              ]}
            />
          </div>
        </div>

        {/* Cultural Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Cultural Notes</label>
          <Textarea
            value={culturalNotes}
            onChange={(e) => setCulturalNotes(e.target.value)}
            placeholder="Add cultural context, guidelines, or notes..."
            className="min-h-[80px]"
          />
        </div>

        {/* Cultural Guidelines Alert */}
        {translation.targetLanguage === 'ar' && (
          <Alert>
            <BookOpen className="h-4 w-4" />
            <AlertDescription>
              <strong>Cultural Guidelines:</strong> Ensure translations respect Islamic values, 
              use appropriate formal language, and consider cultural context for travel content. 
              Avoid references that may be culturally inappropriate.
            </AlertDescription>
          </Alert>
        )}

        {/* Comments Section */}
        <div className="space-y-4">
          <Separator />
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="font-medium">Comments ({translation.comments.length})</span>
          </div>

          {/* Existing Comments */}
          {translation.comments.map((comment, index) => (
            <div key={index} className="border rounded-md p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{comment.user.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {comment.type}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700">{comment.comment}</p>
            </div>
          ))}

          {/* Add Comment */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Select 
                value={commentType} 
                onValueChange={setCommentType}
                options={[
                  { value: "general", label: "General" },
                  { value: "suggestion", label: "Suggestion" },
                  { value: "issue", label: "Issue" },
                  { value: "approval", label: "Approval" }
                ]}
                className="w-32"
              />
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 min-h-[60px]"
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {culturalValidation === 'approved' && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Culturally Approved</span>
              </div>
            )}
            {culturalValidation === 'needs_review' && (
              <div className="flex items-center gap-1 text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Needs Cultural Review</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePreview} disabled={!translatedText}>
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              Save Translation
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TranslationInterface;