-- Milestone 4: Video Generation Core
-- Database schema updates for video generation functionality

-- Ensure video generation fields exist in projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS video_job_id VARCHAR(255);

-- Update video_jobs table structure if needed
ALTER TABLE video_jobs 
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Update video_segments table structure
ALTER TABLE video_segments 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create indexes for video generation performance
CREATE INDEX IF NOT EXISTS video_jobs_project_status_idx ON video_jobs(project_id, status);
CREATE INDEX IF NOT EXISTS video_jobs_job_type_idx ON video_jobs(job_type);
CREATE INDEX IF NOT EXISTS video_segments_project_order_idx ON video_segments(project_id, segment_order);
CREATE INDEX IF NOT EXISTS projects_video_status_idx ON projects(video_status);

-- Add RLS policies for video_segments if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'video_segments' 
        AND policyname = 'Users can view segments for own projects'
    ) THEN
        CREATE POLICY "Users can view segments for own projects" ON video_segments
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM projects 
                WHERE projects.id = video_segments.project_id 
                AND projects.user_id = auth.uid()
            )
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'video_segments' 
        AND policyname = 'Users can create segments for own projects'
    ) THEN
        CREATE POLICY "Users can create segments for own projects" ON video_segments
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM projects 
                WHERE projects.id = video_segments.project_id 
                AND projects.user_id = auth.uid()
            )
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'video_segments' 
        AND policyname = 'Users can update segments for own projects'
    ) THEN
        CREATE POLICY "Users can update segments for own projects" ON video_segments
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM projects 
                WHERE projects.id = video_segments.project_id 
                AND projects.user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- Add RLS policies for video_jobs if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'video_jobs' 
        AND policyname = 'Users can view jobs for own projects'
    ) THEN
        CREATE POLICY "Users can view jobs for own projects" ON video_jobs
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM projects 
                WHERE projects.id = video_jobs.project_id 
                AND projects.user_id = auth.uid()
            )
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'video_jobs' 
        AND policyname = 'Users can create jobs for own projects'
    ) THEN
        CREATE POLICY "Users can create jobs for own projects" ON video_jobs
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM projects 
                WHERE projects.id = video_jobs.project_id 
                AND projects.user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_video_jobs_updated_at ON video_jobs;
CREATE TRIGGER update_video_jobs_updated_at
    BEFORE UPDATE ON video_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_video_segments_updated_at ON video_segments;
CREATE TRIGGER update_video_segments_updated_at
    BEFORE UPDATE ON video_segments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some test data for development (optional)
-- This will only run if there are no existing video jobs
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM video_jobs LIMIT 1) THEN
        -- This is just for testing, remove in production
        INSERT INTO video_jobs (project_id, user_id, job_id, job_type, status, input_data, progress)
        SELECT 
            p.id,
            p.user_id,
            'test_job_' || p.id,
            'segment',
            'pending',
            '{"test": true}',
            0
        FROM projects p
        WHERE p.script_status = 'completed'
        LIMIT 1;
    END IF;
END $$;

-- Create a view for project video progress (optional, for easier querying)
CREATE OR REPLACE VIEW project_video_progress AS
SELECT 
    p.id as project_id,
    p.title,
    p.video_status,
    COUNT(vs.id) as total_segments,
    COUNT(CASE WHEN vs.status = 'completed' THEN 1 END) as completed_segments,
    COUNT(CASE WHEN vs.status = 'failed' THEN 1 END) as failed_segments,
    COUNT(CASE WHEN vs.status = 'processing' THEN 1 END) as processing_segments,
    CASE 
        WHEN COUNT(vs.id) = 0 THEN 0
        ELSE ROUND((COUNT(CASE WHEN vs.status = 'completed' THEN 1 END) * 100.0) / COUNT(vs.id))
    END as progress_percentage
FROM projects p
LEFT JOIN video_segments vs ON p.id = vs.project_id
WHERE p.video_status IS NOT NULL
GROUP BY p.id, p.title, p.video_status;

-- Grant necessary permissions
GRANT SELECT ON project_video_progress TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE video_jobs IS 'Tracks video generation jobs in the queue system';
COMMENT ON TABLE video_segments IS 'Individual video segments that make up a complete project video';
COMMENT ON VIEW project_video_progress IS 'Aggregated view of video generation progress for each project';

-- Verify the schema
SELECT 
    'video_jobs' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'video_jobs' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'video_segments' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'video_segments' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
