import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 从环境变量获取数据库连接字符串
const getDatabaseUrl = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Missing Supabase URL or Service Role Key for direct database access');
    return null;
  }

  try {
    // 解析Supabase URL获取项目引用
    const url = new URL(supabaseUrl);
    const projectRef = url.hostname.split('.')[0];
    
    // 构建PostgreSQL连接字符串
    return `postgresql://postgres.${projectRef}:${serviceRoleKey}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;
  } catch (error) {
    console.error('Error building database URL:', error);
    return null;
  }
};

// 创建数据库连接
const databaseUrl = getDatabaseUrl();
const client = databaseUrl ? postgres(databaseUrl, {
  prepare: false, // 对于Supabase connection pooling
  max: 1, // 限制连接数
}) : null;

// 创建Drizzle数据库实例
export const db = client ? drizzle(client, { schema }) : null;

// 导出类型
export type Database = typeof db;
export * from './schema'; 