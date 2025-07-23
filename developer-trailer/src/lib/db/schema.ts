import {
  pgTable,
  text,
  timestamp,
  json,
  varchar,
  uuid,
  boolean,
  primaryKey,
  integer,
} from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Projects table
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  personal_photo_url: text('personal_photo_url'),
  product_images: json('product_images').$type<string[]>().notNull().default([]),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  
  // Script generation fields
  generated_script: json('generated_script').$type<{
    title: string;
    script: string;
    scenes: Array<{
      id: string;
      startTime: number;
      endTime: number;
      description: string;
      voiceover: string;
      visualElements: string[];
      transition?: string;
    }>;
    duration: number;
    voiceover: string;
    visualCues: string[];
  }>(),
  script_status: varchar('script_status', { length: 50 }).default('pending'), // pending, processing, completed, failed
  script_job_id: varchar('script_job_id', { length: 255 }),
  script_generation_params: json('script_generation_params').$type<{
    targetAudience?: string;
    keyFeatures?: string[];
    tone?: 'professional' | 'casual' | 'energetic' | 'friendly';
    duration?: number;
  }>(),
  
  // Video generation fields (for future milestones)
  video_url: text('video_url'),
  video_status: varchar('video_status', { length: 50 }).default('pending'), // pending, processing, completed, failed
  video_job_id: varchar('video_job_id', { length: 255 }),
  
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Video generation jobs table
export const video_jobs = pgTable('video_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  project_id: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  job_id: varchar('job_id', { length: 255 }).notNull(), // BullMQ job ID
  job_type: varchar('job_type', { length: 50 }).notNull(), // script, video, etc.
  input_data: json('input_data').notNull(),
  result_data: json('result_data'),
  error_message: text('error_message'),
  progress: integer('progress').default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Usage logs table
export const usage_logs = pgTable('usage_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  project_id: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(), // script_generation, video_generation, etc.
  credits_used: integer('credits_used').notNull().default(1),
  metadata: json('metadata'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Video segments table (for detailed video composition)
export const video_segments = pgTable('video_segments', {
  id: uuid('id').primaryKey().defaultRandom(),
  project_id: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  segment_order: integer('segment_order').notNull(),
  start_time: integer('start_time').notNull(), // seconds
  end_time: integer('end_time').notNull(), // seconds
  segment_type: varchar('segment_type', { length: 50 }).notNull(), // intro, product_demo, outro, etc.
  content_url: text('content_url'), // image/video URL
  text_overlay: text('text_overlay'),
  voiceover_text: text('voiceover_text'),
  transition_type: varchar('transition_type', { length: 50 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type VideoJob = typeof video_jobs.$inferSelect;
export type NewVideoJob = typeof video_jobs.$inferInsert;

export type UsageLog = typeof usage_logs.$inferSelect;
export type NewUsageLog = typeof usage_logs.$inferInsert;

export type VideoSegment = typeof video_segments.$inferSelect;
export type NewVideoSegment = typeof video_segments.$inferInsert; 