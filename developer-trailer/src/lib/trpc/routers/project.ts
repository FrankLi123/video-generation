import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';

export const projectRouter = createTRPCRouter({
  // 创建新项目
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        personalPhotoUrl: z.string().url().optional(),
        productImages: z.array(z.string().url()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: project, error } = await ctx.supabase
        .from('projects')
        .insert({
          user_id: ctx.userId!,
          title: input.title,
          description: input.description,
          personal_photo_url: input.personalPhotoUrl,
          product_images: input.productImages,
          status: 'draft',
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create project: ${error.message}`);
      }

      return project;
    }),

  // 获取用户的所有项目
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data: projects, error } = await ctx.supabase
      .from('projects')
      .select('*')
      .eq('user_id', ctx.userId!)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    return projects || [];
  }),

  // 获取单个项目详情
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data: project, error: projectError } = await ctx.supabase
        .from('projects')
        .select('*')
        .eq('id', input.id)
        .eq('user_id', ctx.userId!)
        .single();

      if (projectError) {
        throw new Error('Project not found');
      }

      // 获取项目的视频片段
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

  // 更新项目状态
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

  // 删除项目
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('projects')
        .delete()
        .eq('id', input.id)
        .eq('user_id', ctx.userId!);

      if (error) {
        throw new Error(`Failed to delete project: ${error.message}`);
      }

      return { success: true };
    }),
}); 