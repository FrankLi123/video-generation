import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.SUPABASE_SERVICE_ROLE_KEY 
      ? `postgresql://postgres.${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0]}:${process.env.SUPABASE_SERVICE_ROLE_KEY}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`
      : 'postgresql://localhost:5432/dev',
  },
} satisfies Config; 