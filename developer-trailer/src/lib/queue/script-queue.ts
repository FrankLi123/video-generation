import { Queue, Worker, Job } from 'bullmq';
import { createBullMQConnection } from './redis';
import { generateScript, refineScript, type ScriptGenerationInput, type GeneratedScript } from '../ai/openai';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Job data types
export interface ScriptGenerationJobData {
  projectId: string;
  userId: string;
  input: ScriptGenerationInput;
  jobType: 'generate' | 'refine';
  originalScript?: GeneratedScript;
  userFeedback?: string;
}

export interface ScriptJobResult {
  success: boolean;
  script?: GeneratedScript;
  error?: string;
}

// Queue configuration
const QUEUE_NAME = 'script-generation';
const REDIS_CONNECTION = createBullMQConnection();

// Create the queue
export const scriptQueue = new Queue<ScriptGenerationJobData, ScriptJobResult>(
  QUEUE_NAME, 
  {
    connection: REDIS_CONNECTION,
    defaultJobOptions: {
      removeOnComplete: 50, // Keep last 50 completed jobs
      removeOnFail: 20, // Keep last 20 failed jobs
      attempts: 3, // Retry up to 3 times
      backoff: {
        type: 'exponential',
        delay: 5000, // Start with 5 second delay
      },
    },
  }
);

// Add script generation job
export async function addScriptGenerationJob(
  projectId: string,
  userId: string,
  input: ScriptGenerationInput,
  priority: number = 0
): Promise<Job<ScriptGenerationJobData, ScriptJobResult>> {
  return await scriptQueue.add(
    'generate-script',
    {
      projectId,
      userId,
      input,
      jobType: 'generate',
    },
    {
      priority, // Higher number = higher priority
      delay: 0, // Execute immediately
    }
  );
}

// Add script refinement job
export async function addScriptRefinementJob(
  projectId: string,
  userId: string,
  originalScript: GeneratedScript,
  userFeedback: string,
  priority: number = 10 // Higher priority for refinements
): Promise<Job<ScriptGenerationJobData, ScriptJobResult>> {
  return await scriptQueue.add(
    'refine-script',
    {
      projectId,
      userId,
      input: {} as ScriptGenerationInput, // Not needed for refinement
      jobType: 'refine',
      originalScript,
      userFeedback,
    },
    {
      priority,
      delay: 0,
    }
  );
}

// Get job status
export async function getJobStatus(jobId: string): Promise<{
  status: string;
  progress: number;
  result?: ScriptJobResult;
  error?: string;
}> {
  const job = await Job.fromId(scriptQueue, jobId);
  
  if (!job) {
    return { status: 'not_found', progress: 0 };
  }

  const state = await job.getState();
  const progress = job.progress as number || 0;
  
  return {
    status: state,
    progress,
    result: job.returnvalue,
    error: job.failedReason,
  };
}

// Update database with script result
async function updateProjectWithScript(
  projectId: string, 
  script: GeneratedScript,
  jobId: string
): Promise<void> {
  try {
    const supabase = createServerComponentClient({ 
      cookies: async () => await cookies() 
    });

    const { error } = await supabase
      .from('projects')
      .update({
        generated_script: script,
        script_status: 'completed',
        script_job_id: jobId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (error) {
      console.error('Failed to update project with script:', error);
      throw error;
    }

    console.log(`✅ Updated project ${projectId} with generated script`);
  } catch (error) {
    console.error('Error updating project with script:', error);
    throw error;
  }
}

// Worker to process script generation jobs
export function createScriptWorker(): Worker<ScriptGenerationJobData, ScriptJobResult> {
  return new Worker<ScriptGenerationJobData, ScriptJobResult>(
    QUEUE_NAME,
    async (job: Job<ScriptGenerationJobData, ScriptJobResult>) => {
      const { projectId, userId, input, jobType, originalScript, userFeedback } = job.data;
      
      try {
        // Update progress
        await job.updateProgress(10);
        
        console.log(`🚀 Processing ${jobType} job for project ${projectId}`);
        
        let script: GeneratedScript;
        
        if (jobType === 'generate') {
          // Update progress
          await job.updateProgress(30);
          
          // Generate new script
          script = await generateScript(input);
          
          // Update progress
          await job.updateProgress(80);
        } else if (jobType === 'refine' && originalScript && userFeedback) {
          // Update progress
          await job.updateProgress(30);
          
          // Refine existing script
          script = await refineScript(originalScript, userFeedback);
          
          // Update progress
          await job.updateProgress(80);
        } else {
          throw new Error('Invalid job configuration');
        }
        
        // Update database
        await updateProjectWithScript(projectId, script, job.id!);
        
        // Complete the job
        await job.updateProgress(100);
        
        console.log(`✅ Completed ${jobType} job for project ${projectId}`);
        
        return {
          success: true,
          script,
        };
      } catch (error) {
        console.error(`❌ Failed ${jobType} job for project ${projectId}:`, error);
        
        // Update project status to failed
        try {
          const supabase = createServerComponentClient({ 
            cookies: async () => await cookies() 
          });
          
          await supabase
            .from('projects')
            .update({
              script_status: 'failed',
              script_job_id: job.id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', projectId);
        } catch (dbError) {
          console.error('Failed to update project status to failed:', dbError);
        }
        
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
    {
      connection: REDIS_CONNECTION,
      concurrency: 5, // Process up to 5 jobs simultaneously
    }
  );
}

// Initialize worker (call this in your app startup)
export function startScriptWorker(): Worker<ScriptGenerationJobData, ScriptJobResult> {
  const worker = createScriptWorker();
  
  worker.on('completed', (job, result) => {
    console.log(`✅ Job ${job.id} completed:`, result);
  });
  
  worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err);
  });
  
  worker.on('error', (err) => {
    console.error('❌ Worker error:', err);
  });
  
  console.log('🚀 Script generation worker started');
  
  return worker;
}

// Cleanup function
export async function cleanupQueue(): Promise<void> {
  await scriptQueue.close();
  await REDIS_CONNECTION.disconnect();
} 