import { Queue, Worker, Job } from 'bullmq';
import { createBullMQConnection } from './redis';
import {
  generateVideo,
  getVideoJobStatus,
  type VideoGenerationInput,
} from '../ai/veo-fal';
import type { VideoGenerationProgress } from '../ai/veo-fal';

// Simplified job data types for MVP
export interface VideoGenerationJobData {
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

export interface VideoJobResult {
  success: boolean;
  result?: VideoGenerationProgress['result'];
  error?: string;
  falJobId?: string;
}

// Queue configuration
const QUEUE_NAME = 'video-generation';
const redis = createBullMQConnection();

// Create the video generation queue
export const videoQueue = new Queue(QUEUE_NAME, {
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

/**
 * Add a video generation job to the queue
 */
export async function addVideoGenerationJob(
  projectId: string,
  userId: string,
  input: VideoGenerationInput,
  segmentId?: string
): Promise<Job<VideoGenerationJobData>> {
  console.log('📋 Adding video generation job to queue:', { projectId, segmentId });

  const jobData: VideoGenerationJobData = {
    projectId,
    userId,
    segmentId,
    jobType: segmentId ? 'segment' : 'full_video',
    input,
    retryCount: 0,
  };

  const job = await videoQueue.add('generate-video', jobData, {
    priority: segmentId ? 1 : 10, // Segments have higher priority
    delay: 0,
  });

  // Record job in database
  try {
    await db.insert(video_jobs).values({
      project_id: projectId,
      user_id: userId,
      job_id: job.id!,
      job_type: jobData.jobType,
      status: 'pending',
      input_data: jobData,
      progress: 0,
    });
  } catch (error) {
    console.error('❌ Error recording video job in database:', error);
  }

  return job;
}

/**
 * Generate video for all segments of a project
 */
export async function generateProjectVideo(projectId: string, userId: string): Promise<string[]> {
  console.log('🎬 Starting project video generation:', projectId);

  try {
    // Get project script and segments
    const supabase = await createClient();
    const { data: project, error } = await supabase
      .from('projects')
      .select('generated_script, video_status')
      .eq('id', projectId)
      .single();

    if (error || !project) {
      throw new Error('Project not found or no script available');
    }

    if (!project.generated_script) {
      throw new Error('No script found for project');
    }

    // Update project status
    await supabase
      .from('projects')
      .update({ 
        video_status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    const script = project.generated_script as any;
    const scenes = script.scenes || [];

    if (scenes.length === 0) {
      throw new Error('No scenes found in script');
    }

    // Create video segments in database
    const segmentJobs: string[] = [];
    
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      
      // Create segment record
      const [segment] = await db.insert(video_segments).values({
        project_id: projectId,
        segment_order: i,
        start_time: scene.startTime || i * 8,
        end_time: scene.endTime || (i + 1) * 8,
        segment_type: scene.id || `segment_${i}`,
        text_overlay: scene.voiceover,
        voiceover_text: scene.voiceover,
        transition_type: scene.transition || 'fade',
      }).returning();

      // Generate video prompt from scene
      const prompt = sceneToVideoPrompt(scene);
      
      // Create video generation input
      const videoInput: VideoGenerationInput = {
        prompt,
        duration: Math.min(8, scene.endTime - scene.startTime || 8),
        resolution: '1080p',
        style: 'professional',
        aspectRatio: '16:9',
      };

      // Add job to queue
      const job = await addVideoGenerationJob(
        projectId,
        userId,
        videoInput,
        segment.id
      );

      segmentJobs.push(job.id!);
    }

    console.log(`✅ Created ${segmentJobs.length} video generation jobs`);
    return segmentJobs;

  } catch (error) {
    console.error('❌ Error generating project video:', error);
    
    // Update project status to failed
    const supabase = await createClient();
    await supabase
      .from('projects')
      .update({ 
        video_status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    throw error;
  }
}

/**
 * Get video generation job status
 */
export async function getVideoJobStatus(jobId: string): Promise<{
  status: string;
  progress: number;
  result?: VideoGenerationResult;
  error?: string;
}> {
  try {
    // Get job from database
    const [jobRecord] = await db
      .select()
      .from(video_jobs)
      .where(eq(video_jobs.job_id, jobId))
      .limit(1);

    if (!jobRecord) {
      throw new Error('Job not found');
    }

    // Get job from queue
    const job = await Job.fromId(videoQueue, jobId);
    
    if (!job) {
      return {
        status: jobRecord.status,
        progress: jobRecord.progress || 0,
        error: jobRecord.error_message || undefined,
      };
    }

    const state = await job.getState();
    let progress = 0;
    let result: VideoGenerationResult | undefined;
    let error: string | undefined;

    if (state === 'completed') {
      progress = 100;
      result = job.returnvalue?.result;
    } else if (state === 'failed') {
      error = job.failedReason || 'Unknown error';
    } else if (state === 'active') {
      progress = job.progress as number || 0;
    }

    // Update database record
    await db
      .update(video_jobs)
      .set({
        status: state,
        progress,
        result_data: result,
        error_message: error,
        updated_at: new Date(),
      })
      .where(eq(video_jobs.job_id, jobId));

    return {
      status: state,
      progress,
      result,
      error,
    };

  } catch (error) {
    console.error('❌ Error getting video job status:', error);
    throw error;
  }
}

/**
 * Get project video generation progress
 */
export async function getProjectVideoProgress(projectId: string): Promise<{
  overallProgress: number;
  segmentProgress: Array<{
    segmentId: string;
    order: number;
    status: string;
    progress: number;
    videoUrl?: string;
  }>;
  status: string;
}> {
  try {
    const supabase = await createClient();

    // Get all video jobs for this project
    const { data: jobs, error: jobsError } = await supabase
      .from('video_jobs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at');

    // Get video segments
    const { data: segments, error: segmentsError } = await supabase
      .from('video_segments')
      .select('*')
      .eq('project_id', projectId)
      .order('segment_index');

    if (jobsError || segmentsError) {
      console.error('Database query errors:', { jobsError, segmentsError });
      throw new Error('Failed to fetch project progress data');
    }

    const segmentProgress = (segments || []).map(segment => {
      const job = (jobs || []).find(j =>
        j.input_data &&
        (j.input_data as any).segmentId === segment.id
      );

      return {
        segmentId: segment.id,
        order: segment.segment_order,
        status: job?.status || 'pending',
        progress: job?.progress || 0,
        videoUrl: segment.content_url || undefined,
      };
    });

    // Calculate overall progress
    const totalProgress = segmentProgress.reduce((sum, seg) => sum + seg.progress, 0);
    const overallProgress = segmentProgress.length > 0 
      ? Math.round(totalProgress / segmentProgress.length) 
      : 0;

    // Determine overall status
    const allCompleted = segmentProgress.every(seg => seg.status === 'completed');
    const anyFailed = segmentProgress.some(seg => seg.status === 'failed');
    const anyProcessing = segmentProgress.some(seg => seg.status === 'active' || seg.status === 'processing');

    let status = 'pending';
    if (allCompleted) {
      status = 'completed';
    } else if (anyFailed) {
      status = 'failed';
    } else if (anyProcessing) {
      status = 'processing';
    }

    return {
      overallProgress,
      segmentProgress,
      status,
    };

  } catch (error) {
    console.error('❌ Error getting project video progress:', error);
    throw error;
  }
}

/**
 * Create video generation worker (only call this in worker processes)
 * This should not be imported in API routes to avoid initialization issues
 */
export function createVideoWorker() {
  console.log('🔧 Creating video generation worker...');

  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job<VideoGenerationJobData>) => {
      const { projectId, segmentId, input } = job.data;

      console.log(`🎬 Processing video generation job: ${job.id}`);
      console.log(`📋 Job data:`, { projectId, segmentId, prompt: input.prompt.substring(0, 100) });

      try {
        // Update job progress
        await job.updateProgress(10);

        // Generate video with Veo API
        const { jobId: veoJobId } = await generateVideo(input);
        console.log(`🚀 Veo job started: ${veoJobId}`);

        await job.updateProgress(20);

        // Poll for completion
        let veoStatus = await getVideoJobStatus(veoJobId);
        let pollCount = 0;
        const maxPolls = 60; // 5 minutes max

        while (veoStatus.status === 'queued' || veoStatus.status === 'processing') {
          if (pollCount >= maxPolls) {
            throw new Error('Video generation timeout');
          }

          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          veoStatus = await getVideoJobStatus(veoJobId);

          // Update progress based on Veo status
          const veoProgress = Math.min(90, 20 + (veoStatus.progress * 0.7));
          await job.updateProgress(veoProgress);

          pollCount++;
          console.log(`📊 Veo status: ${veoStatus.status}, progress: ${veoStatus.progress}%`);
        }

        if (veoStatus.status === 'failed') {
          throw new Error(`Veo generation failed: ${veoStatus.error || 'Unknown error'}`);
        }

        // Get the final result
        const result = await getVideoJobResult(veoJobId);
        console.log(`✅ Video generated: ${result.videoUrl}`);

        // Update segment in database if this is a segment job
        if (segmentId) {
          const supabase = await createClient();
          await supabase
            .from('video_segments')
            .update({
              status: 'completed',
              video_url: result.videoUrl,
              updated_at: new Date().toISOString(),
            })
            .eq('id', segmentId);
        }

        await job.updateProgress(100);

        return {
          success: true,
          result,
          segmentId,
        };

      } catch (error) {
        console.error(`❌ Video generation failed for job ${job.id}:`, error);

        // Update segment status to failed
        if (segmentId) {
          const supabase = await createClient();
          await supabase
            .from('video_segments')
            .update({
              status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', segmentId);
        }

        throw error;
      }
    },
    {
      connection: redis,
      concurrency: 2, // Process 2 videos at a time
    }
  );

  // Setup event handlers
  worker.on('completed', async (job: any, result: any) => {
    console.log(`✅ Video job ${job.id} completed successfully`);

    try {
      // Check if all segments for the project are completed
      const { projectId } = job.data;
      const progress = await getProjectVideoProgress(projectId);

      if (progress.status === 'completed') {
        console.log(`🎉 All segments completed for project ${projectId}`);

        // Update project status
        const supabase = await createClient();
        await supabase
          .from('projects')
          .update({
            video_status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId);
      }
    } catch (error) {
      console.error('❌ Error in completed handler:', error);
    }
  });

  worker.on('failed', async (job: any, err: any) => {
    console.error(`❌ Video job ${job?.id} failed:`, err.message);

    try {
      if (job) {
        const { projectId } = job.data;

        // Check if this failure should mark the entire project as failed
        const progress = await getProjectVideoProgress(projectId);
        const failedSegments = progress.segmentProgress.filter(seg => seg.status === 'failed');

        // If more than half the segments failed, mark project as failed
        if (failedSegments.length > progress.segmentProgress.length / 2) {
          const supabase = await createClient();
          await supabase
            .from('projects')
            .update({
              video_status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', projectId);
        }
      }
    } catch (error) {
      console.error('❌ Error in failed handler:', error);
    }
  });

  worker.on('error', (err: any) => {
    console.error('❌ Video worker error:', err);
  });

  console.log('✅ Video generation worker created successfully');
  return worker;
}
