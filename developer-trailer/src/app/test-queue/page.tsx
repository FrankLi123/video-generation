'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc/client';

export default function TestQueuePage() {
  const [prompt, setPrompt] = useState('A cat playing with a ball of yarn');
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);

  // Generate video mutation
  const generateVideo = api.video.generateVideo.useMutation({
    onSuccess: (result) => {
      console.log('✅ Video generation started:', result);
      setJobId(result.jobId);
    },
    onError: (error) => {
      console.error('❌ Video generation failed:', error);
    },
  });

  // Check video status
  const { data: videoStatus, refetch } = api.video.getVideoStatus.useQuery(
    { jobId: jobId! },
    { 
      enabled: !!jobId,
      refetchInterval: 3000,
    }
  );

  const handleGenerate = () => {
    generateVideo.mutate({
      prompt,
      duration: '5',
      aspectRatio: '16:9',
      resolution: '720p',
    });
  };

  const handleCheckStatus = () => {
    if (jobId) {
      refetch();
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">🧪 Queue System Test</h1>
      
      <div className="space-y-6">
        {/* Input Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Generate Video</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Video Prompt:</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-3 border rounded-lg"
                rows={3}
                placeholder="Describe what you want to see in the video..."
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={generateVideo.isPending}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {generateVideo.isPending ? 'Adding to Queue...' : 'Generate Video'}
            </button>
          </div>
        </div>

        {/* Job Status Section */}
        {jobId && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Job Status</h2>
            <div className="space-y-2">
              <p><strong>Job ID:</strong> {jobId}</p>
              <p><strong>Status:</strong> {videoStatus?.status || 'Unknown'}</p>
              <p><strong>Progress:</strong> {videoStatus?.progress || 0}%</p>
              {videoStatus?.message && (
                <p><strong>Message:</strong> {videoStatus.message}</p>
              )}
              {videoStatus?.result?.videoUrl && (
                <div>
                  <p><strong>Video URL:</strong></p>
                  <a 
                    href={videoStatus.result.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-all"
                  >
                    {videoStatus.result.videoUrl}
                  </a>
                </div>
              )}
            </div>
            <button
              onClick={handleCheckStatus}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Refresh Status
            </button>
          </div>
        )}

        {/* Video Display */}
        {videoStatus?.result?.videoUrl && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Generated Video</h2>
            <video 
              controls 
              className="w-full max-w-2xl"
              src={videoStatus.result.videoUrl}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Debug Info */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">🔍 Debug Info</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify({ 
              jobId, 
              videoStatus,
              generateVideoLoading: generateVideo.isPending 
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
