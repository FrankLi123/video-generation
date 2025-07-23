-- Milestone 3: AI Script Generation Engine
-- Add script generation fields to projects table

-- Add script generation fields to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS generated_script JSONB,
ADD COLUMN IF NOT EXISTS script_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS script_job_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS script_generation_params JSONB,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS video_job_id VARCHAR(255);

-- Create video_jobs table for tracking generation jobs
CREATE TABLE IF NOT EXISTS video_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  job_id VARCHAR(255) NOT NULL, -- BullMQ job ID
  job_type VARCHAR(50) NOT NULL, -- script, video, etc.
  input_data JSONB NOT NULL,
  result_data JSONB,
  error_message TEXT,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for video_jobs table
CREATE INDEX IF NOT EXISTS video_jobs_project_id_idx ON video_jobs(project_id);
CREATE INDEX IF NOT EXISTS video_jobs_user_id_idx ON video_jobs(user_id);
CREATE INDEX IF NOT EXISTS video_jobs_status_idx ON video_jobs(status);
CREATE INDEX IF NOT EXISTS video_jobs_job_type_idx ON video_jobs(job_type);
CREATE INDEX IF NOT EXISTS video_jobs_created_at_idx ON video_jobs(created_at);

-- Update usage_logs table to track script generation usage
ALTER TABLE usage_logs 
ALTER COLUMN action TYPE VARCHAR(100);

-- Create video_segments table for detailed video composition
CREATE TABLE IF NOT EXISTS video_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  segment_order INTEGER NOT NULL,
  start_time INTEGER NOT NULL, -- seconds
  end_time INTEGER NOT NULL, -- seconds
  segment_type VARCHAR(50) NOT NULL, -- intro, product_demo, outro, etc.
  content_url TEXT, -- image/video URL
  text_overlay TEXT,
  voiceover_text TEXT,
  transition_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for video_segments table
CREATE INDEX IF NOT EXISTS video_segments_project_id_idx ON video_segments(project_id);
CREATE INDEX IF NOT EXISTS video_segments_order_idx ON video_segments(project_id, segment_order);

-- Create indexes on projects for script-related fields
CREATE INDEX IF NOT EXISTS projects_script_status_idx ON projects(script_status);
CREATE INDEX IF NOT EXISTS projects_video_status_idx ON projects(video_status);

-- Add updated_at trigger for video_jobs table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_video_jobs_updated_at 
  BEFORE UPDATE ON video_jobs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
-- INSERT INTO usage_logs (user_id, action, credits_used, metadata)
-- SELECT 
--   id,
--   'script_generation',
--   1,
--   '{"test": true}'
-- FROM users 
-- LIMIT 1; 