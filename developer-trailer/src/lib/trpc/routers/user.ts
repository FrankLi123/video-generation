import { z } from 'zod';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/lib/trpc/server';

export const userRouter = createTRPCRouter({
  // 获取当前用户信息
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const { data: user } = await ctx.supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not found');
    }

    // 从Supabase获取用户详细信息
    const { data: profile, error } = await ctx.supabase
      .from('users')
      .select('*')
      .eq('id', user.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }

    return {
      id: user.user.id,
      email: user.user.email,
      createdAt: user.user.created_at,
      ...profile,
    };
  }),

  // 获取用户统计信息
  getStats: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      return {
        totalUsers: 0,
        totalProjects: 0,
        totalVideosGenerated: 0,
        totalCreditsUsed: 0,
      };
    }

    // 获取用户信息
    const { data: user, error: userError } = await ctx.supabase
      .from('users')
      .select('*')
      .eq('id', ctx.userId)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('Error fetching user:', userError);
      return {
        totalUsers: 0,
        totalProjects: 0,
        totalVideosGenerated: 0,
        totalCreditsUsed: 0,
      };
    }

    if (!user) {
      return {
        totalUsers: 0,
        totalProjects: 0,
        totalVideosGenerated: 0,
        totalCreditsUsed: 0,
      };
    }

    // 获取用户的使用日志
    const { data: userLogs, error: logsError } = await ctx.supabase
      .from('usage_logs')
      .select('*')
      .eq('user_id', ctx.userId)
      .order('created_at', { ascending: false });

    if (logsError) {
      console.error('Error fetching usage logs:', logsError);
      return {
        totalUsers: 1,
        totalProjects: 0,
        totalVideosGenerated: 0,
        totalCreditsUsed: 0,
      };
    }

    // 计算总积分使用量
    const totalCreditsUsed = (userLogs || []).reduce((sum, log) => sum + (log.cost_credits ?? 0), 0);

    return {
      totalUsers: 1, // 当前用户
      totalProjects: userLogs?.length ?? 0,
      totalVideosGenerated: (userLogs || []).filter(log => log.action === 'video-generation').length,
      totalCreditsUsed,
    };
  }),

  // 更新用户信息
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        avatarUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: user } = await ctx.supabase.auth.getUser();
      if (!user.user) {
      throw new Error('User not found');
    }

      // 更新用户信息
      const { error } = await ctx.supabase
        .from('users')
        .upsert({
          id: user.user.id,
          name: input.name,
          avatar_url: input.avatarUrl,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      return { success: true };
  }),
}); 