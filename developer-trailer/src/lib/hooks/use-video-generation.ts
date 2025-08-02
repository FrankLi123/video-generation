'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/trpc/client';
import { toast } from 'sonner';

export type GenerationStep = 'idle' | 'creating-project' | 'generating-script' | 'generating-video' | 'completed';

export interface VideoGenerationParams {
  projectName: string;
  description: string;
  duration?: string;
  trailerStyle?: string;
}

export function useVideoGeneration() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<GenerationStep>('idle');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  // tRPC mutations
  const createProjectMutation = api.project.createProject.useMutation();
  const generateScriptMutation = api.script.generateScript.useMutation();
  const generateVideoMutation = api.video.generateVideo.useMutation();

  // Video status polling
  const { data: videoStatus } = api.video.getVideoStatus.useQuery(
    { jobId: jobId! },
    { 
      enabled: !!jobId && currentStep === 'generating-video',
      refetchInterval: 3000,
    }
  );

  // Handle video status changes
  useEffect(() => {
    if (videoStatus) {
      if (videoStatus.status === 'completed') {
        setCurrentStep('completed');
        toast.success('Video generated successfully! Check your dashboard.');
        // Remove the setTimeout redirect
      } else if (videoStatus.status === 'failed') {
        resetGeneration();
        toast.error('Video generation failed. Please try again.');
      }
    }
  }, [videoStatus, router]);

  const resetGeneration = () => {
    setIsGenerating(false);
    setCurrentStep('idle');
    setProjectId(null);
    setJobId(null);
  };

  const generateTrailer = async (params: VideoGenerationParams) => {
    const { projectName, description, duration = '60', trailerStyle = '' } = params;

    if (!description.trim()) {
      toast.error('Please provide a content description');
      return;
    }

    try {
      setIsGenerating(true);
      setCurrentStep('creating-project');
      toast.info('Creating project...');

      // Step 1: Create project
      const project = await createProjectMutation.mutateAsync({
        title: projectName,
        description: description,
        personalPhotoUrl: null,
        productImages: []
      });
      
      setProjectId(project.id);
      setCurrentStep('generating-script');
      toast.info('Generating optimized video prompt...');

      // Step 2: Generate script optimized for fal.ai
      const scriptResult = await generateScriptMutation.mutateAsync({
        projectId: project.id,
        title: projectName,
        description: description,
      });

      // Step 3: Generate video with optimized prompt
      const videoResult = await generateVideoMutation.mutateAsync({
        prompt: scriptResult.script, // This should now be optimized for fal.ai
        aspectRatio: '16:9',
        duration: duration === '60' ? '10' : '5',
        resolution: '720p'
      });

      setJobId(videoResult.jobId);
      setCurrentStep('generating-video'); // ADD THIS LINE!
      toast.success('Video generation started! Monitoring progress...');

    } catch (error) {
      console.error('Generation failed:', error);
      resetGeneration();
      toast.error('Generation failed. Please try again.');
    }
  };

  return {
    isGenerating,
    currentStep,
    projectId,
    jobId,
    videoStatus,
    generateTrailer,
    resetGeneration
  };
}