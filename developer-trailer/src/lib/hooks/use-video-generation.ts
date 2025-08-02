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

  const createProjectMutation = api.project.createProject.useMutation();
  const generateScriptMutation = api.script.generateScript.useMutation();
  const generateVideoMutation = api.video.generateVideo.useMutation();

  const { data: videoStatus } = api.video.getVideoStatus.useQuery(
    { jobId: jobId! },
    { 
      enabled: !!jobId && currentStep === 'generating-video',
      refetchInterval: 3000, // 3 seconds
    }
  );

  // Add state to track if update is in progress
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);
  const [hasUpdatedProject, setHasUpdatedProject] = useState(false);
  const [lastUpdateKey, setLastUpdateKey] = useState<string | null>(null);

  // Define the mutation BEFORE the useEffect that uses it
  const updateProjectVideoMutation = api.video.updateProjectVideo.useMutation({
    onSuccess: (updatedProject) => {
      console.log('✅ Project updated with video URL:', updatedProject);
      setCurrentStep('completed');
      setIsUpdatingProject(false);
      setHasUpdatedProject(true);
      toast.success('Video generation completed!');
      
      // Force refresh the projects query to update dashboard
      api.project.getProjects.invalidate();
      
      // Navigate to project detail page
      setTimeout(() => {
        router.push(`/projects/${projectId}`);
      }, 1500);
    },
    onError: (error) => {
      console.error('❌ Failed to update project with video:', error);
      setIsUpdatingProject(false);
      
      // Don't mark as completed if there was an error
      if (error.message.includes('JSON')) {
        toast.error('Network error occurred. Please refresh the page.');
      } else {
        toast.error('Failed to save video to project');
      }
    },
    retry: false, // Disable retry to prevent multiple calls
  });
  
  // Handle video status changes
  useEffect(() => {
    if (videoStatus && projectId && jobId) {
      console.log('📊 Video status update:', videoStatus);
      
      if (videoStatus.status === 'completed' && videoStatus.result?.videoUrl) {
        // Create a unique key for this update
        const updateKey = `${projectId}-${jobId}-${videoStatus.result.videoUrl}`;
        
        // Skip if we've already processed this exact update
        if (lastUpdateKey === updateKey) {
          console.log('⏭️ Skipping duplicate update for:', updateKey);
          return;
        }
        
        // Prevent duplicate updates - make this check more strict
        if (isUpdatingProject || hasUpdatedProject || updateProjectVideoMutation.isLoading) {
          console.log('⏳ Project update already in progress or completed, skipping...');
          return;
        }
        
        console.log('✅ Video generation completed, updating project...');
        setLastUpdateKey(updateKey);
        setIsUpdatingProject(true);
        
        // Clean the video URL more thoroughly
        const cleanVideoUrl = videoStatus.result.videoUrl
          .replace(/[`'"\s]/g, '') // Remove backticks, quotes, and whitespace
          .trim();
    
        // UPDATE PROJECT WITH VIDEO URL - add timeout to prevent hanging
        const timeoutId = setTimeout(() => {
          if (isUpdatingProject) {
            console.log('⚠️ Update timeout, resetting state');
            setIsUpdatingProject(false);
          }
        }, 10000); // 10 second timeout
        
        updateProjectVideoMutation.mutate({
          projectId,
          videoUrl: cleanVideoUrl,
          status: 'completed',
          jobId: jobId || undefined,
        });
        
        // Clear timeout on success/error (handled in mutation callbacks)
        return () => clearTimeout(timeoutId);
      } else if (videoStatus.status === 'failed') {
        // Only update if not already updated
        if (!isUpdatingProject && !hasUpdatedProject) {
          const errorMessage = videoStatus.message || 'Unknown error occurred';
          console.error('❌ Video generation failed:', errorMessage);
          
          // Show more specific error message
          if (errorMessage.includes('timeout')) {
            toast.error('Video generation timed out. Please try again.');
          } else if (errorMessage.includes('quota')) {
            toast.error('API quota exceeded. Please try again later.');
          } else {
            toast.error(`Video generation failed: ${errorMessage}`);
          }
          
          setIsUpdatingProject(true);
          updateProjectVideoMutation.mutate({
            projectId,
            videoUrl: '',
            status: 'failed',
            jobId: jobId || undefined,
          });
        }
      }
    }
  }, [videoStatus, projectId, jobId, isUpdatingProject, hasUpdatedProject, lastUpdateKey, updateProjectVideoMutation]);
  
  // Reset states when starting new generation
  const resetGeneration = () => {
    setCurrentStep('idle');
    setProjectId(null);
    setJobId(null);
    setIsUpdatingProject(false);
    setHasUpdatedProject(false);
    setLastUpdateKey(null);
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
        prompt: scriptResult.script,
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