import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../server';
import { TRPCError } from '@trpc/server';

export const videoRouter = createTRPCRouter({
  // Video generation using fal.ai Seedance (cost-effective, 5-10 second videos)
  generateVideo: publicProcedure
    .input(z.object({
      prompt: z.string().min(1).max(1000),
      aspectRatio: z.enum(['16:9', '9:16', '1:1', '4:3', '9:21']).optional().default('16:9'),
      resolution: z.enum(['480p', '720p', '1080p']).optional().default('720p'),
      duration: z.enum(['5', '10']).optional().default('5'), // Seedance only supports 5 or 10 seconds
      seed: z.number().optional(),
      cameraFixed: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      console.log('🎬 FAL.AI SEEDANCE GENERATION:', input);

      try {
        // Use the queue system for video generation
        const { addSimpleVideoJob } = await import('@/lib/queue/simple-video-queue');

        const queueJobId = await addSimpleVideoJob({
          prompt: input.prompt,
          aspectRatio: input.aspectRatio,
          resolution: input.resolution,
          duration: input.duration,
          seed: input.seed,
          cameraFixed: input.cameraFixed,
        });

        console.log('✅ VIDEO JOB ADDED TO QUEUE:', queueJobId);

        return {
          success: true,
          jobId: queueJobId, // Return queue job ID
          model: 'seedance',
          message: 'Video generation job added to queue',
        };

      } catch (error) {
        console.error('❌ QUEUE VIDEO GENERATION ERROR:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Video generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  // Video generation status check (Seedance only)
  getVideoStatus: publicProcedure
    .input(z.object({
      jobId: z.string(),
    }))
    .query(async ({ input }) => {
      console.log('📊 FAL.AI SEEDANCE STATUS CHECK:', input.jobId);

      try {
        const { getSimpleJobStatus } = await import('@/lib/queue/simple-video-queue');
        const queueJob = await getSimpleJobStatus(input.jobId);

        console.log('✅ QUEUE JOB STATUS:', queueJob);

        if (!queueJob) {
          return {
            success: false,
            status: 'error',
            message: 'Job not found',
          };
        }

        // Map queue job status to our expected format
        let status = 'processing';
        let progress = queueJob.progress || 0;
        let result = undefined;

        if (queueJob.returnvalue?.success) {
          status = 'completed';
          progress = 100;
          result = queueJob.returnvalue.result;
        } else if (queueJob.failedReason) {
          status = 'failed';
          progress = 0;
        }

        return {
          success: true,
          status,
          progress,
          result,
          message: queueJob.failedReason || 'Video generation in progress',
        };

      } catch (error) {
        console.error('❌ QUEUE STATUS CHECK ERROR:', error);
        return {
          success: false,
          status: 'error',
          message: `Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }),

  // ADD THIS: Update project with completed video
  updateProjectVideo: publicProcedure
    .input(z.object({
      projectId: z.string(),
      videoUrl: z.string(),
      status: z.enum(['completed', 'failed']),
      jobId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      console.log('🎬 UPDATING PROJECT VIDEO:', input);

      try {
        const { data: project, error } = await ctx.supabase
          .from('projects')
          .update({
            video_url: input.videoUrl,
            video_status: input.status,
            video_job_id: input.jobId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.projectId)
          .select()
          .single();

        if (error) {
          console.error('❌ PROJECT UPDATE ERROR:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to update project: ${error.message}`,
          });
        }

        console.log('✅ PROJECT UPDATED:', project);
        return project;

      } catch (error) {
        console.error('❌ UPDATE PROJECT VIDEO ERROR:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update project video: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  // ADD THIS: Get project video progress
  getProjectProgress: publicProcedure
    .input(z.object({
      projectId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { data: project, error } = await ctx.supabase
          .from('projects')
          .select('id, title, video_status, video_url, video_job_id, updated_at')
          .eq('id', input.projectId)
          .single();

        if (error) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Project not found: ${error.message}`,
          });
        }

        return {
          projectId: project.id,
          title: project.title,
          status: project.video_status || 'pending',
          videoUrl: project.video_url,
          jobId: project.video_job_id,
          lastUpdated: project.updated_at,
        };

      } catch (error) {
        console.error('❌ GET PROJECT PROGRESS ERROR:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get project progress: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  // ADD THIS: Get project video segments
  getProjectSegments: publicProcedure
    .input(z.object({
      projectId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { data: segments, error } = await ctx.supabase
          .from('video_segments')
          .select('*')
          .eq('project_id', input.projectId)
          .order('segment_order');

        if (error) {
          console.error('❌ GET SEGMENTS ERROR:', error);
          return [];
        }

        return segments || [];

      } catch (error) {
        console.error('❌ GET PROJECT SEGMENTS ERROR:', error);
        return [];
      }
    }),
});
