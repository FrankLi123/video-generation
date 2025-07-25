import { startScriptWorker } from './script-queue';
import { createVideoWorker } from './video-queue';

let scriptWorker: any = null;
let videoWorkerInstance: any = null;

export function initializeWorkers() {
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_WORKERS === 'true') {
    try {
      console.log('🚀 Initializing background workers...');

      // Start script generation worker
      scriptWorker = startScriptWorker();

      // Start video generation worker
      videoWorkerInstance = createVideoWorker();
      videoWorkerInstance.on('ready', () => {
        console.log('✅ Video worker is ready');
      });

      console.log('✅ Background workers initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize background workers:', error);
    }
  } else {
    console.log('⏭️ Background workers disabled in development (set ENABLE_WORKERS=true to enable)');
  }
}

export function cleanupWorkers() {
  try {
    if (scriptWorker) {
      scriptWorker.close();
    }
    if (videoWorkerInstance) {
      videoWorkerInstance.close();
    }
    console.log('✅ Background workers cleaned up');
  } catch (error) {
    console.error('❌ Error cleaning up workers:', error);
  }
}

// Handle process termination
process.on('SIGTERM', cleanupWorkers);
process.on('SIGINT', cleanupWorkers); 