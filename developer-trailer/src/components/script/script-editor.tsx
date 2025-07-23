'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Wand2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  RefreshCw,
  RotateCcw 
} from 'lucide-react';
import { toast } from 'sonner';

interface ScriptEditorProps {
  projectId: string;
}

export function ScriptEditor({ projectId }: ScriptEditorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [refinementFeedback, setRefinementFeedback] = useState('');
  const [generationParams, setGenerationParams] = useState({
    targetAudience: 'developers and tech enthusiasts',
    tone: 'professional' as const,
    duration: 30,
  });

  // Queries
  const {
    data: scriptData,
    isLoading: scriptLoading,
    refetch: refetchScript
  } = api.script.getProjectScript.useQuery({ projectId });

  const generateScriptMutation = api.script.generateScript.useMutation();
  const refineScriptMutation = api.script.refineScript.useMutation();
  const clearScriptMutation = api.script.clearScript.useMutation();

  // Poll job status when generation is in progress
  const {
    data: jobStatus,
  } = api.script.getJobStatus.useQuery(
    { jobId: jobId! },
    {
      enabled: !!jobId && isGenerating,
      refetchInterval: 2000,
    }
  );

  // Update progress and status based on job status
  useEffect(() => {
    if (jobStatus) {
      setProgress(jobStatus.progress);
      
      if (jobStatus.status === 'completed') {
        setIsGenerating(false);
        setJobId(null);
        setProgress(100);
        toast.success('Script generated successfully!');
        refetchScript();
      } else if (jobStatus.status === 'failed') {
        setIsGenerating(false);
        setJobId(null);
        setProgress(0);
        toast.error(`Script generation failed: ${jobStatus.error}`);
      }
    }
  }, [jobStatus, refetchScript]);

  const handleGenerateScript = async () => {
    try {
      setIsGenerating(true);
      setProgress(0);
      
      const result = await generateScriptMutation.mutateAsync({
        projectId,
        ...generationParams,
      });
      
      setJobId(result.jobId || null);
      toast.success('Script generation started!');
    } catch (error) {
      setIsGenerating(false);
      toast.error('Failed to start script generation');
    }
  };

  const handleRefineScript = async () => {
    if (!refinementFeedback.trim()) {
      toast.error('Please provide feedback for script refinement');
      return;
    }

    try {
      setIsGenerating(true);
      setProgress(0);
      
      const result = await refineScriptMutation.mutateAsync({
        projectId,
        userFeedback: refinementFeedback,
      });
      
      setJobId(result.jobId || null);
      setRefinementFeedback('');
      toast.success('Script refinement started!');
    } catch (error) {
      setIsGenerating(false);
      toast.error('Failed to start script refinement');
    }
  };

  const handleClearScript = async () => {
    if (!confirm('Are you sure you want to clear the script? This action cannot be undone.')) {
      return;
    }

    try {
      await clearScriptMutation.mutateAsync({ projectId });
      toast.success('Script cleared successfully');
      refetchScript();
    } catch (error) {
      toast.error('Failed to clear script');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'processing':
        return <Badge><Loader2 className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (scriptLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
          <p>Loading script editor...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Script Generator
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Generate and refine AI-powered video scripts
              </p>
            </div>
            
            {scriptData?.status && (
              <div className="text-right">
                {getStatusBadge(scriptData.status)}
                {isGenerating && (
                  <div className="mt-2">
                    <Progress value={progress} className="w-32" />
                    <p className="text-xs text-muted-foreground mt-1">{progress}%</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="script" disabled={!scriptData?.script}>
            Script Preview
          </TabsTrigger>
          <TabsTrigger value="refine" disabled={!scriptData?.script}>
            Refine
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generation Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Input
                    id="audience"
                    value={generationParams.targetAudience}
                    onChange={(e) => setGenerationParams(prev => ({
                      ...prev,
                      targetAudience: e.target.value
                    }))}
                    placeholder="e.g., developers, designers, startups"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    max="60"
                    value={generationParams.duration}
                    onChange={(e) => setGenerationParams(prev => ({
                      ...prev,
                      duration: parseInt(e.target.value) || 30
                    }))}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleGenerateScript}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4 mr-2" />
                  )}
                  Generate Script
                </Button>

                {scriptData?.script && (
                  <Button
                    variant="outline"
                    onClick={handleClearScript}
                    disabled={isGenerating}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Script Preview Tab */}
        <TabsContent value="script">
          {scriptData?.script && (
            <Card>
              <CardHeader>
                <CardTitle>{scriptData.script.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Script</h4>
                    <p className="text-sm leading-relaxed">{scriptData.script.script}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Scenes ({scriptData.script.scenes.length})</h4>
                    <div className="space-y-2">
                      {scriptData.script.scenes.map((scene, index) => (
                        <div key={scene.id} className="border rounded p-3 text-sm">
                          <div className="font-medium">Scene {index + 1}</div>
                          <div className="text-muted-foreground">{scene.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Refine Tab */}
        <TabsContent value="refine">
          <Card>
            <CardHeader>
              <CardTitle>Refine Script</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback">Your Feedback</Label>
                <Textarea
                  id="feedback"
                  value={refinementFeedback}
                  onChange={(e) => setRefinementFeedback(e.target.value)}
                  placeholder="Describe what you'd like to change about the script..."
                  rows={4}
                />
              </div>

              <Button
                onClick={handleRefineScript}
                disabled={isGenerating || !refinementFeedback.trim()}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refine Script
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 