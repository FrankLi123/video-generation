'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import type { GenerationStep } from '@/lib/hooks/use-video-generation';

interface GenerateButtonProps {
  isGenerating: boolean;
  currentStep: GenerationStep;
  disabled: boolean;
  onClick: () => void;
}

const buttonMessages = {
  'creating-project': 'Creating Project...',
  'generating-script': 'Generating Script...',
  'generating-video': 'Generating Video...',
  'completed': 'Redirecting...'
};

export function GenerateButton({ isGenerating, currentStep, disabled, onClick }: GenerateButtonProps) {
  if (currentStep === 'completed') {
    return (
      <Button
        className="bg-green-600 hover:bg-green-700 text-white font-medium"
        onClick={() => window.location.href = '/dashboard'}
      >
        View Dashboard
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    );
  }
  return (
    <Button
      className="bg-primary hover:bg-primary/90 text-background-primary font-medium shadow-glow"
      disabled={disabled || isGenerating}
      onClick={onClick}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {buttonMessages[currentStep as keyof typeof buttonMessages] || 'Processing...'}
        </>
      ) : (
        <>
          Generate Trailer
          <ArrowRight className="w-4 h-4 ml-2" />
        </>
      )}
    </Button>
  );
}