import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../server';
import { TRPCError } from '@trpc/server';

export const scriptRouter = createTRPCRouter({
  // AI-powered script generation using OpenAI
  generateScript: publicProcedure
    .input(z.object({
      projectId: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      console.log('🤖 OpenAI script generation called with input:', input);
      const { projectId, title, description } = input;

      try {
        // Use the existing OpenAI function for script generation
        console.log('🤖 Using OpenAI service for script generation...');

        const { generateSimpleVideoPrompt } = await import('@/lib/ai/openai');

        const script = await generateSimpleVideoPrompt(description);

        console.log('✅ Generated AI script:', script);

        return {
          success: true,
          script,
          message: 'AI script generated successfully',
        };

      } catch (error) {
        console.error('❌ Error in OpenAI script generation:', error);

        // Fallback to simple template if OpenAI fails
        const fallbackScript = `${description}`;
        console.log('🔄 Using fallback script due to error:', fallbackScript);

        return {
          success: true,
          script: fallbackScript,
          message: 'Fallback script generated (OpenAI error)',
        };
      }
    }),
});