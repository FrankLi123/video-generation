import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const createTRPCContext = async () => {
  const supabase = await createClient();
  
  // 获取用户ID（如果已认证）
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  return {
    userId,
    db,
    supabase,
  };
};

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      userId: ctx.userId,
      db: ctx.db,
      supabase: ctx.supabase,
    },
  });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed); 