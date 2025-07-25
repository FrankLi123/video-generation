/**
 * Video Generation API Integration using fal.ai
 *
 * This module handles video generation using both:
 * 1. fal.ai's Veo 3 API (8 seconds, higher quality)
 * 2. fal.ai's Bytedance Seedance API (5 seconds, faster, default)
 */

export interface VideoGenerationInput {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '9:21';
  duration?: '5' | '10'; // Seedance only supports 5 or 10 seconds
  resolution?: '480p' | '720p' | '1080p';
  enhancePrompt?: boolean;
  generateAudio?: boolean;
  seed?: number;
  cameraFixed?: boolean;
  // Model selection - ONLY Seedance for now (Veo3 is too expensive)
  model?: 'seedance'; // Only seedance supported
  // Legacy fields for backward compatibility
  style?: 'realistic' | 'cinematic' | 'animated' | 'professional';
}

export interface VideoGenerationResult {
  videoUrl: string;
  duration: number;
  resolution: string;
  fileSize?: number;
  thumbnailUrl?: string;
  metadata: {
    generatedAt: string;
    prompt: string;
    aspectRatio: string;
  };
}

export interface VideoGenerationProgress {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  message?: string;
  result?: VideoGenerationResult;
}

class FalVeoClient {
  private falApiKey: string;
  private fastTestMode: boolean;

  constructor() {
    this.falApiKey = process.env.FAL_KEY || '';

    // Enable fast test mode only if no API key is provided OR explicitly set
    this.fastTestMode = !this.falApiKey || process.env.FAST_TEST_MODE === 'true';

    if (!this.falApiKey) {
      console.warn('⚠️ FAL_KEY not found, will use mock implementation');
      this.fastTestMode = true;
    } else {
      console.log('✅ fal.ai API key configured');
    }

    // 检查是否启用快速测试模式
    if (this.fastTestMode) {
      console.log('🚀 Fast test mode enabled - using accelerated mock processing');
    } else {
      console.log('🎬 Real API mode enabled - will make actual fal.ai calls');
    }
  }

  /**
   * 启用/禁用快速测试模式
   */
  setFastTestMode(enabled: boolean) {
    this.fastTestMode = enabled;
    console.log(`🚀 Fast test mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * 检查当前是否为快速测试模式
   */
  isFastTestMode(): boolean {
    return this.fastTestMode;
  }

  /**
   * Generate video using fal.ai Seedance (cost-effective, 5-second videos)
   */
  async generateVideo(input: VideoGenerationInput): Promise<{ jobId: string }> {
    // Force Seedance model only (Veo3 is too expensive)
    const model = 'seedance';
    console.log(`🎬 Starting fal.ai ${model} video generation:`, input.prompt);

    // Check if we should use mock mode
    if (this.fastTestMode) {
      console.log('🚀 Fast test mode: using accelerated mock implementation');
      return this.mockGenerateVideo(input);
    }

    if (!this.falApiKey) {
      console.log('❌ No API key found, falling back to mock implementation');
      return this.mockGenerateVideo(input);
    }

    console.log('🎬 Using REAL fal.ai API for video generation!');

    try {
      // Dynamic import to avoid build issues
      const { fal } = await import('@fal-ai/client');

      // Configure API key
      console.log('🔑 Configuring fal.ai client with API key...');
      fal.config({
        credentials: this.falApiKey
      });

      // Only use Seedance model (cost-effective)
      const modelEndpoint = "fal-ai/bytedance/seedance/v1/lite/text-to-video";

      // Map aspect ratios to Seedance supported values
      let aspectRatio = input.aspectRatio || "16:9";
      if (aspectRatio === "9:16") {
        console.warn('⚠️ Seedance does not support 9:16, using 16:9 instead');
        aspectRatio = "16:9";
      }

      const arguments_obj = {
        prompt: input.prompt,
        aspect_ratio: aspectRatio as "16:9" | "1:1" | "4:3" | "9:21",
        duration: input.duration || "5", // Default 5 seconds for Seedance
        resolution: input.resolution || "720p",
        ...(input.cameraFixed !== undefined && { camera_fixed: input.cameraFixed }),
        ...(input.seed && { seed: input.seed }),
      };

      console.log('� Submitting to fal.ai Seedance API:');
      console.log('🎯 Endpoint:', modelEndpoint);
      console.log('📋 Arguments:', JSON.stringify(arguments_obj, null, 2));
      console.log('💰 Expected cost: ~$0.05 per video');

      const startTime = Date.now();

      // Submit request
      const { request_id } = await fal.queue.submit(modelEndpoint, {
        input: arguments_obj
      });

      const submitTime = Date.now() - startTime;
      console.log('✅ fal.ai request submitted successfully!');
      console.log('🆔 Request ID:', request_id);
      console.log('⏱️ Submit time:', `${submitTime}ms`);
      console.log('🔄 Status polling will begin automatically...');

      // Return job ID in expected format
      return { jobId: request_id };

    } catch (error) {
      console.error('❌ fal.ai video generation failed:', error);

      // Fallback to mock if fal.ai fails
      console.log('🎭 Falling back to mock implementation');
      return this.mockGenerateVideo(input);
    }
  }

  /**
   * Get video generation status from fal.ai
   */
  async getJobStatus(jobId: string): Promise<VideoGenerationProgress> {
    console.log('📊 Checking fal.ai Seedance job status:', jobId);

    if (!this.falApiKey || jobId.startsWith('mock_')) {
      return this.mockGetJobStatus(jobId);
    }

    try {
      const { fal } = await import('@fal-ai/client');

      // Configure API key
      fal.config({
        credentials: this.falApiKey
      });

      // Only use Seedance endpoint
      const modelEndpoint = "fal-ai/bytedance/seedance/v1/lite/text-to-video";

      // Get status
      console.log('📡 Checking status with fal.ai...');
      const startTime = Date.now();

      const status = await fal.queue.status(modelEndpoint, {
        requestId: jobId,
        logs: true
      });

      const statusTime = Date.now() - startTime;
      console.log('📋 fal.ai Seedance status response received:');
      console.log('⏱️ Status check time:', `${statusTime}ms`);
      console.log('📊 Status:', status.status);
      console.log('📝 Full response:', JSON.stringify(status, null, 2));

      // Parse status
      if (status.status === 'COMPLETED') {
        console.log('🎉 Video generation completed! Fetching result...');

        // Get result
        const resultStartTime = Date.now();
        const result = await fal.queue.result(modelEndpoint, {
          requestId: jobId
        });

        const resultTime = Date.now() - resultStartTime;
        console.log('📥 Result fetched in:', `${resultTime}ms`);
        console.log('🎬 Video result:', JSON.stringify(result.data, null, 2));

        if (result.data && result.data.video && result.data.video.url) {
          console.log('✅ Video URL obtained:', result.data.video.url);
          console.log('📊 Video details:', {
            url: result.data.video.url,
            fileSize: result.data.video.file_size || 'unknown',
            contentType: result.data.video.content_type || 'video/mp4'
          });

          return {
            status: 'completed',
            progress: 100,
            message: 'Video generation completed',
            result: {
              videoUrl: result.data.video.url,
              duration: 5, // Seedance default duration
              resolution: '720p',
              metadata: {
                generatedAt: new Date().toISOString(),
                prompt: 'Generated via fal.ai Seedance',
                aspectRatio: '16:9',
              },
            },
          };
        } else {
          console.error('❌ Video result missing video URL');
          console.error('📋 Full result:', JSON.stringify(result, null, 2));
        }
      } else if (status.status === 'FAILED') {
        return {
          status: 'failed',
          progress: 0,
          message: 'Video generation failed',
        };
      } else {
        // Still processing
        return {
          status: 'processing',
          progress: 50, // Estimate
          message: 'Video generation in progress',
        };
      }

    } catch (error) {
      console.error('❌ fal.ai status check failed:', error);
      return this.mockGetJobStatus(jobId);
    }

    return {
      status: 'processing',
      progress: 50,
      message: 'Checking status...',
    };
  }

  /**
   * Mock implementation for testing
   */
  private async mockGenerateVideo(input: VideoGenerationInput): Promise<{ jobId: string }> {
    console.log('🎭 Using mock fal.ai implementation');
    const jobId = `mock_fal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ Mock job created:', jobId);
    return { jobId };
  }

  /**
   * Mock status checking
   */
  private mockGetJobStatus(jobId: string): VideoGenerationProgress {
    if (!jobId.startsWith('mock_fal_')) {
      return {
        status: 'failed',
        progress: 0,
        message: 'Invalid job ID',
      };
    }

    // Extract timestamp from job ID
    const parts = jobId.split('_');
    const timestamp = parseInt(parts[2]) || Date.now();
    const ageInSeconds = (Date.now() - timestamp) / 1000;

    // 🚀 加速 Mock 模式处理（用于快速测试）
    if (ageInSeconds < 2) {
      return {
        status: 'queued',
        progress: 0,
        message: 'Video generation queued',
      };
    } else if (ageInSeconds < 10) {
      const progress = Math.min(90, (ageInSeconds - 2) * 11.25); // 8秒内完成90%
      return {
        status: 'processing',
        progress: Math.round(progress),
        message: 'Generating video with fal.ai Veo 3...',
      };
    } else {
      return {
        status: 'completed',
        progress: 100,
        message: 'Video generation completed',
        result: {
          videoUrl: `https://mock-fal-storage.example.com/videos/${jobId}.mp4`,
          duration: 8,
          resolution: '720p',
          fileSize: 15728640,
          thumbnailUrl: `https://mock-fal-storage.example.com/thumbnails/${jobId}.jpg`,
          metadata: {
            generatedAt: new Date().toISOString(),
            prompt: 'Mock generated video via fal.ai',
            aspectRatio: '16:9',
          },
        },
      };
    }
  }
}

// Create singleton instance
const falVeoClient = new FalVeoClient();

// Export functions for compatibility
export async function generateVideo(input: VideoGenerationInput): Promise<{ jobId: string }> {
  return falVeoClient.generateVideo(input);
}

export async function getVideoJobStatus(jobId: string): Promise<VideoGenerationProgress> {
  return falVeoClient.getJobStatus(jobId);
}

export async function getVideoJobResult(jobId: string): Promise<VideoGenerationResult | null> {
  const status = await falVeoClient.getJobStatus(jobId);
  return status.result || null;
}

/**
 * Convert a script scene to a video generation prompt
 */
export function sceneToVideoPrompt(scene: any): string {
  if (!scene) return 'A professional video presentation';
  
  const { description, action, setting, mood } = scene;
  
  let prompt = '';
  
  if (description) prompt += description;
  if (action) prompt += ` ${action}`;
  if (setting) prompt += ` in ${setting}`;
  if (mood) prompt += `, ${mood} mood`;
  
  return prompt || 'A professional developer presentation';
}

// 便捷控制函数
export function enableFastTestMode() {
  falVeoClient.setFastTestMode(true);
  console.log('🚀 Fast test mode enabled - videos will generate in ~10 seconds using mock');
}

export function enableRealAPI() {
  falVeoClient.setFastTestMode(false);
  console.log('🎬 Real API mode enabled - will use actual fal.ai (costs money!)');
}

export function isFastTestMode(): boolean {
  return falVeoClient.isFastTestMode();
}

export default falVeoClient;
