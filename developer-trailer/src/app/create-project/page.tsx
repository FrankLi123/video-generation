'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Play } from 'lucide-react';
import { api } from '@/lib/trpc/client';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CreateProjectPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputText, setInputText] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [videoJobId, setVideoJobId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Generate script from input text
  const generateScript = api.script.generateScript.useMutation({
    onSuccess: (result) => {
      console.log('✅ Script generated:', result.script);
      setGeneratedScript(result.script);
      toast.success('Script generated! Now generating video...');
      
      // Automatically trigger video generation with Seedance
      generateVideo.mutate({
        prompt: result.script,
        duration: '5', // Seedance: 5 or 10 seconds
        aspectRatio: '16:9',
        resolution: '720p',
      });
    },
    onError: (error) => {
      toast.error('Failed to generate script');
      console.error('Script generation error:', error);
      setIsGenerating(false);
    },
  });

  // Generate video from script
  const generateVideo = api.video.generateVideo.useMutation({
    onSuccess: (result) => {
      console.log('✅ Video generation started:', result.jobId);
      setVideoJobId(result.jobId);
      toast.success('Video generation started!');
    },
    onError: (error) => {
      toast.error('Failed to generate video');
      console.error('Video generation error:', error);
      setIsGenerating(false);
    },
  });

  // Check video status
  const { data: videoStatus } = api.video.getVideoStatus.useQuery(
    { jobId: videoJobId! },
    {
      enabled: !!videoJobId && !videoUrl,
      refetchInterval: 3000,
    }
  );

  // Update video URL when completed
  if (videoStatus?.status === 'completed' && videoStatus.result?.videoUrl && !videoUrl) {
    setVideoUrl(videoStatus.result.videoUrl);
    setIsGenerating(false);
    toast.success('Video generated successfully!');
  }

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to generate a video');
      return;
    }

    setIsGenerating(true);
    setGeneratedScript('');
    setVideoJobId(null);
    setVideoUrl(null);

    // Generate script with simple input
    generateScript.mutate({
      projectId: 'temp-project',
      title: 'Quick Video',
      description: inputText.trim(),
    });
  };

  const progress = videoStatus?.progress || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Quick Video Generator</h1>
          <p className="text-gray-600 mt-2">
            Enter your idea → Generate script → Create 5-second video automatically
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What&apos;s your idea?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="inputText">Describe your project or idea</Label>
              <Textarea
                id="inputText"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g., A mobile app that helps people track their daily water intake with gamification features"
                className="mt-1 min-h-[100px]"
                disabled={isGenerating}
              />
            </div>
            
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !inputText.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Generate Script & Video
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Script */}
        {generatedScript && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Generated Script</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-mono">{generatedScript}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Video Generation Progress */}
        {videoJobId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Video Generation Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Status:</strong> {videoStatus?.status || 'Starting...'}</p>
                <p><strong>Message:</strong> {videoStatus?.message || 'Initializing video generation...'}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated Video */}
        {videoUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Your Generated Video</CardTitle>
            </CardHeader>
            <CardContent>
              <video 
                controls 
                className="w-full rounded-lg border"
                src={videoUrl}
              >
                Your browser does not support the video tag.
              </video>
              
              <div className="mt-4 flex gap-2">
                <Button 
                  onClick={() => window.open(videoUrl, '_blank')}
                  variant="outline"
                  className="flex-1"
                >
                  Download Video
                </Button>
                <Button 
                  onClick={() => {
                    setInputText('');
                    setGeneratedScript('');
                    setVideoJobId(null);
                    setVideoUrl(null);
                    setIsGenerating(false);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Create Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
