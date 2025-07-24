import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../server';
import { generateScript as generateScriptWithAI } from '@/lib/ai/openai';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { addScriptGenerationJob, addScriptRefinementJob, getJobStatus } from '@/lib/queue/script-queue';
import { TRPCError } from '@trpc/server';

// Input validation schemas
const scriptGenerationSchema = z.object({
  projectId: z.string().uuid(),
  targetAudience: z.string().optional(),
  keyFeatures: z.array(z.string()).optional(),
  tone: z.enum(['professional', 'casual', 'energetic', 'friendly']).optional(),
  duration: z.number().min(15).max(60).optional(),
});

const scriptRefinementSchema = z.object({
  projectId: z.string().uuid(),
  userFeedback: z.string().min(1, 'Feedback is required'),
});

const jobStatusSchema = z.object({
  jobId: z.string(),
});

export const scriptRouter = createTRPCRouter({
  // Generate a new script for a project
  generateScript: publicProcedure
    .input(scriptGenerationSchema)
    .mutation(async ({ ctx, input }) => {
      console.log('🚀 generateScript called with input:', input);
      const { projectId, targetAudience, keyFeatures, tone, duration } = input;

      try {
        console.log('📊 Fetching project from database:', projectId);
        // Get project details from Supabase
        const { data: project, error: projectError } = await ctx.supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (projectError || !project) {
          console.error('❌ Project not found:', projectError);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Project not found',
          });
        }

        console.log('✅ Project found:', {
          title: project.title,
          description: project.description,
          hasPersonalPhoto: !!project.personal_photo_url,
          productImagesCount: Array.isArray(project.product_images) ? project.product_images.length : 0
        });

        // Set status to processing
        console.log('📝 Setting project status to processing...');
        await ctx.supabase
          .from('projects')
          .update({
            script_status: 'processing',
            script_generation_params: {
              targetAudience,
              keyFeatures,
              tone,
              duration,
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId);

        // Prepare script generation input
        const scriptInput = {
          projectTitle: project.title,
          projectDescription: project.description,
          personalPhotoUrl: project.personal_photo_url || undefined,
          productImages: Array.isArray(project.product_images) ? project.product_images : [],
          targetAudience,
          keyFeatures,
          tone,
          duration,
        };

        console.log('🤖 Calling OpenAI with script input:', scriptInput);

        // Generate script directly with OpenAI
        const generatedScript = await generateScriptWithAI(scriptInput);

        console.log('✨ OpenAI response received:', generatedScript);

        // Update project with generated script
        await ctx.supabase
          .from('projects')
          .update({
            generated_script: generatedScript,
            script_status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId);

        return {
          success: true,
          script: generatedScript,
          message: 'Script generated successfully',
        };
      } catch (error) {
        // Set status to failed on error
        await ctx.supabase
          .from('projects')
          .update({
            script_status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId);

        console.error('Script generation error:', error);
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to generate script',
        });
      }
    }),

  // Refine an existing script
  refineScript: publicProcedure
    .input(scriptRefinementSchema)
    .mutation(async ({ ctx, input }) => {
      const { projectId, userFeedback } = input;
      const userId = ctx.userId;

      if (!ctx.db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database connection not available',
        });
      }

      try {
        // Get project details
        const [project] = await ctx.db
          .select()
          .from(projects)
          .where(eq(projects.id, projectId))
          .limit(1);

        if (!project) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Project not found',
          });
        }

        // Verify ownership
        if (project.user_id !== userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to refine scripts for this project',
          });
        }

        // Check if project has a generated script
        if (!project.generated_script) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'No script to refine. Generate a script first.',
          });
        }

        // Check if refinement is already in progress
        if (project.script_status === 'processing') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Script refinement is already in progress',
          });
        }

        // Update project status to processing
        await ctx.db
          .update(projects)
          .set({
            script_status: 'processing',
            updated_at: new Date(),
          })
          .where(eq(projects.id, projectId));

        // Add refinement job to queue
        const job = await addScriptRefinementJob(
          projectId,
          userId,
          project.generated_script,
          userFeedback
        );

        // Update project with job ID
        await ctx.db
          .update(projects)
          .set({
            script_job_id: job.id,
            updated_at: new Date(),
          })
          .where(eq(projects.id, projectId));

        return {
          success: true,
          jobId: job.id,
          message: 'Script refinement started',
        };
      } catch (error) {
        // Reset project status on error
        await ctx.db
          .update(projects)
          .set({
            script_status: 'failed',
            updated_at: new Date(),
          })
          .where(eq(projects.id, projectId));

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to start script refinement',
          cause: error,
        });
      }
    }),

  // Get job status
  getJobStatus: publicProcedure
    .input(jobStatusSchema)
    .query(async ({ input }) => {
      const { jobId } = input;

      try {
        const jobStatus = await getJobStatus(jobId);
        return jobStatus;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get job status',
          cause: error,
        });
      }
    }),

  // Get project script
  getProjectScript: publicProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { projectId } = input;

      try {
        const { data: project, error } = await ctx.supabase
          .from('projects')
          .select('id, generated_script, script_status, script_job_id, script_generation_params')
          .eq('id', projectId)
          .single();

        if (error) {
          console.error('Supabase error in getProjectScript:', error);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Project not found',
          });
        }
        
        if (!project) {
          console.error('No project found for id:', projectId);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Project not found',
          });
        }

        // If the script is not generated yet, return pending status
        return {
          projectId: project.id,
          script: project.generated_script,
          status: project.generated_script ? project.script_status : 'pending',
          jobId: project.script_job_id,
          generationParams: project.script_generation_params,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get project script',
        });
      }
    }),

  // Clear script (reset to allow regeneration)
  clearScript: publicProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { projectId } = input;
      try {
        console.log('clearScript called for projectId:', projectId);
        // Get project details
        const { data: project, error: projectError } = await ctx.supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();
        if (projectError || !project) {
          console.error('Project not found or error:', projectError);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Project not found',
          });
        }
        // Clear script data
        const { error: updateError } = await ctx.supabase
          .from('projects')
          .update({
            generated_script: null,
            script_status: 'pending',
            script_job_id: null,
            script_generation_params: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId);
        if (updateError) {
          console.error('Error updating project:', updateError);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to clear script',
          });
        }
        return {
          success: true,
          message: 'Script cleared successfully',
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Unexpected error in clearScript:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to clear script',
          cause: error,
        });
      }
    }),
}); 