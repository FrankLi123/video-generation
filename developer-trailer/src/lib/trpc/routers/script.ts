import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../server';
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
  generateScript: protectedProcedure
    .input(scriptGenerationSchema)
    .mutation(async ({ ctx, input }) => {
      const { projectId, targetAudience, keyFeatures, tone, duration } = input;
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
            message: 'You do not have permission to generate scripts for this project',
          });
        }

        // Check if script generation is already in progress
        if (project.script_status === 'processing') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Script generation is already in progress',
          });
        }

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

        // Update project status to processing
        await ctx.db
          .update(projects)
          .set({
            script_status: 'processing',
            script_generation_params: {
              targetAudience,
              keyFeatures,
              tone,
              duration,
            },
            updated_at: new Date(),
          })
          .where(eq(projects.id, projectId));

        // Add job to queue
        const job = await addScriptGenerationJob(projectId, userId, scriptInput);

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
          message: 'Script generation started',
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
          message: 'Failed to start script generation',
          cause: error,
        });
      }
    }),

  // Refine an existing script
  refineScript: protectedProcedure
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
  getJobStatus: protectedProcedure
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
  getProjectScript: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { projectId } = input;
      const userId = ctx.userId;

      if (!ctx.db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database connection not available',
        });
      }

      try {
        const [project] = await ctx.db
          .select({
            id: projects.id,
            user_id: projects.user_id,
            generated_script: projects.generated_script,
            script_status: projects.script_status,
            script_job_id: projects.script_job_id,
            script_generation_params: projects.script_generation_params,
          })
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
            message: 'You do not have permission to view this project script',
          });
        }

        return {
          projectId: project.id,
          script: project.generated_script,
          status: project.script_status,
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
          cause: error,
        });
      }
    }),

  // Clear script (reset to allow regeneration)
  clearScript: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { projectId } = input;
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
            message: 'You do not have permission to clear this project script',
          });
        }

        // Clear script data
        await ctx.db
          .update(projects)
          .set({
            generated_script: null,
            script_status: 'pending',
            script_job_id: null,
            script_generation_params: null,
            updated_at: new Date(),
          })
          .where(eq(projects.id, projectId));

        return {
          success: true,
          message: 'Script cleared successfully',
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to clear script',
          cause: error,
        });
      }
    }),
}); 