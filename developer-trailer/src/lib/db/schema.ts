import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table - 用户基础信息
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  plan: varchar('plan', { length: 50 }).default('free'),
  credits: integer('credits').default(1),
  emailVerified: timestamp('email_verified'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    emailIdx: index('users_email_idx').on(table.email),
  };
});

// Projects table - 视频项目
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  personalPhotoUrl: text('personal_photo_url'),
  productImages: jsonb('product_images').default([]),
  status: varchar('status', { length: 50 }).default('draft'), // draft, processing, completed, failed
  videoUrl: text('video_url'),
  script: jsonb('script'), // AI生成的脚本内容
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('projects_user_id_idx').on(table.userId),
    statusIdx: index('projects_status_idx').on(table.status),
  };
});

// Jobs table - 异步任务队列
export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // script-generation, video-generation, video-processing
  status: varchar('status', { length: 50 }).default('pending'), // pending, processing, completed, failed
  priority: integer('priority').default(0), // 0=normal, 1=high, -1=low
  inputData: jsonb('input_data'), // 任务输入数据
  outputData: jsonb('output_data'), // 任务输出结果
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0),
  maxRetries: integer('max_retries').default(3),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    projectIdIdx: index('jobs_project_id_idx').on(table.projectId),
    statusIdx: index('jobs_status_idx').on(table.status),
    typeIdx: index('jobs_type_idx').on(table.type),
  };
});

// Usage logs table - 使用量记录
export const usageLogs = pgTable('usage_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 50 }).notNull(), // script-generation, video-generation, download
  costCredits: integer('cost_credits').default(1),
  metadata: jsonb('metadata'), // 额外信息如视频时长、质量等
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('usage_logs_user_id_idx').on(table.userId),
    actionIdx: index('usage_logs_action_idx').on(table.action),
    createdAtIdx: index('usage_logs_created_at_idx').on(table.createdAt),
  };
});

// Video segments table - 视频片段
export const videoSegments = pgTable('video_segments', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  segmentIndex: integer('segment_index').notNull(),
  scriptText: text('script_text').notNull(),
  visualPrompt: text('visual_prompt').notNull(),
  status: varchar('status', { length: 50 }).default('pending'), // pending, generating, completed, failed
  videoUrl: text('video_url'),
  duration: integer('duration'), // 秒数
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    projectIdIdx: index('video_segments_project_id_idx').on(table.projectId),
    statusIdx: index('video_segments_status_idx').on(table.status),
  };
});

// Relations - 定义表关系
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  usageLogs: many(usageLogs),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  jobs: many(jobs),
  usageLogs: many(usageLogs),
  videoSegments: many(videoSegments),
}));

export const jobsRelations = relations(jobs, ({ one }) => ({
  project: one(projects, {
    fields: [jobs.projectId],
    references: [projects.id],
  }),
}));

export const usageLogsRelations = relations(usageLogs, ({ one }) => ({
  user: one(users, {
    fields: [usageLogs.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [usageLogs.projectId],
    references: [projects.id],
  }),
}));

export const videoSegmentsRelations = relations(videoSegments, ({ one }) => ({
  project: one(projects, {
    fields: [videoSegments.projectId],
    references: [projects.id],
  }),
}));

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type UsageLog = typeof usageLogs.$inferSelect;
export type NewUsageLog = typeof usageLogs.$inferInsert;
export type VideoSegment = typeof videoSegments.$inferSelect;
export type NewVideoSegment = typeof videoSegments.$inferInsert; 