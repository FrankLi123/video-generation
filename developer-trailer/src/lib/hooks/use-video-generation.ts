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
  // ADD THIS: Video completion mutation
  const updateProjectVideoMutation = api.video.updateProjectVideo.useMutation();

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
      console.log('📊 Video status update:', videoStatus);
      
      if (videoStatus.status === 'completed' && videoStatus.result?.videoUrl && projectId) {
        console.log('✅ Video generation completed, updating project...');
        
        // UPDATE PROJECT WITH VIDEO URL
        updateProjectVideoMutation.mutate({
          projectId,
          videoUrl: videoStatus.result.videoUrl,
          status: 'completed',
          jobId: jobId || undefined,
        }, {
          onSuccess: (updatedProject) => {
            console.log('✅ Project updated with video URL:', updatedProject);
            setCurrentStep('completed');
            toast.success('Video generation completed!');
            
            // Navigate to project detail page
            setTimeout(() => {
              router.push(`/projects/${projectId}`);
            }, 1500);
          },
          onError: (error) => {
            console.error('❌ Failed to update project with video:', error);
            toast.error('Failed to save video to project');
            setCurrentStep('completed'); // Still mark as completed for UI
          }
        });
      } else if (videoStatus.status === 'failed') {
        console.error('❌ Video generation failed:', videoStatus.message);
        toast.error(`Video generation failed: ${videoStatus.message}`);
        
        // Update project status to failed
        if (projectId) {
          updateProjectVideoMutation.mutate({
            projectId,
            videoUrl: '',
            status: 'failed',
            jobId: jobId || undefined,
          });
        }
        
        resetGeneration();
      }
    }
  }, [videoStatus, projectId, jobId, updateProjectVideoMutation, router]);

  const resetGeneration = () => {
    setIsGenerating(false);
    setCurrentStep('idle');
    setProjectId(null);
    setJobId(null);
  };

  const generateTrailer = async (formData: {
    title: string;
    description: string;
    personalPhotoUrl?: string;
    productImages?: string[];
  }) => {
    try {
      setIsGenerating(true);
      setCurrentStep('creating-project');

      // Step 1: Create project
      console.log('📝 Creating project...');
      const project = await createProjectMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        personalPhotoUrl: formData.personalPhotoUrl,
        productImages: formData.productImages || [],
      });

      setProjectId(project.id);
      toast.success('Project created successfully!');
      setCurrentStep('generating-script');

      // Step 2: Generate script
      console.log('📝 Generating script...');
      const scriptResult = await generateScriptMutation.mutateAsync({
        projectId: project.id,
        title: formData.title,
        description: formData.description,
        targetAudience: 'developers and tech enthusiasts',
        tone: 'professional',
        duration: 30,
      });

      toast.success('Script generated successfully!');
      // ADD THIS LINE: Update step to generating-video
      setCurrentStep('generating-video');

      // Step 3: Generate video
      console.log('🎬 Generating video...');
      const videoResult = await generateVideoMutation.mutateAsync({
        prompt: `Create a professional developer trailer video: ${formData.description}`,
        aspectRatio: '16:9',
        resolution: '1080p',
        duration: '5',
      });

      setJobId(videoResult.jobId);
      toast.success('Video generation started!');
      
      // The video completion will be handled by the useEffect above
    } catch (error) {
      console.error('❌ Generation error:', error);
      toast.error('Generation failed. Please try again.');
      resetGeneration();
    }
  };

  return {
    isGenerating,
    currentStep,
    generateTrailer,
    resetGeneration,
    projectId,
    jobId,
  };
}