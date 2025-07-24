'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Wand2, 
  Eye, 
  Edit3, 
  Loader2, 
  RefreshCw,
  Sparkles,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface ScriptEditorProps {
  projectId: string;
}

export function ScriptEditor({ projectId }: ScriptEditorProps) {
  const [activeTab, setActiveTab] = useState('generate');
  const [generationParams, setGenerationParams] = useState({
    targetAudience: 'developers and tech enthusiasts',
    tone: 'professional' as const,
    duration: 30,
  });
  const [refinementFeedback, setRefinementFeedback] = useState('');

  // Queries
  const { data: scriptData, refetch: refetchScript } = api.script.getProjectScript.useQuery(
    { projectId },
    { refetchInterval: 2000 }
  );

  // Mutations
  const generateScript = api.script.generateScript.useMutation({
    onSuccess: (data) => {
      toast.success('Script generation started!');
      refetchScript();
    },
    onError: (error) => {
      toast.error('Failed to start script generation');
    },
  });

  const refineScript = api.script.refineScript.useMutation({
    onSuccess: (data) => {
      setRefinementFeedback('');
      toast.success('Script refinement started!');
      refetchScript();
    },
    onError: (error) => {
      toast.error('Failed to start script refinement');
    },
  });

  const clearScript = api.script.clearScript.useMutation({
    onSuccess: () => {
      toast.success('Script cleared successfully');
      refetchScript();
    },
    onError: (error) => {
      toast.error('Failed to clear script');
    },
  });

  // Job status polling
  const { data: jobStatus } = api.script.getJobStatus.useQuery(
    { jobId: scriptData?.jobId || '' },
    { 
      enabled: !!scriptData?.jobId && scriptData?.status === 'processing',
      refetchInterval: 2000 
    }
  );

  useEffect(() => {
    if (jobStatus?.status === 'completed') {
      refetchScript();
      toast.success('Script generated successfully!');
    } else if (jobStatus?.status === 'failed') {
      toast.error('Script generation failed. Please try again.');
    }
  }, [jobStatus?.status, refetchScript]);

  const handleGenerateScript = () => {
    generateScript.mutate({
      projectId,
      ...generationParams,
    });
  };

  const handleRefineScript = () => {
    if (!refinementFeedback.trim()) {
      toast.error('Please provide feedback for script refinement');
      return;
    }

    refineScript.mutate({
      projectId,
      userFeedback: refinementFeedback,
    });
  };

  const handleClearScript = () => {
    if (!confirm('Are you sure you want to clear the script? This action cannot be undone.')) {
      return;
    }
    clearScript.mutate({ projectId });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'processing':
        return <Badge variant="default" className="bg-blue-500">Processing</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const isProcessing = scriptData?.status === 'processing';
  const hasScript = scriptData?.script && scriptData.status === 'completed';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Script Editor</h2>
              <p className="text-sm text-gray-600">Generate and refine your video script with AI</p>
            </div>
          </div>
          {hasScript && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearScript}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Script
            </Button>
          )}
        </div>

        {/* Status Display */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          {getStatusBadge(scriptData?.status || 'pending')}
          {isProcessing && jobStatus?.progress && (
            <div className="flex items-center space-x-2">
              <Progress value={jobStatus.progress} className="w-32" />
              <span className="text-sm text-gray-600">{jobStatus.progress}%</span>
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6 pt-4">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger 
              value="generate" 
              className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Wand2 className="w-4 h-4" />
              <span>Generate</span>
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="refine" 
              className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Edit3 className="w-4 h-4" />
              <span>Refine</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="generate" className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Target Audience */}
              <div className="space-y-2">
                <Label htmlFor="targetAudience" className="text-sm font-medium text-gray-700">
                  Target Audience
                </Label>
                <Input
                  id="targetAudience"
                  value={generationParams.targetAudience}
                  onChange={(e) => setGenerationParams(prev => ({ ...prev, targetAudience: e.target.value }))}
                  placeholder="e.g., developers, investors, general users"
                  className="w-full"
                />
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <Label htmlFor="tone" className="text-sm font-medium text-gray-700">
                  Tone
                </Label>
                <select
                  id="tone"
                  value={generationParams.tone}
                  onChange={(e) => setGenerationParams(prev => ({ ...prev, tone: e.target.value as 'professional' | 'casual' | 'energetic' | 'friendly' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="energetic">Energetic</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                Duration (seconds)
              </Label>
              <Input
                id="duration"
                type="number"
                min="15"
                max="60"
                value={generationParams.duration}
                onChange={(e) => setGenerationParams(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full max-w-xs"
              />
              <p className="text-xs text-gray-500">Recommended: 15-60 seconds</p>
            </div>

            {/* Generate Button */}
            <div className="pt-4">
              <Button
                onClick={handleGenerateScript}
                disabled={isProcessing || generateScript.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg shadow-sm"
              >
                {isProcessing || generateScript.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Script...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Script
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="p-6">
          {hasScript ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Generated Script</h3>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono bg-white p-4 rounded border">
                    {scriptData.script}
                  </pre>
                </div>
              </div>
              
              {scriptData.generationParams && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Generation Parameters</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-700">Target Audience:</span>
                      <p className="text-blue-600">{scriptData.generationParams.targetAudience}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Tone:</span>
                      <p className="text-blue-600 capitalize">{scriptData.generationParams.tone}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Duration:</span>
                      <p className="text-blue-600">{scriptData.generationParams.duration}s</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No script generated yet</h3>
              <p className="text-gray-600 mb-4">
                Generate a script first to preview it here
              </p>
              <Button
                onClick={() => setActiveTab('generate')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Script
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="refine" className="p-6">
          {hasScript ? (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Current Script</h3>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono bg-white p-4 rounded border">
                    {scriptData.script}
                  </pre>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback" className="text-sm font-medium text-gray-700">
                  Refinement Feedback
                </Label>
                <Textarea
                  id="feedback"
                  value={refinementFeedback}
                  onChange={(e) => setRefinementFeedback(e.target.value)}
                  placeholder="Describe what you'd like to change about the script..."
                  className="w-full min-h-[120px]"
                />
                <p className="text-xs text-gray-500">
                  Be specific about what you want to change, add, or improve
                </p>
              </div>

              <Button
                onClick={handleRefineScript}
                disabled={isProcessing || refineScript.isPending || !refinementFeedback.trim()}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg shadow-sm"
              >
                {isProcessing || refineScript.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Refining Script...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refine Script
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <Edit3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No script to refine</h3>
              <p className="text-gray-600 mb-4">
                Generate a script first before you can refine it
              </p>
              <Button
                onClick={() => setActiveTab('generate')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Script
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 