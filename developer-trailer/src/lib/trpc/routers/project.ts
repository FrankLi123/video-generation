import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/lib/trpc/server';

export const projectRouter = createTRPCRouter({
  // Test endpoint
  test: publicProcedure.query(async ({ ctx }) => {
    console.log('Test endpoint called');
    console.log('Supabase client:', !!ctx.supabase);
    console.log('Environment variables:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
    
    try {
      const { data, error } = await ctx.supabase.from('projects').select('count').limit(1);
      console.log('Database test result:', { data, error });
      return { 
        message: 'Test endpoint working',
        supabase: !!ctx.supabase,
        envVars: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        dbTest: { data, error }
      };
    } catch (error) {
      console.error('Database test error:', error);
      return { 
        message: 'Test endpoint working but DB error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }),

  // Simple test mutation
  testMutation: publicProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ input }) => {
      console.log('Test mutation called with:', input);
      return { success: true, message: input.message };
    }),

  // Create new project
  createProject: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        personalPhotoUrl: z.string().url().optional().nullable(),
        productImages: z.array(z.string().url()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log('Raw input received:', JSON.stringify(input, null, 2));
      console.log('Input type:', typeof input);
      console.log('Input keys:', Object.keys(input || {}));
      console.log('Title value:', input?.title);
      console.log('Description value:', input?.description);
      
      try {
        console.log('Input data:', input);
        console.log('Context supabase client:', !!ctx.supabase);
        
        // Use the test user ID that we created in the database
        const testUserId = '550e8400-e29b-41d4-a716-446655440000';
        
        console.log('Creating project with data:', {
          user_id: testUserId,
          title: input.title,
          description: input.description,
          personal_photo_url: input.personalPhotoUrl,
          product_images: input.productImages,
        });
        
        // Test database connection first
        console.log('Testing database connection...');
        const { data: testData, error: testError } = await ctx.supabase
          .from('projects')
          .select('count')
          .limit(1);
        
        if (testError) {
          console.error('Database connection test failed:', testError);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Database connection failed: ${testError.message}`,
          });
        }
        
        console.log('Database connection test passed');
        
        // Create project with valid UUID
        console.log('Inserting project into database...');
        const { data: project, error } = await ctx.supabase
          .from('projects')
          .insert({
            user_id: testUserId,
            title: input.title,
            description: input.description,
            personal_photo_url: input.personalPhotoUrl,
            product_images: input.productImages,
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error('Create project database error:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to create project: ${error.message}`,
            cause: error,
          });
        }

        console.log('Project created successfully:', project);
        console.log('=== CREATE PROJECT END ===');
        return project;
      } catch (error) {
        console.error('=== CREATE PROJECT ERROR ===');
        console.error('Error type:', typeof error);
        console.error('Error message:', error instanceof Error ? error.message : error);
        console.error('Full error:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create project',
          cause: error,
        });
      }
    }),

  // Get all projects - simplified for testing
  getProjects: publicProcedure.query(async ({ ctx }) => {
    try {
      console.log('Fetching projects...');
      const { data: projects, error } = await ctx.supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch projects: ${error.message}`,
        });
      }

      console.log('Projects fetched successfully:', projects?.length || 0);
      return projects || [];
    } catch (error) {
      console.error('getProjects error:', error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch projects',
      });
    }
  }),



  // Get single project details
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      console.log('getById called with id:', input.id);
      const { data: project, error: projectError } = await ctx.supabase
        .from('projects')
        .select('*')
        .eq('id', input.id)
        .single();

      if (projectError) {
        console.error('Supabase getById error:', projectError);
        throw new Error('Project not found');
      }

      // Get project video segments
      const { data: segments, error: segmentsError } = await ctx.supabase
        .from('video_segments')
        .select('*')
        .eq('project_id', input.id)
        .order('segment_index', { ascending: true });

      if (segmentsError) {
        console.error('Error fetching segments:', segmentsError);
      }

      return {
        ...project,
        segments: segments || [],
      };
    }),

  // Update project status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['pending', 'processing', 'completed', 'failed']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: project, error } = await ctx.supabase
        .from('projects')
        .update({
          status: input.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('user_id', ctx.userId!)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update project: ${error.message}`);
      }

      return project;
    }),

  // Delete project
  deleteProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('projects')
        .delete()
        .eq('id', input.projectId)
        .eq('user_id', ctx.userId!);

      if (error) {
        throw new Error(`Failed to delete project: ${error.message}`);
      }

      return { success: true };
    }),


}); 