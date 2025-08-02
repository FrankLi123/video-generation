'use client';

import { Loader2 } from 'lucide-react';
import type { GenerationStep } from '@/lib/hooks/use-video-generation';

interface GenerationProgressProps {
  currentStep: GenerationStep;
  videoStatus?: {
    progress: number;
    status: string;
  };
}

const stepMessages = {
  'creating-project': 'Creating project...',
  'generating-script': 'Generating AI script...',
  'generating-video': 'Generating video...',
  'completed': 'Complete! Redirecting to dashboard...'
};

export function GenerationProgress({ currentStep, videoStatus }: GenerationProgressProps) {
  if (currentStep === 'idle') return null;

  return (
    <div className="mt-4 p-4 bg-background-secondary rounded-lg">
      <div className="flex items-center space-x-2 mb-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm font-medium">
          {stepMessages[currentStep as keyof typeof stepMessages]}
        </span>
      </div>
      
      {videoStatus && currentStep === 'generating-video' && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-text-muted">
            <span>Progress</span>
            <span>{videoStatus.progress}%</span>
          </div>
          <div className="w-full bg-background-tertiary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${videoStatus.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}