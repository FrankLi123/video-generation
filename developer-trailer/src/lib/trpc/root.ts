import { createTRPCRouter } from '@/lib/trpc/server';
import { userRouter } from './routers/user';
import { projectRouter } from './routers/project';

/**
 * 应用程序的主要路由器
 * 
 * 如果你想添加新的路由器，请在这里导入并添加到appRouter中
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  project: projectRouter,
});

// 导出类型定义 - 客户端需要使用
export type AppRouter = typeof appRouter; 