import { Queue, Worker, Job } from 'bullmq';
import { createBullMQConnection } from './redis';
import { 
  generateVideo, 
  getVideoJobStatus,
  type VideoGenerationInput,
} from '../ai/veo-fal';
import type { VideoGenerationProgress } from '../ai/veo-fal';

// Simplified job data types for MVP
export interface SimpleVideoJobData {
  prompt: string;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '9:21';
  resolution?: '480p' | '720p' | '1080p';
  duration?: '5' | '10';
  seed?: number;
  cameraFixed?: boolean;
  // Metadata
  userId?: string;
  projectId?: string;
}

export interface SimpleVideoJobResult {
  success: boolean;
  result?: VideoGenerationProgress['result'];
  error?: string;
  falJobId?: string;
}

// Queue configuration
const QUEUE_NAME = 'simple-video-generation';
const redis = createBullMQConnection();

// Create the video generation queue
export const simpleVideoQueue = new Queue(QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

// Add a simplified video generation job to the queue
export async function addSimpleVideoJob(
  jobData: SimpleVideoJobData
): Promise<string> {
  console.log('🎬 Adding simple video generation job to queue:', jobData);

  // Add job to queue
  const job = await simpleVideoQueue.add('generate-video', jobData, {
    priority: 10,
    delay: 0,
  });

  console.log('✅ Simple video generation job added to queue:', job.id);
  return job.id!;
}

// Create the worker
export const simpleVideoWorker = new Worker(
  QUEUE_NAME,
  async (job: Job<SimpleVideoJobData>) => {
    console.log('🔄 Processing simple video generation job:', job.id);
    console.log('📋 Job data:', job.data);
    
    const { prompt, aspectRatio, resolution, duration, seed, cameraFixed } = job.data;

    try {
      // Update job progress
      await job.updateProgress(10);

      // Generate video using fal.ai
      console.log('🎬 Starting video generation with fal.ai...');
      const input: VideoGenerationInput = {
        prompt,
        aspectRatio: aspectRatio || '16:9',
        resolution: resolution || '720p',
        duration: duration || '5',
        seed,
        cameraFixed,
      };

      const result = await generateVideo(input);
      console.log('📤 fal.ai job submitted:', result.jobId);
      
      await job.updateProgress(30);

      // Poll for completion
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max
      let videoResult: VideoGenerationProgress | null = null;

      console.log('🔄 Starting status polling...');
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        
        const status = await getVideoJobStatus(result.jobId);
        console.log(`📊 Attempt ${attempts + 1}: Status = ${status.status}, Progress = ${status.progress}%`);
        
        if (status.status === 'completed' && status.result) {
          videoResult = status;
          console.log('🎉 Video generation completed!');
          break;
        } else if (status.status === 'failed') {
          throw new Error('Video generation failed');
        }
        
        attempts++;
        const progressPercent = 30 + (attempts / maxAttempts) * 60;
        await job.updateProgress(progressPercent);
      }

      if (!videoResult || !videoResult.result) {
        throw new Error('Video generation timed out');
      }

      await job.updateProgress(100);

      console.log('✅ Simple video generation job completed:', job.id);
      console.log('🎬 Video URL:', videoResult.result.videoUrl);
      
      return {
        success: true,
        result: videoResult.result,
        falJobId: result.jobId,
      } as SimpleVideoJobResult;

    } catch (error) {
      console.error('❌ Simple video generation job failed:', error);
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 2, // Process 2 jobs at once
  }
);

// Event listeners
simpleVideoWorker.on('completed', (job, result) => {
  console.log('✅ Simple video generation job completed:', job.id);
  console.log('🎬 Result:', result);
});

simpleVideoWorker.on('failed', (job, err) => {
  console.error('❌ Simple video generation job failed:', job?.id, err.message);
});

simpleVideoWorker.on('error', (err) => {
  console.error('❌ Simple video worker error:', err);
});

// Export queue status functions
export async function getSimpleQueueStatus() {
  const waiting = await simpleVideoQueue.getWaiting();
  const active = await simpleVideoQueue.getActive();
  const completed = await simpleVideoQueue.getCompleted();
  const failed = await simpleVideoQueue.getFailed();

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
  };
}

export async function getSimpleJobStatus(jobId: string) {
  const job = await simpleVideoQueue.getJob(jobId);
  if (!job) {
    return null;
  }

  return {
    id: job.id,
    name: job.name,
    data: job.data,
    progress: job.progress,
    returnvalue: job.returnvalue,
    failedReason: job.failedReason,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
  };
}

// Test Redis connection
export async function testSimpleQueueConnection(): Promise<boolean> {
  try {
    await redis.ping();
    console.log('✅ Simple video queue Redis connection successful');
    return true;
  } catch (error) {
    console.error('❌ Simple video queue Redis connection failed:', error);
    return false;
  }
}

// Initialize worker
console.log('🚀 Simple video generation worker initialized');

export default simpleVideoQueue;
