-- Milestone 3 Database Migration
-- Add missing columns for script generation features

-- Add script generation columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS generated_script JSONB,
ADD COLUMN IF NOT EXISTS script_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS script_job_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS script_generation_params JSONB;

-- Add video generation columns to projects table (for future milestones)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS video_job_id VARCHAR(255);

-- Create video_jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS video_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  job_id VARCHAR(255) NOT NULL,
  job_type VARCHAR(50) NOT NULL,
  input_data JSONB NOT NULL,
  result_data JSONB,
  error_message TEXT,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create usage_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create video_segments table if it doesn't exist
CREATE TABLE IF NOT EXISTS video_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  segment_order INTEGER NOT NULL,
  start_time INTEGER NOT NULL,
  end_time INTEGER NOT NULL,
  segment_type VARCHAR(50) NOT NULL,
  content_url TEXT,
  text_overlay TEXT,
  voiceover_text TEXT,
  transition_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Display migration status
SELECT 'Migration completed successfully!' as message; 