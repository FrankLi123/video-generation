'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { Play, Download, RefreshCw } from 'lucide-react';

export function VideoGenerationTest() {
  const [prompt, setPrompt] = useState('A little dog is running in the sunshine');
  const [model, setModel] = useState<'seedance' | 'veo3'>('seedance');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '4:3' | '9:21'>('16:9');
  const [duration, setDuration] = useState('5');
  const [resolution, setResolution] = useState<'480p' | '720p' | '1080p'>('720p');
  const [jobId, setJobId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Video generation mutation
  const generateVideo = api.video.generateVideo.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.model} video generation started!`);
      setJobId(data.jobId);
      setVideoUrl(null);
    },
    onError: (error) => {
      toast.error(`Video generation failed: ${error.message}`);
      console.error('Video generation error:', error);
    },
  });

  // Video status query
  const { data: jobStatus, refetch: refetchStatus } = api.video.getVideoStatus.useQuery(
    { jobId: jobId!, model },
    { 
      enabled: !!jobId,
      refetchInterval: jobId && !videoUrl ? 3000 : false,
    }
  );

  // Handle video generation
  const handleGenerateVideo = () => {
    if (!prompt.trim()) {
      toast.error('Please enter a video prompt');
      return;
    }

    generateVideo.mutate({
      prompt: prompt.trim(),
      model,
      aspectRatio,
      duration: model === 'seedance' ? duration : '8s',
      resolution,
      enhancePrompt: true,
      generateAudio: model === 'veo3',
      cameraFixed: model === 'seedance' ? false : undefined,
    });
  };

  // Update video URL when job completes
  if (jobStatus?.status === 'completed' && jobStatus.result?.videoUrl && !videoUrl) {
    setVideoUrl(jobStatus.result.videoUrl);
    toast.success('Video generation completed!');
  }

  const isGenerating = generateVideo.isPending || (jobStatus?.status === 'processing' || jobStatus?.status === 'queued');
  const progress = jobStatus?.progress || 0;

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="prompt">Video Prompt</Label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the video you want to generate..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="model">Model</Label>
            <Select value={model} onValueChange={(value: 'seedance' | 'veo3') => setModel(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seedance">Seedance (5s, faster, default)</SelectItem>
                <SelectItem value="veo3">Veo 3 (8s, higher quality)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="aspectRatio">Aspect Ratio</Label>
            <Select value={aspectRatio} onValueChange={(value: any) => setAspectRatio(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                <SelectItem value="1:1">1:1 (Square)</SelectItem>
                <SelectItem value="4:3">4:3 (Classic)</SelectItem>
                <SelectItem value="9:21">9:21 (Tall)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {model === 'seedance' && (
            <div>
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 seconds</SelectItem>
                  <SelectItem value="4">4 seconds</SelectItem>
                  <SelectItem value="5">5 seconds (default)</SelectItem>
                  <SelectItem value="6">6 seconds</SelectItem>
                  <SelectItem value="7">7 seconds</SelectItem>
                  <SelectItem value="8">8 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="resolution">Resolution</Label>
            <Select value={resolution} onValueChange={(value: any) => setResolution(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="480p">480p (faster)</SelectItem>
                <SelectItem value="720p">720p (recommended)</SelectItem>
                <SelectItem value="1080p">1080p (higher quality)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleGenerateVideo}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Generate Video
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress and Status */}
      {jobId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Generation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Job ID:</strong> {jobId}</p>
                <p><strong>Model:</strong> {model}</p>
                <p><strong>Status:</strong> {jobStatus?.status || 'Unknown'}</p>
                <p><strong>Message:</strong> {jobStatus?.message || 'Checking status...'}</p>
              </div>

              {videoUrl && (
                <div className="space-y-4">
                  <div>
                    <Label>Generated Video</Label>
                    <video 
                      controls 
                      className="w-full max-w-md mt-2 rounded-lg border"
                      src={videoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  
                  <Button 
                    onClick={() => window.open(videoUrl, '_blank')}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Video
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
