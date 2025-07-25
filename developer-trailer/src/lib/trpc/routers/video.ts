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
});
