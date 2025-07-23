'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  GitBranch, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  User,
  Calendar,
  ArrowRight,
  Play,
  Pause,
  Square,
  RefreshCw,
  MessageCircle,
  FileText,
  Eye,
  Edit,
  Send
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  dueDate?: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
  notes?: string;
  approvalRequired?: boolean;
  approvedBy?: {
    id: string;
    name: string;
  };
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  language: 'ar' | 'en';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface TranslationWorkflow {
  id: string;
  templateId: string;
  contentId: string;
  contentType: 'package' | 'user_content' | 'system_content';
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  currentStep: number;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
  };
  targetLanguage: 'ar' | 'en';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  estimatedCompletionTime?: number;
  actualCompletionTime?: number;
  qualityScore?: number;
  culturalApproval?: boolean;
  comments: Array<{
    id: string;
    user: {
      id: string;
      name: string;
    };
    message: string;
    timestamp: string;
    stepId?: string;
  }>;
}

interface TranslationWorkflowManagerProps {
  workflows: TranslationWorkflow[];
  templates: WorkflowTemplate[];
  onUpdateWorkflow: (workflowId: string, updates: Partial<TranslationWorkflow>) => Promise<void>;
  onCreateWorkflow: (templateId: string, contentId: string, options: any) => Promise<void>;
  onDeleteWorkflow: (workflowId: string) => Promise<void>;
}

const TranslationWorkflowManager: React.FC<TranslationWorkflowManagerProps> = ({
  workflows,
  templates,
  onUpdateWorkflow,
  onCreateWorkflow,
  onDeleteWorkflow
}) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<TranslationWorkflow | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [newComment, setNewComment] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const defaultWorkflowTemplate: WorkflowTemplate = {
    id: 'default_ar',
    name: 'Standard Arabic Translation',
    description: 'Standard workflow for Arabic content translation',
    language: 'ar',
    priority: 'medium',
    steps: [
      {
        id: 'draft',
        name: 'Draft Creation',
        description: 'Initial content draft and preparation',
        status: 'pending',
        estimatedHours: 2
      },
      {
        id: 'translation',
        name: 'Translation',
        description: 'Translate content from English to Arabic',
        status: 'pending',
        estimatedHours: 8
      },
      {
        id: 'cultural_review',
        name: 'Cultural Review',
        description: 'Review content for cultural appropriateness',
        status: 'pending',
        estimatedHours: 2,
        approvalRequired: true
      },
      {
        id: 'linguistic_review',
        name: 'Linguistic Review',
        description: 'Review translation quality and accuracy',
        status: 'pending',
        estimatedHours: 3,
        approvalRequired: true
      },
      {
        id: 'final_approval',
        name: 'Final Approval',
        description: 'Final approval before publication',
        status: 'pending',
        estimatedHours: 1,
        approvalRequired: true
      }
    ]
  };

  const filteredWorkflows = workflows.filter(workflow => {
    if (filterStatus !== 'all' && workflow.status !== filterStatus) return false;
    if (filterPriority !== 'all' && workflow.priority !== filterPriority) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
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

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Play className="h-4 w-4 text-blue-600" />;
      case 'blocked': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const calculateProgress = (workflow: TranslationWorkflow) => {
    const completedSteps = workflow.steps.filter(step => step.status === 'completed').length;
    return Math.round((completedSteps / workflow.steps.length) * 100);
  };

  const handleStepUpdate = async (stepId: string, updates: Partial<WorkflowStep>) => {
    if (!selectedWorkflow) return;

    const updatedSteps = selectedWorkflow.steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    );

    await onUpdateWorkflow(selectedWorkflow.id, { steps: updatedSteps });
  };

  const handleAddComment = async (stepId?: string) => {
    if (!selectedWorkflow || !newComment.trim()) return;

    const comment = {
      id: Date.now().toString(),
      user: { id: '1', name: 'Current User' }, // This would come from auth context
      message: newComment,
      timestamp: new Date().toISOString(),
      stepId
    };

    const updatedComments = [...selectedWorkflow.comments, comment];
    await onUpdateWorkflow(selectedWorkflow.id, { comments: updatedComments });
    setNewComment('');
  };

  const handleCreateWorkflow = async () => {
    if (!selectedTemplate) return;

    const options = {
      templateId: selectedTemplate,
      priority: 'medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    };

    await onCreateWorkflow(selectedTemplate, 'sample-content-id', options);
  };

  const WorkflowCard: React.FC<{ workflow: TranslationWorkflow }> = ({ workflow }) => {
    const progress = calculateProgress(workflow);
    const currentStep = workflow.steps[workflow.currentStep];

    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedWorkflow(workflow)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{workflow.contentType} Workflow</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(workflow.priority)}>
                {workflow.priority}
              </Badge>
              <Badge className={getStatusColor(workflow.status)}>
                {workflow.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>🇸🇦 {workflow.targetLanguage.toUpperCase()}</span>
            <span>•</span>
            <span>Step {workflow.currentStep + 1} of {workflow.steps.length}</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {currentStep && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                {getStepIcon(currentStep.status)}
                <span className="font-medium text-sm">{currentStep.name}</span>
              </div>
              <p className="text-xs text-gray-600">{currentStep.description}</p>
              {currentStep.assignedTo && (
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                  <User className="h-3 w-3" />
                  <span>{currentStep.assignedTo.name}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Created: {new Date(workflow.createdAt).toLocaleDateString()}</span>
            {workflow.dueDate && (
              <span>Due: {new Date(workflow.dueDate).toLocaleDateString()}</span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const WorkflowSteps: React.FC<{ workflow: TranslationWorkflow }> = ({ workflow }) => (
    <div className="space-y-4">
      {workflow.steps.map((step, index) => (
        <div key={step.id} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {getStepIcon(step.status)}
                <span className="font-medium">{step.name}</span>
              </div>
              <Badge className={getStatusColor(step.status)}>
                {step.status}
              </Badge>
              {step.approvalRequired && (
                <Badge variant="outline">Approval Required</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {step.status === 'pending' && (
                <Button
                  size="sm"
                  onClick={() => handleStepUpdate(step.id, { status: 'in_progress' })}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              )}
              {step.status === 'in_progress' && (
                <Button
                  size="sm"
                  onClick={() => handleStepUpdate(step.id, { status: 'completed', completedAt: new Date().toISOString() })}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete
                </Button>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3">{step.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Assigned to:</span>
              <div className="text-gray-600">
                {step.assignedTo ? step.assignedTo.name : 'Unassigned'}
              </div>
            </div>
            <div>
              <span className="font-medium">Due date:</span>
              <div className="text-gray-600">
                {step.dueDate ? new Date(step.dueDate).toLocaleDateString() : 'Not set'}
              </div>
            </div>
            <div>
              <span className="font-medium">Time estimate:</span>
              <div className="text-gray-600">
                {step.estimatedHours ? `${step.estimatedHours}h` : 'Not set'}
              </div>
            </div>
          </div>

          {step.notes && (
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <span className="font-medium text-sm">Notes:</span>
              <p className="text-sm text-gray-700 mt-1">{step.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const WorkflowComments: React.FC<{ workflow: TranslationWorkflow }> = ({ workflow }) => (
    <div className="space-y-4">
      <div className="space-y-4">
        {workflow.comments.map((comment) => (
          <div key={comment.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{comment.user.name}</span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(comment.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-700">{comment.message}</p>
            {comment.stepId && (
              <Badge variant="outline" className="mt-2">
                Step: {workflow.steps.find(s => s.id === comment.stepId)?.name}
              </Badge>
            )}
          </div>
        ))}
      </div>

      <div className="border rounded-lg p-4">
        <div className="space-y-3">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={() => handleAddComment()}
              disabled={!newComment.trim()}
            >
              <Send className="h-4 w-4 mr-1" />
              Add Comment
            </Button>
          </div>
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
            <GitBranch className="h-5 w-5" />
            Translation Workflow Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleCreateWorkflow} disabled={!selectedTemplate}>
              Create Workflow
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Workflow List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkflows.map((workflow) => (
          <WorkflowCard key={workflow.id} workflow={workflow} />
        ))}
      </div>

      {/* Workflow Details Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">Workflow Details</h2>
              <Button
                variant="ghost"
                onClick={() => setSelectedWorkflow(null)}
              >
                ×
              </Button>
            </div>
            
            <div className="p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="steps">Steps</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Status</h3>
                      <Badge className={getStatusColor(selectedWorkflow.status)}>
                        {selectedWorkflow.status}
                      </Badge>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Priority</h3>
                      <Badge className={getPriorityColor(selectedWorkflow.priority)}>
                        {selectedWorkflow.priority}
                      </Badge>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Progress</h3>
                      <div className="text-2xl font-bold">
                        {calculateProgress(selectedWorkflow)}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Progress</h3>
                    <Progress value={calculateProgress(selectedWorkflow)} className="h-3" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Content Type:</span>
                      <div className="text-gray-600">{selectedWorkflow.contentType}</div>
                    </div>
                    <div>
                      <span className="font-medium">Target Language:</span>
                      <div className="text-gray-600">{selectedWorkflow.targetLanguage.toUpperCase()}</div>
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>
                      <div className="text-gray-600">
                        {new Date(selectedWorkflow.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Due Date:</span>
                      <div className="text-gray-600">
                        {selectedWorkflow.dueDate ? 
                          new Date(selectedWorkflow.dueDate).toLocaleDateString() : 
                          'Not set'
                        }
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="steps">
                  <WorkflowSteps workflow={selectedWorkflow} />
                </TabsContent>

                <TabsContent value="comments">
                  <WorkflowComments workflow={selectedWorkflow} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationWorkflowManager;