'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function TestPage() {
  const [formData, setFormData] = useState({
    title: 'AI Video Generator',
    description: 'A revolutionary AI-powered tool that creates professional video trailers for developers to showcase their projects on social media platforms.',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [scriptParams, setScriptParams] = useState({
    targetAudience: 'developers and tech enthusiasts',
    tone: 'professional' as const,
    duration: 30,
  });

  // Test project creation
  const createProject = api.project.createProject.useMutation({
    onSuccess: (data) => {
      toast.success('Project created successfully!');
      setProjectId(data.id);
      console.log('Created project:', data);
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      toast.error('Failed to create project: ' + error.message);
    },
  });

  // Test script generation
  const generateScript = api.script.generateScript.useMutation({
    onSuccess: (data) => {
      toast.success('Script generated successfully!');
      console.log('Generated script:', data);
    },
    onError: (error) => {
      console.error('Error generating script:', error);
      toast.error('Failed to generate script: ' + error.message);
    },
  });

  // Test API connection
  const testConnection = api.project.test.useQuery(undefined, {
    enabled: false,
  });

  const handleTestConnection = () => {
    testConnection.refetch();
  };

  const handleCreateProject = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await createProject.mutateAsync({
        title: formData.title,
        description: formData.description,
        personalPhotoUrl: null,
        productImages: ['https://via.placeholder.com/300x200'], // Dummy image for testing
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!projectId) {
      toast.error('Please create a project first');
      return;
    }

    try {
      await generateScript.mutateAsync({
        projectId,
        ...scriptParams,
      });
    } catch (error) {
      console.error('Script generation error:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleTestConnection} disabled={testConnection.isFetching}>
            {testConnection.isFetching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Test API Connection'
            )}
          </Button>
          {testConnection.data && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800">✅ API Connection Successful!</p>
              <pre className="text-sm mt-2">{JSON.stringify(testConnection.data, null, 2)}</pre>
            </div>
          )}
          {testConnection.error && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-red-800">❌ API Connection Failed!</p>
              <pre className="text-sm mt-2">{testConnection.error.message}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Creation Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter project title"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter project description"
              rows={4}
            />
          </div>

          <Button 
            onClick={handleCreateProject} 
            disabled={isSubmitting || createProject.isPending}
            className="w-full"
          >
            {isSubmitting || createProject.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Project...
              </>
            ) : (
              'Create Test Project'
            )}
          </Button>

          {projectId && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">✅ Project Created!</p>
              <p className="text-sm mt-1">Project ID: {projectId}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {projectId && (
        <Card>
          <CardHeader>
            <CardTitle>Script Generation Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                value={scriptParams.targetAudience}
                onChange={(e) => setScriptParams(prev => ({ ...prev, targetAudience: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="tone">Tone</Label>
              <select
                id="tone"
                value={scriptParams.tone}
                onChange={(e) => setScriptParams(prev => ({ ...prev, tone: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="energetic">Energetic</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>

            <div>
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                max="60"
                value={scriptParams.duration}
                onChange={(e) => setScriptParams(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              />
            </div>

            <Button 
              onClick={handleGenerateScript} 
              disabled={generateScript.isPending}
              className="w-full"
            >
              {generateScript.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Script...
                </>
              ) : (
                'Generate Script'
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
