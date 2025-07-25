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
        // 使用 fal.ai Seedance 客户端
        const { generateVideo } = await import('@/lib/ai/veo-fal');

        const result = await generateVideo({
          prompt: input.prompt,
          model: 'seedance', // Force Seedance only
          aspectRatio: input.aspectRatio,
          resolution: input.resolution,
          duration: input.duration,
          seed: input.seed,
          cameraFixed: input.cameraFixed,
        });

        console.log('✅ FAL.AI SEEDANCE RESULT:', result);

        return {
          success: true,
          jobId: result.jobId,
          model: 'seedance',
          message: 'fal.ai Seedance video generation started',
        };

      } catch (error) {
        console.error('❌ FAL.AI SEEDANCE ERROR:', error);
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
        const { getVideoJobStatus } = await import('@/lib/ai/veo-fal');
        const status = await getVideoJobStatus(input.jobId);

        console.log('✅ FAL.AI SEEDANCE STATUS:', status);

        return {
          success: true,
          ...status,
        };

      } catch (error) {
        console.error('❌ FAL.AI SEEDANCE STATUS ERROR:', error);
        return {
          success: false,
          status: 'error',
          message: `Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }),
});
