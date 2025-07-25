'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Video,
  Download
} from 'lucide-react';

interface VideoProgressProps {
  projectId: string;
  onVideoComplete?: (videoUrl: string) => void;
}

interface SegmentProgress {
  segmentId: string;
  order: number;
  status: string;
  progress: number;
  videoUrl?: string;
}

export function VideoProgress({ projectId, onVideoComplete }: VideoProgressProps) {
  const [isPolling, setIsPolling] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Get project video progress
  const { 
    data: progressData, 
    refetch: refetchProgress,
    isLoading: isLoadingProgress 
  } = api.video.getProjectProgress.useQuery(
    { projectId },
    {
      enabled: !!projectId,
      refetchInterval: isPolling ? 5000 : false, // Poll every 5 seconds when active (reduced frequency)
      refetchOnWindowFocus: false, // 避免窗口焦点时重新请求
    }
  );

  // Get project segments
  const { 
    data: segmentsData,
    refetch: refetchSegments 
  } = api.video.getProjectSegments.useQuery(
    { projectId },
    {
      enabled: !!projectId,
    }
  );

  // Generate video mutation
  const generateVideoMutation = api.video.generateProjectVideo.useMutation({
    onSuccess: (data) => {
      toast.success(`Video generation started with ${data.jobIds.length} segments`);
      setIsPolling(true);
      refetchProgress();
    },
    onError: (error) => {
      toast.error(`Failed to start video generation: ${error.message}`);
    },
  });

  // Cancel video generation mutation
  const cancelVideoMutation = api.video.cancelVideoGeneration.useMutation({
    onSuccess: () => {
      toast.success('Video generation cancelled');
      setIsPolling(false);
      refetchProgress();
    },
    onError: (error) => {
      toast.error(`Failed to cancel video generation: ${error.message}`);
    },
  });

  // Auto-stop polling when completed or failed
  useEffect(() => {
    if (progressData?.status === 'completed' || progressData?.status === 'failed') {
      setIsPolling(false);
      
      if (progressData?.status === 'completed' && onVideoComplete) {
        // Find the final video URL (this would be implemented in video composition)
        const completedSegments = progressData.segmentProgress.filter(seg => seg.videoUrl);
        if (completedSegments.length > 0) {
          // For now, just use the first segment URL as placeholder
          onVideoComplete(completedSegments[0].videoUrl!);
        }
      }
    }
  }, [progressData?.status, onVideoComplete, progressData?.segmentProgress]);

  // Update last update time
  useEffect(() => {
    if (progressData) {
      setLastUpdate(new Date());
    }
  }, [progressData]);

  const handleStartGeneration = () => {
    generateVideoMutation.mutate({
      projectId,
      resolution: '1080p',
      style: 'professional',
      aspectRatio: '16:9',
    });
  };

  const handleCancelGeneration = () => {
    cancelVideoMutation.mutate({ projectId });
  };

  const handleRefresh = () => {
    refetchProgress();
    refetchSegments();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
      case 'active':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
      case 'active':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isGenerating = progressData?.status === 'processing';
  const canStart = progressData?.status !== 'processing' && !generateVideoMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Generation Progress
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(progressData?.status || 'pending')}>
                {progressData?.status || 'pending'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoadingProgress}
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingProgress ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{progressData?.overallProgress || 0}%</span>
            </div>
            <Progress value={progressData?.overallProgress || 0} className="h-2" />
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2">
            {!isGenerating ? (
              <Button
                onClick={handleStartGeneration}
                disabled={!canStart || generateVideoMutation.isPending}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {generateVideoMutation.isPending ? 'Starting...' : 'Start Generation'}
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleCancelGeneration}
                disabled={cancelVideoMutation.isPending}
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                {cancelVideoMutation.isPending ? 'Cancelling...' : 'Cancel Generation'}
              </Button>
            )}
          </div>

          {/* Last Update */}
          <div className="text-xs text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>

      {/* Segment Progress */}
      {progressData?.segmentProgress && progressData.segmentProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Segment Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progressData.segmentProgress.map((segment) => (
                <div
                  key={segment.segmentId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(segment.status)}
                    <div>
                      <div className="font-medium">Segment {segment.order + 1}</div>
                      <div className="text-sm text-gray-500">
                        Status: {segment.status}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">{segment.progress}%</div>
                      <Progress value={segment.progress} className="w-20 h-1" />
                    </div>
                    
                    {segment.videoUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(segment.videoUrl, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        View
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Segment Details */}
      {segmentsData?.segments && segmentsData.segments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Video Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {segmentsData.segments.map((segment, index) => (
                <div
                  key={segment.id}
                  className="flex items-center justify-between p-2 text-sm border rounded"
                >
                  <div>
                    <span className="font-medium">Segment {index + 1}</span>
                    <span className="text-gray-500 ml-2">
                      ({segment.duration_seconds}s)
                    </span>
                  </div>
                  <div className="text-gray-600 max-w-md truncate">
                    {segment.script_text}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
