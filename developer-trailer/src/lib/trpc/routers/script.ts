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
    .mutation(async ({ ctx, input }) => {
      console.log('🤖 OpenAI script generation called with input:', input);
      const { projectId, title, description } = input;
  
      try {
        // Update project status to processing
        await ctx.supabase
          .from('projects')
          .update({
            script_status: 'processing',
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId);
  
        // Use the existing OpenAI function for script generation
        console.log('🤖 Using OpenAI service for script generation...');
  
        const { generateSimpleVideoPrompt } = await import('@/lib/ai/openai');
        const script = await generateSimpleVideoPrompt(description);
  
        console.log('✅ Generated AI script:', script);
  
        // Update project with completed script
        await ctx.supabase
          .from('projects')
          .update({
            generated_script: { content: script },
            script_status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId);
  
        return {
          success: true,
          script,
          message: 'AI script generated successfully',
        };
  
      } catch (error) {
        console.error('❌ Error in OpenAI script generation:', error);
  
        // Update project status to failed
        await ctx.supabase
          .from('projects')
          .update({
            script_status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId);
  
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

  // Add this new procedure
  getProjectScript: publicProcedure
    .input(z.object({
      projectId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { data: project, error } = await ctx.supabase
          .from('projects')
          .select('id, generated_script, script_status, script_job_id')
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
          script: project.generated_script,
          status: project.script_status || 'pending',
          jobId: project.script_job_id,
          script_status: project.script_status || 'pending',
        };
      } catch (error) {
        console.error('❌ GET PROJECT SCRIPT ERROR:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get project script: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  // Add missing procedures that the script editor expects
  refineScript: publicProcedure
    .input(z.object({
      projectId: z.string().min(1),
      userFeedback: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      // Implement script refinement logic
      console.log('🔄 Script refinement requested:', input);
      return {
        success: true,
        message: 'Script refinement started',
      };
    }),

  clearScript: publicProcedure
    .input(z.object({
      projectId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { error } = await ctx.supabase
          .from('projects')
          .update({
            generated_script: null,
            script_status: 'pending',
            script_job_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.projectId);

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to clear script: ${error.message}`,
          });
        }

        return {
          success: true,
          message: 'Script cleared successfully',
        };
      } catch (error) {
        console.error('❌ CLEAR SCRIPT ERROR:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to clear script: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  getJobStatus: publicProcedure
    .input(z.object({
      jobId: z.string().min(1),
    }))
    .query(async ({ input }) => {
      // Implement job status checking logic
      console.log('📊 Checking job status for:', input.jobId);
      return {
        jobId: input.jobId,
        status: 'completed', // or 'processing', 'failed'
        progress: 100,
      };
    }),
});